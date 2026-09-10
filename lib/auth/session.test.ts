// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createTempDataRoot } from '../test-helpers/temp-data-root';
import { ADMIN_COOKIE, CLIENT_COOKIE } from './cookies';

// El tarro de cookies que ven getAdminSession/getClientSession. Fuera de una
// petición real de Next, `cookies()` no existe, así que es la única manera de
// ejercitar el guardián de sesión que usan TODAS las páginas y rutas privadas.
const mocks = vi.hoisted(() => ({ jar: {} as Record<string, string> }));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
}));

const dataRoot = createTempDataRoot('eme-sessions-');
const sessionsDir = path.join(dataRoot.root, 'data', 'sessions');

let sessions: typeof import('./session');
let requireSession: typeof import('./require-session');

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    sessions: await import('./session'),
    requireSession: await import('./require-session'),
  }));
  sessions = loaded.sessions;
  requireSession = loaded.requireSession;
});

beforeEach(() => {
  mocks.jar = {};
});

afterEach(async () => {
  await fs.rm(sessionsDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

/** Adelanta en disco la caducidad de la única sesión guardada. Se hace sobre el
 * fichero que el propio módulo ha escrito, sin reconstruir su nombre. */
async function expireStoredSession(): Promise<void> {
  const files = await fs.readdir(sessionsDir);
  expect(files).toHaveLength(1);
  const file = path.join(sessionsDir, files[0]);
  const record = JSON.parse(await fs.readFile(file, 'utf-8'));
  record.expiresAt = new Date(Date.now() - 1000).toISOString();
  await fs.writeFile(file, JSON.stringify(record));
}

describe('createSession', () => {
  it('issues an opaque token and the matching cookie lifetime for an admin', async () => {
    const { token, maxAgeSeconds } = await sessions.createSession('admin', 'estudio', 'estudio');
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(maxAgeSeconds).toBe(7 * 24 * 60 * 60);
  });

  it('gives a client gallery session the longer 30-day lifetime', async () => {
    // Los clientes vuelven a su galería a lo largo de semanas mientras deciden:
    // una sesión corta les pediría la contraseña en cada visita.
    const { maxAgeSeconds } = await sessions.createSession('client', 'boda-ana', 'ana');
    expect(maxAgeSeconds).toBe(30 * 24 * 60 * 60);
  });

  it('never writes the token itself to disk', async () => {
    // En disco solo va el SHA-256 del token. Si se guardara el token, una copia
    // de seguridad filtrada o un directorio mal servido daría cookies válidas
    // listas para usar.
    const { token } = await sessions.createSession('client', 'boda-ana', 'ana');
    const files = await fs.readdir(sessionsDir);
    for (const file of files) {
      expect(await fs.readFile(path.join(sessionsDir, file), 'utf-8')).not.toContain(token);
      expect(file).not.toContain(token);
    }
  });

  it('issues a different token every time', async () => {
    const a = await sessions.createSession('client', 'boda-ana', 'ana');
    const b = await sessions.createSession('client', 'boda-ana', 'ana');
    expect(a.token).not.toBe(b.token);
  });
});

describe('getSession', () => {
  it('reads back what was stored', async () => {
    const { token } = await sessions.createSession('client', 'boda-ana', 'ana');
    const session = await sessions.getSession(token);
    expect(session).not.toBeNull();
    expect(session!.role).toBe('client');
    expect(session!.subject).toBe('boda-ana');
    expect(session!.username).toBe('ana');
    expect(Number.isNaN(Date.parse(session!.expiresAt))).toBe(false);
    expect(Date.parse(session!.expiresAt)).toBeGreaterThan(Date.now());
  });

  it('scopes a client session to one gallery only', async () => {
    // El `subject` es lo único que impide que la sesión de la boda de Ana sirva
    // para abrir la boda de Eva.
    const ana = await sessions.createSession('client', 'boda-ana', 'ana');
    const eva = await sessions.createSession('client', 'boda-eva', 'eva');
    expect((await sessions.getSession(ana.token))!.subject).toBe('boda-ana');
    expect((await sessions.getSession(eva.token))!.subject).toBe('boda-eva');
  });

  it('returns null for a token nobody issued, and for no token at all', async () => {
    expect(await sessions.getSession(undefined)).toBeNull();
    expect(await sessions.getSession('')).toBeNull();
    expect(await sessions.getSession('token-inventado')).toBeNull();
    // Un token con forma de ruta no puede hacer que se lea otro fichero: lo que
    // se abre es el hash del token, no el token.
    expect(await sessions.getSession('../../galleries/boda-ana/meta.json')).toBeNull();
  });

  it('refuses an expired session and removes it', async () => {
    const { token } = await sessions.createSession('client', 'boda-ana', 'ana');
    await expireStoredSession();
    expect(await sessions.getSession(token)).toBeNull();
    expect(await fs.readdir(sessionsDir)).toHaveLength(0);
  });
});

describe('destroySession', () => {
  it('makes the token stop working immediately', async () => {
    // Es la diferencia con un JWT firmado: cerrar sesión revoca de verdad.
    const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
    expect(await sessions.getSession(token)).not.toBeNull();
    await sessions.destroySession(token);
    expect(await sessions.getSession(token)).toBeNull();
  });

  it('is idempotent and tolerates a missing token', async () => {
    const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
    await sessions.destroySession(token);
    await expect(sessions.destroySession(token)).resolves.toBeUndefined();
    await expect(sessions.destroySession(undefined)).resolves.toBeUndefined();
    await expect(sessions.destroySession('token-inventado')).resolves.toBeUndefined();
  });

  it("does not touch another client's session", async () => {
    const ana = await sessions.createSession('client', 'boda-ana', 'ana');
    const eva = await sessions.createSession('client', 'boda-eva', 'eva');
    await sessions.destroySession(ana.token);
    expect(await sessions.getSession(eva.token)).not.toBeNull();
  });
});

describe('limpieza de sesiones caducadas', () => {
  it('purges expired session files when a new session is created', async () => {
    // Sin este barrido, la sesión del cliente que abrió su galería una vez y no
    // volvió se queda en disco para siempre: data/sessions/ solo crece.
    await sessions.createSession('client', 'boda-ana', 'ana');
    await expireStoredSession();
    await sessions.createSession('client', 'boda-eva', 'eva');
    expect(await fs.readdir(sessionsDir)).toHaveLength(1);
  });
});

describe('getClientSession / getAdminSession', () => {
  it('accepts the client session of the gallery being asked for', async () => {
    const { token } = await sessions.createSession('client', 'boda-ana', 'ana');
    mocks.jar[CLIENT_COOKIE] = token;
    expect(await requireSession.getClientSession('boda-ana')).not.toBeNull();
  });

  it("refuses another gallery's client session", async () => {
    // Este es el caso que el cliente quiere garantizado: una pareja con sesión
    // abierta no puede ver las fotos de otra boda cambiando el slug de la URL.
    const { token } = await sessions.createSession('client', 'boda-ana', 'ana');
    mocks.jar[CLIENT_COOKIE] = token;
    expect(await requireSession.getClientSession('boda-eva')).toBeNull();
  });

  it('refuses an admin session presented in the client cookie', async () => {
    const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
    mocks.jar[CLIENT_COOKIE] = token;
    expect(await requireSession.getClientSession('estudio')).toBeNull();
  });

  it('refuses a client session presented in the admin cookie', async () => {
    // Sin la comprobación de rol, un cliente cualquiera con su cookie copiada
    // al nombre de la del panel entraría en /admin.
    const { token } = await sessions.createSession('client', 'boda-ana', 'ana');
    mocks.jar[ADMIN_COOKIE] = token;
    expect(await requireSession.getAdminSession()).toBeNull();
  });

  it('accepts a real admin session', async () => {
    const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
    mocks.jar[ADMIN_COOKIE] = token;
    const session = await requireSession.getAdminSession();
    expect(session).not.toBeNull();
    expect(session!.subject).toBe('estudio');
  });

  it('returns null when there is no cookie at all', async () => {
    expect(await requireSession.getAdminSession()).toBeNull();
    expect(await requireSession.getClientSession('boda-ana')).toBeNull();
  });

  it('returns null once the session has been revoked', async () => {
    const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
    mocks.jar[ADMIN_COOKIE] = token;
    await sessions.destroySession(token);
    expect(await requireSession.getAdminSession()).toBeNull();
  });
});
