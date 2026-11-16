// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { __resetRateLimits } from '@/lib/auth/rate-limit';

/**
 * Pedir el enlace para cambiar la contraseña del panel. Es una ruta pública
 * que manda correos, así que lo que importa es: que no se pueda disparar desde
 * otra web, que tenga techo, y que si el correo falla el enlace no quede vivo.
 */

const mocks = vi.hoisted(() => ({
  configurado: true,
  enviar: vi.fn(async (_enlace: string, _expira: Date) => {}),
}));
vi.mock('@/lib/mail', () => ({
  isMailConfigured: () => mocks.configurado,
  enviarEnlaceDeRecuperacion: mocks.enviar,
}));

const dataRoot = createTempDataRoot('eme-api-recuperar-');
const adminDir = path.join(dataRoot.root, 'data', 'admin');

let route: typeof import('./route');
let recovery: typeof import('@/lib/admin-recovery');

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    route: await import('./route'),
    recovery: await import('@/lib/admin-recovery'),
  }));
  route = loaded.route;
  recovery = loaded.recovery;
});

beforeEach(async () => {
  __resetRateLimits();
  mocks.configurado = true;
  mocks.enviar.mockReset();
  mocks.enviar.mockImplementation(async () => {});
  await fs.rm(adminDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

function pedir(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/admin/recuperar', { method: 'POST', headers });
}

describe('POST /api/admin/recuperar', () => {
  it('manda un enlace que de verdad sirve', async () => {
    const res = await route.POST(pedir());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Date.parse(json.expiraEn)).toBeGreaterThan(Date.now());

    expect(mocks.enviar).toHaveBeenCalledTimes(1);
    const enlace = mocks.enviar.mock.calls[0][0];
    expect(enlace).toMatch(/\/admin\/recuperar\/[A-Za-z0-9_-]{43}$/);
    const token = enlace.split('/').pop()!;
    expect(await recovery.tokenValido(token)).toBe(true);
  });

  it('rechaza la petición desde otra web', async () => {
    const res = await route.POST(pedir({ origin: 'https://atacante.example' }));
    expect(res.status).toBe(403);
    expect(mocks.enviar).not.toHaveBeenCalled();
  });

  it('dice claramente que el correo no está configurado', async () => {
    mocks.configurado = false;
    const res = await route.POST(pedir());
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/no está configurado/);
  });

  it('si el correo falla, el enlace no queda vivo', async () => {
    const espia = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.enviar.mockRejectedValueOnce(new Error('SMTP caído'));
    const res = await route.POST(pedir());
    expect(res.status).toBe(502);
    await expect(fs.access(path.join(adminDir, 'reset.json'))).rejects.toThrow();
    espia.mockRestore();
  });

  it('no deja mandar más de tres correos por hora aunque cambie la IP', async () => {
    const estados = [];
    for (let i = 1; i <= 5; i++) {
      estados.push((await route.POST(pedir({ 'x-real-ip': `198.51.100.${i}` }))).status);
    }
    expect(estados).toEqual([200, 200, 200, 429, 429]);
    expect(mocks.enviar).toHaveBeenCalledTimes(3);
  });
});
