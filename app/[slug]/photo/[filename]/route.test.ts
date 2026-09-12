// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { CLIENT_COOKIE, ADMIN_COOKIE } from '@/lib/auth/cookies';

const mocks = vi.hoisted(() => ({
  jar: {} as Record<string, string>,
  // sharp es un binario nativo; aquí se sustituye por un doble para que la
  // prueba mida lo que le toca (que la ruta pida o no una copia reducida, y
  // cuándo) y no si la máquina que corre los tests puede decodificar un PNG.
  redimensionado: vi.fn(),
}));
const WEBP_FALSO = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4]);
vi.mock('sharp', () => ({
  default: (entrada: Uint8Array) => {
    mocks.redimensionado(entrada.length);
    const cadena = {
      rotate: () => cadena,
      resize: () => cadena,
      webp: () => cadena,
      toBuffer: async () => Buffer.from(WEBP_FALSO),
    };
    return cadena;
  },
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
}));

const dataRoot = createTempDataRoot('eme-api-photo-');
const dataDir = path.join(dataRoot.root, 'data');

const ANA = 'boda-ana-y-luis';
const EVA = 'boda-eva-y-marta';
const FICHERO = 'ce53274e-75ba-4c5a-8707-5af7d7bfcc65.png';
const BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9, 8, 7, 6]);

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
  mocks.jar = {};
  mocks.redimensionado.mockClear();
  for (const slug of [ANA, EVA]) {
    await store.saveGalleryMeta({
      slug,
      clientName: 'Pareja',
      username: 'pareja',
      passwordHash: 'scrypt:aa:bb',
      createdAt: '2026-09-01T10:00:00.000Z',
      photos: [{ id: 'foto-1', filename: FICHERO, alt: 'Foto 1' }],
    });
    const dir = store.galleryPhotosDir(slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, FICHERO), BYTES);
  }
  // Un fichero que NO pertenece a ninguna galería, para comprobar que no se
  // puede alcanzar saliendo del directorio de fotos.
  await fs.writeFile(path.join(dataDir, 'secreto.png'), new TextEncoder().encode('no-mirar'));
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

const pedir = (slug: string, filename: string, ancho?: string) =>
  route.GET(
    new Request(`http://localhost:3000/${slug}/photo/${filename}${ancho ? `?w=${ancho}` : ''}`),
    { params: Promise.resolve({ slug, filename }) }
  );

async function sesionDeCliente(slug: string): Promise<void> {
  const { token } = await sessions.createSession('client', slug, 'pareja');
  mocks.jar[CLIENT_COOKIE] = token;
}

