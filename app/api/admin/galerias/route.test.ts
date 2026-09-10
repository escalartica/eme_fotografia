// @vitest-environment node
//
// Entorno `node`: esta ruta recibe un multipart real. En jsdom, `FormData` y
// `File` son los de jsdom y no los que entiende el `Request` de Node, así que
// el cuerpo no llegaría a parsearse.
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
// Se carga con el cwd real, antes de que createTempDataRoot lo desvíe: así ningún
// módulo de Next calcula rutas contra el directorio temporal.
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { ADMIN_COOKIE, CLIENT_COOKIE } from '@/lib/auth/cookies';
import { verifyPassword } from '@/lib/auth/password';

const mocks = vi.hoisted(() => ({ jar: {} as Record<string, string> }));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
}));

const dataRoot = createTempDataRoot('eme-api-galerias-');
const galleriesDir = path.join(dataRoot.root, 'data', 'galleries');

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

beforeEach(() => {
  mocks.jar = {};
});

afterEach(async () => {
  await fs.rm(galleriesDir, { recursive: true, force: true });
  await fs.rm(path.join(dataRoot.root, 'data', 'sessions'), { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

/** Los bytes de un fichero de prueba. `Uint8Array<ArrayBuffer>` y no el
 * `Uint8Array` a secas: solo el primero es un BlobPart válido para `File`. */
type Bytes = Uint8Array<ArrayBuffer>;

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 1, 2, 3, 4]);
const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 1, 2, 3]);
const HTML = new TextEncoder().encode('<!DOCTYPE html><script>fetch("https://malo.example")</script>');

const CAMPOS_VALIDOS = {
  slug: 'boda-ana-y-luis',
  clientName: 'Ana y Luis',
  weddingDate: '2027-06-12',
  username: 'ana',
  password: 'contra-segura-1234',
};

function alta(
  fields: Partial<typeof CAMPOS_VALIDOS> = {},
  files: Array<[string, Bytes, string]> = [['export_0421.jpg', PNG, 'image/jpeg']],
  headers: Record<string, string> = {}
): Request {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...CAMPOS_VALIDOS, ...fields })) form.set(key, value);
  for (const [name, bytes, type] of files) form.append('photos', new File([bytes], name, { type }));
  return new Request('http://localhost:3000/api/admin/galerias', { method: 'POST', headers, body: form });
}

async function conSesionDeAdmin(): Promise<void> {
  const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
  mocks.jar[ADMIN_COOKIE] = token;
}

