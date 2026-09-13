// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { CLIENT_COOKIE } from '@/lib/auth/cookies';
import { hashPassword } from '@/lib/auth/password';
import { __resetRateLimits } from '@/lib/auth/rate-limit';

const dataRoot = createTempDataRoot('eme-api-galeria-login-');
const dataDir = path.join(dataRoot.root, 'data');

const SLUG = 'boda-ana-y-luis';
const USUARIO = 'ana';
const CONTRASENA = 'contra-segura-1234';

let route: typeof import('./route');
let store: typeof import('@/lib/gallery-store');
let sessions: typeof import('@/lib/auth/session');

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    route: await import('./route'),
    store: await import('@/lib/gallery-store'),
    sessions: await import('@/lib/auth/session'),
  }));
  route = loaded.route;
  store = loaded.store;
  sessions = loaded.sessions;
});

beforeEach(async () => {
  __resetRateLimits();
  await store.saveGalleryMeta({
    slug: SLUG,
    clientName: 'Ana y Luis',
    username: USUARIO,
    passwordHash: await hashPassword(CONTRASENA),
    createdAt: '2026-09-01T10:00:00.000Z',
    photos: [{ id: 'foto-1', filename: 'foto-1.jpg', alt: 'Foto 1' }],
  });
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

function login(body: unknown, headers: Record<string, string> = {}, url = `http://localhost:3000/api/galeria/${SLUG}/login`) {
  return new Request(url, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
const ctx = (slug: string = SLUG) => ({ params: Promise.resolve({ slug }) });

describe('POST /api/galeria/[slug]/login', () => {
  it('returns 403 when the request comes from another site', async () => {
    const res = await route.POST(login({ username: USUARIO, password: CONTRASENA }, { origin: 'https://otro.example' }), ctx());
    expect(res.status).toBe(403);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await route.POST(login('{esto-no-es-json'), ctx());
    expect(res.status).toBe(400);
  });

  it('returns 400 when username or password are missing or not strings', async () => {
    expect((await route.POST(login({ username: USUARIO }), ctx())).status).toBe(400);
    expect((await route.POST(login({ password: CONTRASENA }), ctx())).status).toBe(400);
    expect((await route.POST(login({ username: '', password: '' }), ctx())).status).toBe(400);
    expect((await route.POST(login({ username: 1, password: true }), ctx())).status).toBe(400);
  });

  it('returns 401 without a cookie for the wrong password', async () => {
    const res = await route.POST(login({ username: USUARIO, password: 'no-es-esta-1234' }), ctx());
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('gives the very same answer for a wrong user, a wrong password and a gallery that does not exist', async () => {
    // Si los tres se distinguieran, cualquiera podría averiguar qué enlaces de
    // galería existen y qué usuario tiene cada boda simplemente probando.
    const malaContrasena = await route.POST(login({ username: USUARIO, password: 'no-es-esta-1234' }), ctx());
    const malUsuario = await route.POST(login({ username: 'otro', password: CONTRASENA }), ctx());
    const noExiste = await route.POST(login({ username: USUARIO, password: CONTRASENA }), ctx('boda-que-no-existe'));

    expect([malaContrasena.status, malUsuario.status, noExiste.status]).toEqual([401, 401, 401]);
    const cuerpos = await Promise.all([malaContrasena.json(), malUsuario.json(), noExiste.json()]);
    expect(cuerpos[1]).toEqual(cuerpos[0]);
    expect(cuerpos[2]).toEqual(cuerpos[0]);
  });

  it('opens a session scoped to this gallery for the right credentials', async () => {
    const res = await route.POST(login({ username: USUARIO, password: CONTRASENA }), ctx());
    expect(res.status).toBe(200);

    const cookie = res.cookies.get(CLIENT_COOKIE);
    expect(cookie).toBeDefined();
    // HttpOnly: el JavaScript de la página nunca debe poder leer la sesión.
    expect(cookie!.httpOnly).toBe(true);
    expect(cookie!.sameSite).toBe('lax');
    expect(cookie!.maxAge).toBe(30 * 24 * 60 * 60);

    const session = await sessions.getSession(cookie!.value);
    expect(session!.role).toBe('client');
    // El `subject` es lo que impide que esta sesión abra la boda de otra pareja.
    expect(session!.subject).toBe(SLUG);
    expect(session!.username).toBe(USUARIO);
  });

  /**
   * EL IPHONE PONE LA PRIMERA LETRA EN MAYÚSCULA, y el usuario de una pareja
   * es siempre un slug en minúsculas. Sin esto, «Ana» no entraba y el mensaje
   * --que a propósito no dice cuál de los dos datos está mal-- no daba
   * ninguna pista. El campo ya lleva `autoCapitalize="none"`; esto es la otra
   * mitad, para quien pega el dato desde el WhatsApp del estudio.
   */
  it('entra igual con el usuario en mayúsculas o con espacios pegados', async () => {
    for (const escrito of ['Ana', 'ANA', '  ana  ', ' Ana']) {
      __resetRateLimits();
      const res = await route.POST(login({ username: escrito, password: CONTRASENA }), ctx());
      expect(res.status, escrito).toBe(200);

      const session = await sessions.getSession(res.cookies.get(CLIENT_COOKIE)!.value);
      // El usuario que se guarda en la sesión es el de la galería, no lo que
      // escribió la pareja: así el panel no enseña «  Ana  ».
      expect(session!.username).toBe(USUARIO);
    }
  });

  it('does not open a session for a gallery whose slug is a traversal attempt', async () => {
    const res = await route.POST(login({ username: USUARIO, password: CONTRASENA }), ctx('../../etc'));
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('returns 429 after too many failed attempts from the same address', async () => {
    // Fuerza bruta contra la contraseña de la boda de un cliente.
    for (let i = 0; i < 8; i++) {
      expect((await route.POST(login({ username: USUARIO, password: 'mal' }), ctx())).status).toBe(401);
    }
    expect((await route.POST(login({ username: USUARIO, password: 'mal' }), ctx())).status).toBe(429);
  });

  it('keeps refusing even when the attacker changes IP on every request', async () => {
    // X-Forwarded-For lo pone quien llama. El cubo por galería no depende de
    // ninguna cabecera y es el único techo real.
    for (let i = 0; i < 40; i++) {
      const res = await route.POST(login({}, { 'x-forwarded-for': `10.0.0.${i}` }), ctx());
      expect(res.status, `intento ${i}`).toBe(400);
    }
    const res = await route.POST(login({}, { 'x-forwarded-for': '10.0.9.9' }), ctx());
    expect(res.status).toBe(429);
  });

  it('does not let one gallery lock another one out', async () => {
    for (let i = 0; i < 8; i++) await route.POST(login({ username: USUARIO, password: 'mal' }), ctx());
    expect((await route.POST(login({ username: USUARIO, password: 'mal' }), ctx())).status).toBe(429);
    // Otra boda distinta sigue pudiendo entrar.
    expect((await route.POST(login({}, {}), ctx('boda-de-otra-pareja'))).status).toBe(400);
  });
});
