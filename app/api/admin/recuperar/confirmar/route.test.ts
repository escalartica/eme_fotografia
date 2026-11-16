// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { __resetRateLimits } from '@/lib/auth/rate-limit';

/**
 * Canjear el enlace y poner la contraseña nueva. Es la puerta trasera del
 * panel: aquí se fija que solo entra quien trae el enlace bueno, una sola
 * vez, y que al cambiarla se cierran todas las sesiones de antes.
 */

const dataRoot = createTempDataRoot('eme-api-recuperar-confirmar-');
const dataDir = path.join(dataRoot.root, 'data');

let route: typeof import('./route');
let recovery: typeof import('@/lib/admin-recovery');
let adminStore: typeof import('@/lib/admin-store');
let sessions: typeof import('@/lib/auth/session');

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    route: await import('./route'),
    recovery: await import('@/lib/admin-recovery'),
    adminStore: await import('@/lib/admin-store'),
    sessions: await import('@/lib/auth/session'),
  }));
  ({ route, recovery, adminStore, sessions } = loaded);
});

beforeEach(async () => {
  // Una cuenta configurada como en producción: sin esto el panel cae en las
  // credenciales de desarrollo, que no leen la contraseña guardada.
  vi.stubEnv('ADMIN_USERNAME', 'estudio');
  vi.stubEnv('ADMIN_PASSWORD', 'la-contrasena-de-siempre-1');
  vi.stubEnv('ADMIN_PASSWORD_HASH', '');
  __resetRateLimits();
  adminStore.__resetAdminCredentialsCache();
  await fs.rm(dataDir, { recursive: true, force: true });
});

afterAll(async () => {
  vi.unstubAllEnvs();
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

const NUEVA = 'una-contrasena-larga-2026';

function confirmar(cuerpo: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/admin/recuperar/confirmar', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });
}

describe('POST /api/admin/recuperar/confirmar', () => {
  it('con el enlace bueno cambia la contraseña y cierra las sesiones abiertas', async () => {
    const { username } = await adminStore.getAdminCredentials();
    const { token: sesionVieja } = await sessions.createSession('admin', username, username);
    const { token } = await recovery.crearToken();

    const res = await route.POST(confirmar({ token, password: NUEVA }));
    expect(res.status).toBe(200);

    expect(await adminStore.verifyAdminLogin(username, NUEVA)).toBe(true);
    expect(await adminStore.verifyAdminLogin(username, 'la-contrasena-de-siempre-1')).toBe(false);
    expect(await sessions.getSession(sesionVieja)).toBeNull();
  });

  it('el enlace sirve una sola vez', async () => {
    const { token } = await recovery.crearToken();
    expect((await route.POST(confirmar({ token, password: NUEVA }))).status).toBe(200);
    const otra = await route.POST(confirmar({ token, password: 'otra-contrasena-larga-99' }));
    expect(otra.status).toBe(400);
    expect((await otra.json()).error).toMatch(/ya no sirve/);
  });

  it('dos canjes a la vez del mismo enlace: solo gana uno', async () => {
    const { token } = await recovery.crearToken();
    const [a, b] = await Promise.all([
      route.POST(confirmar({ token, password: NUEVA })),
      route.POST(confirmar({ token, password: 'otra-contrasena-larga-99' })),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 400]);
  });

  it('un enlace inventado no cambia nada', async () => {
    await recovery.crearToken();
    const res = await route.POST(confirmar({ token: 'inventado', password: NUEVA }));
    expect(res.status).toBe(400);
    expect(await recovery.passwordGuardada()).toBeNull();
  });

  it('una contraseña corta se rechaza SIN gastar el enlace', async () => {
    const { token } = await recovery.crearToken();
    const res = await route.POST(confirmar({ token, password: 'corta' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/al menos 12/);
    expect(await recovery.tokenValido(token)).toBe(true);
  });

  it.each([
    ['JSON roto', '{roto'],
    ['sin token', { password: NUEVA }],
    ['token que no es texto', { token: 1, password: NUEVA }],
  ])('%s es un 400', async (_nombre, cuerpo) => {
    expect((await route.POST(confirmar(cuerpo))).status).toBe(400);
  });

  it('rechaza la petición desde otra web', async () => {
    const { token } = await recovery.crearToken();
    const res = await route.POST(confirmar({ token, password: NUEVA }, { origin: 'https://atacante.example' }));
    expect(res.status).toBe(403);
    expect(await recovery.tokenValido(token)).toBe(true);
  });

  it('pone techo a probar enlaces, aunque cambie la IP', async () => {
    const estados = [];
    for (let i = 1; i <= 12; i++) {
      estados.push(
        (await route.POST(confirmar({ token: `t${i}`, password: NUEVA }, { 'x-real-ip': `198.51.100.${i}` }))).status
      );
    }
    expect(estados.slice(0, 10).every((s) => s === 400)).toBe(true);
    expect(estados.slice(10)).toEqual([429, 429]);
  });

  it('rechaza un cuerpo enorme', async () => {
    const res = await route.POST(confirmar({ token: 'x', password: 'y'.repeat(20_000) }));
    expect(res.status).toBe(400);
  });
});