describe('GET /[slug]/photo/[filename]', () => {
  it('returns 401 and no image bytes without a session', async () => {
    // Las fotos viven fuera de public/ precisamente para que esta comprobación
    // sea posible en CADA petición: si el enlace de una foto se filtrara (una
    // captura, un referer), seguiría sin abrirse.
    const res = await pedir(ANA, FICHERO);
    expect(res.status).toBe(401);
    expect(res.headers.get('content-type')).not.toMatch(/^image\//);
  });

  it("returns 401 for another gallery's client session", async () => {
    await sesionDeCliente(EVA);
    const res = await pedir(ANA, FICHERO);
    expect(res.status).toBe(401);
  });

  it('serves the photo to the client of that gallery', async () => {
    await sesionDeCliente(ANA);
    const res = await pedir(ANA, FICHERO);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(BYTES);
  });

  it('never lets a shared cache keep a private photo', async () => {
    await sesionDeCliente(ANA);
    const res = await pedir(ANA, FICHERO);
    expect(res.headers.get('cache-control')).toContain('private');
    expect(res.headers.get('cache-control')).toContain('no-store');
  });

  it('serves the photo to the studio, which can see every gallery', async () => {
    const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
    mocks.jar[ADMIN_COOKIE] = token;
    expect((await pedir(ANA, FICHERO)).status).toBe(200);
    expect((await pedir(EVA, FICHERO)).status).toBe(200);
  });

  it('stops serving photos the moment the session is revoked', async () => {
    // Cerrar sesión tiene que cortar el acceso a las fotos, no solo a la página
    // que las rodea.
    const { token } = await sessions.createSession('client', ANA, 'pareja');
    mocks.jar[CLIENT_COOKIE] = token;
    expect((await pedir(ANA, FICHERO)).status).toBe(200);
    await sessions.destroySession(token);
    expect((await pedir(ANA, FICHERO)).status).toBe(401);
  });

  it('refuses to walk out of the photos directory', async () => {
    await sesionDeCliente(ANA);
    for (const filename of ['../../../secreto.png', '../meta.json', '..%2f..%2fsecreto.png', 'foto.svg', 'foto.html']) {
      const res = await pedir(ANA, filename);
      expect(res.status, `filename=${filename}`).toBe(404);
    }
    for (const slug of ['../../etc', '..', 'Boda-Ana']) {
      const res = await pedir(slug, FICHERO);
      expect(res.status, `slug=${slug}`).toBe(404);
    }
  });

  it('does not reveal whether a photo exists to somebody with no session', async () => {
    // La misma respuesta para una foto real y para una inventada: si la ruta
    // contestara 404 a una y 401 a la otra, se podría ir descubriendo qué fotos
    // tiene una galería sin entrar en ella.
    const existe = await pedir(ANA, FICHERO);
    const noExiste = await pedir(ANA, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png');
    expect(existe.status).toBe(401);
    expect(noExiste.status).toBe(401);
  });

  it('returns 404 for a photo that does not exist in a gallery the client can open', async () => {
    await sesionDeCliente(ANA);
    expect((await pedir(ANA, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png')).status).toBe(404);
  });

  describe('?w= (copias reducidas)', () => {
    it('serves a resized WebP for a width the interface actually asks for', async () => {
      await sesionDeCliente(ANA);
      const res = await pedir(ANA, FICHERO, '800');
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('image/webp');
      expect(mocks.redimensionado).toHaveBeenCalledTimes(1);
    });

    it('caches the resized copy on disk instead of redoing the work', async () => {
      await sesionDeCliente(ANA);
      await pedir(ANA, FICHERO, '800');
      await pedir(ANA, FICHERO, '800');
      // La segunda petición sale de disco: redimensionar doscientas fotos en
      // cada visita a la galería es justo lo que no puede pasar en un
      // servidor pequeño.
      expect(mocks.redimensionado).toHaveBeenCalledTimes(1);
      const copias = await fs.readdir(store.galleryDerivativesDir(ANA));
      expect(copias).toContain(`800-${FICHERO}.webp`);
    });

    // LA PARTE DE SEGURIDAD. Redimensionar es lo más caro que hace esta ruta.
    // Si el parámetro se resolviera antes de mirar la sesión, cualquiera desde
    // fuera podría encargarle trabajo al servidor -- y de paso llenarle el
    // disco de copias -- sin haber entrado nunca en la galería.
    it('never does resize work for a request with no session', async () => {
      const res = await pedir(ANA, FICHERO, '800');
      expect(res.status).toBe(401);
      expect(mocks.redimensionado).not.toHaveBeenCalled();
    });

    // El ancho sale de una lista cerrada. Un número libre en la URL es una
    // invitación a pedir mil tamaños distintos de la misma foto.
    it('ignores a width outside the allowed list and serves the original', async () => {
      await sesionDeCliente(ANA);
      for (const w of ['999', '4000', '-800', '0', 'grande', '800px']) {
        const res = await pedir(ANA, FICHERO, w);
        expect(res.status, `w=${w}`).toBe(200);
        expect(res.headers.get('content-type'), `w=${w}`).toBe('image/png');
        expect(new Uint8Array(await res.arrayBuffer())).toEqual(BYTES);
      }
      expect(mocks.redimensionado).not.toHaveBeenCalled();
    });

    it('keeps a resized copy as unshareable as the original', async () => {
      await sesionDeCliente(ANA);
      const res = await pedir(ANA, FICHERO, '400');
      expect(res.headers.get('cache-control')).toContain('private');
      expect(res.headers.get('cache-control')).toContain('no-store');
    });
  });
});
