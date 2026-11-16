// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { __resetRateLimits } from '@/lib/auth/rate-limit';

/**
 * El beacon de visitas era la única ruta pública sin una sola prueba. Lo que
 * se fija aquí es lo que protege al estudio: que no se pueda escribir desde
 * otro dominio, que un bot no cuente, que un cuerpo raro no tumbe la ruta y
 * que la IP inventada en X-Forwarded-For no fabrique visitantes únicos.
 */

const mocks = vi.hoisted(() => ({ headers: new Headers() }));
vi.mock('next/headers', () => ({ headers: async () => mocks.headers }));

const dataRoot = createTempDataRoot('eme-api-hit-');
const analyticsDir = path.join(dataRoot.root, 'data', 'analytics');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1';

let route: typeof import('./route');

beforeAll(async () => {
  route = await dataRoot.load(() => import('./route'));
});

beforeEach(async () => {
  __resetRateLimits();
  await fs.rm(analyticsDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

function beacon(cuerpo: unknown, headers: Record<string, string> = {}): Request {
  const h = { 'user-agent': UA, host: 'www.emefotografiasevilla.com', ...headers };
  mocks.headers = new Headers(h);
  return new Request('http://localhost:3000/api/hit', {
    method: 'POST',
    headers: h,
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });
}

async function lineasDeHoy(): Promise<Array<Record<string, unknown>>> {
  const dia = new Date().toISOString().slice(0, 10);
  try {
    const raw = await fs.readFile(path.join(analyticsDir, `${dia}.ndjson`), 'utf-8');
    return raw.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

describe('POST /api/hit', () => {
  it('apunta una visita con la página, el origen y el dispositivo', async () => {
    const res = await route.POST(
      beacon({ p: '/trabajos?utm=x', r: 'https://www.instagram.com/p/abc', w: 1440, u: 'ig-otono' })
    );
    expect(res.status).toBe(204);
    const [linea] = await lineasDeHoy();
    expect(linea).toMatchObject({ p: '/trabajos', r: 'instagram.com', d: 'escritorio', u: 'ig-otono' });
    expect(linea.v).toMatch(/^[0-9a-f]{12}$/);
  });

  it('rechaza un beacon desde otro dominio', async () => {
    const res = await route.POST(beacon({ p: '/' }, { origin: 'https://otro-sitio.com' }));
    expect(res.status).toBe(403);
    expect(await lineasDeHoy()).toEqual([]);
  });

  it('no cuenta a los bots ni a quien no manda User-Agent', async () => {
    expect((await route.POST(beacon({ p: '/' }, { 'user-agent': 'Googlebot/2.1' }))).status).toBe(204);
    expect(await lineasDeHoy()).toEqual([]);
  });

  it('no apunta las rutas del panel ni de la API', async () => {
    await route.POST(beacon({ p: '/admin/galerias' }));
    await route.POST(beacon({ p: '/api/contacto' }));
    expect(await lineasDeHoy()).toEqual([]);
  });

  it('un JSON roto es un 400, no un 500', async () => {
    expect((await route.POST(beacon('{roto'))).status).toBe(400);
  });

  it.each([['null'], ['42'], ['[1,2]'], ['"texto"']])('el cuerpo %s es un 400, no un 500', async (cuerpo) => {
    expect((await route.POST(beacon(cuerpo))).status).toBe(400);
  });

  it('ignora campos con el tipo equivocado en vez de fallar', async () => {
    const res = await route.POST(beacon({ p: '/', r: 12, w: 'ancho', u: { x: 1 } }));
    expect(res.status).toBe(204);
    const [linea] = await lineasDeHoy();
    expect(linea).toMatchObject({ p: '/', r: 'directo', d: 'móvil' });
    expect(linea).not.toHaveProperty('u');
  });

  it('un p que no es texto no apunta nada', async () => {
    await route.POST(beacon({ p: 123 }));
    expect(await lineasDeHoy()).toEqual([]);
  });

  it('rechaza un cuerpo enorme sin leerlo', async () => {
    const res = await route.POST(beacon({ p: '/', r: 'x'.repeat(20_000) }));
    expect(res.status).toBe(400);
  });

  it('una IP inventada en X-Forwarded-For no fabrica visitantes únicos', async () => {
    for (let i = 1; i <= 3; i++) {
      await route.POST(
        beacon({ p: '/' }, { 'x-forwarded-for': `203.0.113.${i}, 88.1.1.1`, 'x-real-ip': '88.1.1.1' })
      );
    }
    const lineas = await lineasDeHoy();
    expect(lineas).toHaveLength(3);
    expect(new Set(lineas.map((l) => l.v)).size).toBe(1);
  });

  it('descarta en silencio pasado el tope por IP', async () => {
    const respuestas = [];
    for (let i = 0; i < 125; i++) {
      respuestas.push((await route.POST(beacon({ p: '/' }, { 'x-real-ip': '7.7.7.7' }))).status);
    }
    expect(respuestas.every((s) => s === 204)).toBe(true);
    expect(await lineasDeHoy()).toHaveLength(120);
  });

  it('si el disco falla, el visitante no ve ningún error', async () => {
    const espia = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Un FICHERO donde debería ir el directorio: mkdir falla.
    await fs.mkdir(path.dirname(analyticsDir), { recursive: true });
    await fs.writeFile(analyticsDir, 'no soy un directorio');
    try {
      expect((await route.POST(beacon({ p: '/' }))).status).toBe(204);
      expect(espia).toHaveBeenCalled();
    } finally {
      await fs.rm(analyticsDir, { force: true });
      espia.mockRestore();
    }
  });
});
