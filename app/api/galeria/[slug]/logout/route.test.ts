// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { CLIENT_COOKIE } from '@/lib/auth/cookies';

/** Cerrar sesión tiene que matar la sesión en el servidor, no solo borrar la
 *  cookie del navegador: una cookie copiada antes del logout no puede seguir
 *  abriendo nada. */

const mocks = vi.hoisted(() => ({ jar: {} as Record<string, string> }));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
}));

const dataRoot = createTempDataRoot('eme-api-logout-galeria-');

let route: typeof import('./route');
let sessions: typeof import('@/lib/auth/session');

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    route: await import('./route'),
    sessions: await import('@/lib/auth/session'),
  }));
  ({ route, sessions } = loaded);
});

beforeEach(() => {
  mocks.jar = {};
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

function salir(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/galeria/boda-ana-y-luis/logout', { method: 'POST', headers });
}

describe('POST /api/galeria/boda-ana-y-luis/logout', () => {
  it('destruye la sesión en el servidor y caduca la cookie', async () => {
    const { token } = await sessions.createSession('client', 'boda-ana-y-luis', 'boda-ana-y-luis');
    mocks.jar[CLIENT_COOKIE] = token;

    const res = await route.POST(salir());
    expect(res.status).toBe(200);
    expect(await sessions.getSession(token)).toBeNull();
    const cookie = res.headers.get('set-cookie') ?? '';
    expect(cookie).toContain(`${CLIENT_COOKIE}=;`);
    expect(cookie).toMatch(/Max-Age=0/i);
  });

  it('sin sesión también responde bien (cerrar dos veces no es un error)', async () => {
    expect((await route.POST(salir())).status).toBe(200);
  });

  it('no deja que otra web cierre la sesión de nadie', async () => {
    const { token } = await sessions.createSession('client', 'boda-ana-y-luis', 'boda-ana-y-luis');
    mocks.jar[CLIENT_COOKIE] = token;
    const res = await route.POST(salir({ origin: 'https://atacante.example' }));
    expect(res.status).toBe(403);
    expect(await sessions.getSession(token)).not.toBeNull();
  });
});
