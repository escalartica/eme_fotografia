// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { ADMIN_COOKIE } from '@/lib/auth/cookies';
import { hashPassword } from '@/lib/auth/password';
import { __resetRateLimits } from '@/lib/auth/rate-limit';
import { __resetAdminCredentialsCache } from '@/lib/admin-store';

const USUARIO = 'estudio';
const CONTRASENA = 'una-contrasena-muy-larga';
/** La contraseña que traía escrita el código antes de que las credenciales
 * salieran del entorno. */
const CONTRASENA_RETIRADA = 'EME-fotografia-2026';

const dataRoot = createTempDataRoot('eme-api-admin-login-');
const dataDir = path.join(dataRoot.root, 'data');

let route: typeof import('./route');
let sessions: typeof import('@/lib/auth/session');
let hash: string;

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    route: await import('./route'),
    sessions: await import('@/lib/auth/session'),
  }));
  route = loaded.route;
  sessions = loaded.sessions;
  // Una sola vez: scrypt es caro a propósito.
  hash = await hashPassword(CONTRASENA);
});

beforeEach(() => {
  __resetRateLimits();
  __resetAdminCredentialsCache();
  vi.stubEnv('ADMIN_USERNAME', USUARIO);
  vi.stubEnv('ADMIN_PASSWORD_HASH', hash);
  vi.stubEnv('ADMIN_PASSWORD', undefined);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  __resetAdminCredentialsCache();
  await fs.rm(dataDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

function login(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/admin/login', () => {
  it('returns 403 when the request comes from another site', async () => {
    // Sin esto, una web cualquiera podría lanzar intentos de login contra el
    // panel desde el navegador de quien la visite.
    const res = await route.POST(login({ username: USUARIO, password: CONTRASENA }, { origin: 'https://otro.example' }));
    expect(res.status).toBe(403);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('returns 400 for a malformed JSON body', async () => {
    expect((await route.POST(login('{no-es-json'))).status).toBe(400);
  });

  it('returns 400 when the fields are missing or not strings', async () => {
    expect((await route.POST(login({}))).status).toBe(400);
    expect((await route.POST(login({ username: USUARIO }))).status).toBe(400);
    expect((await route.POST(login({ username: '', password: '' }))).status).toBe(400);
    expect((await route.POST(login({ username: 1, password: 2 }))).status).toBe(400);
  });

  it('returns 401 without a cookie for wrong credentials', async () => {
    const malaContrasena = await route.POST(login({ username: USUARIO, password: 'otra-cosa-distinta' }));
    expect(malaContrasena.status).toBe(401);
    expect(malaContrasena.headers.get('set-cookie')).toBeNull();

    const malUsuario = await route.POST(login({ username: 'otro', password: CONTRASENA }));
    expect(malUsuario.status).toBe(401);
    // El mismo mensaje para los dos: no se puede averiguar si el usuario existe.
    expect(await malUsuario.json()).toEqual(await malaContrasena.json());
  });

  it('refuses the password this repository used to ship hardcoded', async () => {
    // CANDADO. Esa contraseña la podía leer cualquiera en el repositorio: con
    // ella se entraba al panel, se creaban galerías y se leían los datos
    // personales del formulario de contacto.
    for (const usuario of [USUARIO, 'eme', 'admin']) {
      const res = await route.POST(login({ username: usuario, password: CONTRASENA_RETIRADA }));
      expect(res.status, `usuario=${usuario}`).toBe(401);
      expect(res.headers.get('set-cookie')).toBeNull();
    }
  });

  it('opens an admin session for the configured credentials', async () => {
    const res = await route.POST(login({ username: USUARIO, password: CONTRASENA }));
    expect(res.status).toBe(200);

    const cookie = res.cookies.get(ADMIN_COOKIE);
    expect(cookie).toBeDefined();
    expect(cookie!.httpOnly).toBe(true);
    expect(cookie!.sameSite).toBe('lax');
    expect(cookie!.maxAge).toBe(7 * 24 * 60 * 60);

    const session = await sessions.getSession(cookie!.value);
    expect(session!.role).toBe('admin');
    expect(session!.subject).toBe(USUARIO);
  });

  it('answers with the same generic 401 when the server has no account configured', async () => {
    // Que /admin exista pero esté sin configurar es información que no le hace
    // falta a nadie de fuera: el detalle va al log del servidor.
    vi.stubEnv('ADMIN_USERNAME', undefined);
    vi.stubEnv('ADMIN_PASSWORD_HASH', undefined);
    vi.stubEnv('NODE_ENV', 'production');
    __resetAdminCredentialsCache();
    const consola = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const res = await route.POST(login({ username: USUARIO, password: CONTRASENA }));
      expect(res.status).toBe(401);
      const { error } = (await res.json()) as { error: string };
      expect(error).not.toMatch(/ADMIN_USERNAME|ADMIN_PASSWORD|configuraci/i);
    } finally {
      consola.mockRestore();
    }
  });

  it('returns 429 after too many attempts from the same address', async () => {
    for (let i = 0; i < 8; i++) {
      expect((await route.POST(login({}))).status).toBe(400);
    }
    expect((await route.POST(login({}))).status).toBe(429);
  });

  it('keeps refusing even when the attacker changes IP on every request', async () => {
    // El cubo por IP sale de X-Forwarded-For, que cualquiera falsifica. El cubo
    // global -- GLOBAL_MAX intentos cada 15 min contra la única cuenta que
    // existe -- es el único techo real, y es lo que este test protege.
    // El número se importa del propio módulo: escrito a mano aquí, esta
    // prueba se rompió en cuanto el techo bajó de 40 a 15.
    for (let i = 0; i < route.GLOBAL_MAX; i++) {
      const res = await route.POST(login({}, { 'x-forwarded-for': `10.0.0.${i}` }));
      expect(res.status, `intento ${i}`).toBe(400);
    }
    const res = await route.POST(login({ username: USUARIO, password: CONTRASENA }, { 'x-forwarded-for': '10.0.9.9' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('set-cookie')).toBeNull();
  });
});