describe('POST /api/admin/galerias', () => {
  it('returns 401 and creates nothing without a session', async () => {
    const res = await route.POST(alta());
    expect(res.status).toBe(401);
    expect(await store.getGalleryMeta(CAMPOS_VALIDOS.slug)).toBeNull();
  });

  it("returns 401 for a client's gallery session, which must never reach the panel", async () => {
    // Una pareja con su sesión abierta no puede crear galerías ni, por tanto,
    // ver el panel del estudio.
    const { token } = await sessions.createSession('client', 'boda-ana-y-luis', 'ana');
    mocks.jar[CLIENT_COOKIE] = token;
    const res = await route.POST(alta());
    expect(res.status).toBe(401);
    expect(await store.getGalleryMeta(CAMPOS_VALIDOS.slug)).toBeNull();
  });

  it("returns 401 when a client's token is presented in the panel cookie", async () => {
    // Una pareja puede copiar su propia cookie al nombre de la del panel. Lo
    // único que lo para es que la sesión lleve su rol dentro.
    const { token } = await sessions.createSession('client', 'boda-ana-y-luis', 'ana');
    mocks.jar[ADMIN_COOKIE] = token;
    const res = await route.POST(alta());
    expect(res.status).toBe(401);
    expect(await store.getGalleryMeta(CAMPOS_VALIDOS.slug)).toBeNull();
  });

  it('returns 403 when the request comes from another site', async () => {
    // CSRF: sin esto, cualquier web que el estudio visitara con su sesión
    // abierta podría crear galerías en su nombre.
    await conSesionDeAdmin();
    const res = await route.POST(alta({}, undefined, { origin: 'https://sitio-de-otro.example' }));
    expect(res.status).toBe(403);
    expect(await store.getGalleryMeta(CAMPOS_VALIDOS.slug)).toBeNull();
  });

  it('rejects a slug that tries to escape the galleries directory', async () => {
    await conSesionDeAdmin();
    for (const slug of ['../../etc', 'boda/ana', '..', 'boda ana', 'boda.ana', '']) {
      const res = await route.POST(alta({ slug }));
      expect(res.status, `slug=${slug}`).toBe(400);
    }
  });

  it('normalises the slug to lowercase, so the gallery lives at the link that gets shared', async () => {
    // El estudio teclea el enlace a mano. Si el alta guardara "Boda-Ana" tal
    // cual, isValidSlug rechazaría después ese mismo slug y la galería sería
    // inalcanzable.
    await conSesionDeAdmin();
    const res = await route.POST(alta({ slug: '  Boda-Ana-Y-Luis  ' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, slug: 'boda-ana-y-luis' });
    expect(await store.getGalleryMeta('boda-ana-y-luis')).not.toBeNull();
  });

  it('rejects a slug that collides with a real page of the site', async () => {
    // "privacidad", "cookies" y "aviso-legal" son rutas de primer nivel: una
    // galería con ese enlace nace muerta y el estudio se lo daría a su cliente
    // sin enterarse.
    await conSesionDeAdmin();
    for (const slug of ['privacidad', 'cookies', 'aviso-legal', 'admin', 'contacto']) {
      const res = await route.POST(alta({ slug }));
      expect(res.status, `slug=${slug}`).toBe(400);
      expect(await store.getGalleryMeta(slug)).toBeNull();
    }
  });

  it('rejects a missing client name or username', async () => {
    await conSesionDeAdmin();
    expect((await route.POST(alta({ clientName: '   ' }))).status).toBe(400);
    expect((await route.POST(alta({ username: '' }))).status).toBe(400);
  });

  it('rejects a password shorter than eight characters', async () => {
    await conSesionDeAdmin();
    const res = await route.POST(alta({ password: 'corta' }));
    expect(res.status).toBe(400);
    expect(await store.getGalleryMeta(CAMPOS_VALIDOS.slug)).toBeNull();
  });

  it('rejects a gallery with no photos at all', async () => {
    await conSesionDeAdmin();
    expect((await route.POST(alta({}, []))).status).toBe(400);
  });

  it('rejects more photos than the per-gallery cap', async () => {
    await conSesionDeAdmin();
    const demasiadas = Array.from(
      { length: 61 },
      (_, i): [string, Bytes, string] => [`foto-${i}.jpg`, JPG, 'image/jpeg']
    );
    const res = await route.POST(alta({}, demasiadas));
    expect(res.status).toBe(400);
    expect(await store.getGalleryMeta(CAMPOS_VALIDOS.slug)).toBeNull();
  });

  it('returns 400 when the body is not a readable multipart form', async () => {
    await conSesionDeAdmin();
    const res = await route.POST(
      new Request('http://localhost:3000/api/admin/galerias', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'esto-no-es-un-formulario',
      })
    );
    expect(res.status).toBe(400);
  });

  it('refuses an HTML file dressed up as a JPEG, and stores nothing', async () => {
    // El Content-Type del multipart lo escribe quien sube. Si el servidor se
    // fiara, quedaría un .html servido desde el dominio del estudio.
    await conSesionDeAdmin();
    const res = await route.POST(alta({}, [['foto-boda.jpg', HTML, 'image/jpeg']]));
    expect(res.status).toBe(400);
    expect(await store.getGalleryMeta(CAMPOS_VALIDOS.slug)).toBeNull();
    await expect(fs.readdir(store.galleryPhotosDir(CAMPOS_VALIDOS.slug))).rejects.toThrow();
  });

  it('leaves the slug free after a rejected upload', async () => {
    // Si la limpieza dejara la galería a medio crear, el estudio no podría
    // reintentar con el mismo enlace y no sabría por qué.
    await conSesionDeAdmin();
    expect((await route.POST(alta({}, [['x.jpg', HTML, 'image/jpeg']]))).status).toBe(400);
    expect((await route.POST(alta())).status).toBe(200);
  });

  it("names the stored file from the file's real bytes, not from its declared name or type", async () => {
    // El nombre original de una exportación suele llevar dentro el nombre y la
    // fecha reales del cliente, y la extensión declarada no demuestra nada.
    await conSesionDeAdmin();
    const res = await route.POST(alta({}, [['maria_y_jose_2019.html', PNG, 'text/html']]));
    expect(res.status).toBe(200);

    const meta = await store.getGalleryMeta(CAMPOS_VALIDOS.slug);
    expect(meta!.photos).toHaveLength(1);
    const { filename } = meta!.photos[0];
    expect(filename).toMatch(/^[0-9a-f-]+\.png$/);
    expect(filename).not.toContain('maria');
    expect(store.isValidPhotoFilename(filename)).toBe(true);

    const stored = await fs.readdir(store.galleryPhotosDir(CAMPOS_VALIDOS.slug));
    expect(stored).toEqual([filename]);
  });

  it('stores the whole gallery and hashes the password', async () => {
    await conSesionDeAdmin();
    const res = await route.POST(alta({}, [['a.jpg', JPG, 'image/jpeg'], ['b.png', PNG, 'image/png']]));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, slug: CAMPOS_VALIDOS.slug });

    const meta = await store.getGalleryMeta(CAMPOS_VALIDOS.slug);
    expect(meta!.clientName).toBe('Ana y Luis');
    expect(meta!.weddingDate).toBe('2027-06-12');
    expect(meta!.username).toBe('ana');
    expect(meta!.photos.map((p) => p.filename.split('.').pop())).toEqual(['jpg', 'png']);
    expect(meta!.photos[0].alt).toContain('Ana y Luis');
    expect(new Set(meta!.photos.map((p) => p.id)).size).toBe(2);

    // La contraseña del cliente nunca se guarda en claro.
    expect(meta!.passwordHash).not.toContain(CAMPOS_VALIDOS.password);
    expect(await verifyPassword(CAMPOS_VALIDOS.password, meta!.passwordHash)).toBe(true);
    expect(await verifyPassword('otra-cosa', meta!.passwordHash)).toBe(false);
  });

  it('refuses to overwrite an existing gallery', async () => {
    // Aceptarlo cambiaría la contraseña y borraría las fotos de una boda ya
    // entregada solo por repetir el enlace.
    await conSesionDeAdmin();
    expect((await route.POST(alta())).status).toBe(200);
    const res = await route.POST(alta({ clientName: 'Otra pareja', password: 'otra-contra-1234' }));
    expect(res.status).toBe(409);
    expect((await store.getGalleryMeta(CAMPOS_VALIDOS.slug))!.clientName).toBe('Ana y Luis');
  });

  it('never leaks an internal path in an error message', async () => {
    await conSesionDeAdmin();
    const res = await route.POST(alta({ slug: '../../etc' }));
    const { error } = (await res.json()) as { error: string };
    expect(error).not.toContain(dataRoot.root);
    expect(error).not.toMatch(/data\/galleries|node_modules|at Object\./);
  });
});
