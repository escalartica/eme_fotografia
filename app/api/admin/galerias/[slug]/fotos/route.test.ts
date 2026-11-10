// @vitest-environment node
//
// Entorno `node`: esta ruta recibe un multipart real (ver el mismo comentario
// en app/api/admin/galerias/route.test.ts).
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { ADMIN_COOKIE } from '@/lib/auth/cookies';

const mocks = vi.hoisted(() => ({ jar: {} as Record<string, string> }));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
}));

const dataRoot = createTempDataRoot('eme-api-galeria-fotos-');
const galleriesDir = path.join(dataRoot.root, 'data', 'galleries');

let route: typeof import('./route');
let store: typeof import('@/lib/gallery-store');
let sessions: typeof import('@/lib/auth/session');
let limits: typeof import('@/lib/gallery-limits');

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    route: await import('./route'),
    store: await import('@/lib/gallery-store'),
    sessions: await import('@/lib/auth/session'),
    limits: await import('@/lib/gallery-limits'),
  }));
  route = loaded.route;
  store = loaded.store;
  sessions = loaded.sessions;
  limits = loaded.limits;
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

type Bytes = Uint8Array<ArrayBuffer>;
const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 1, 2, 3]);
const HTML = new TextEncoder().encode('<!DOCTYPE html><script>alert(1)</script>');

const SLUG = 'boda-ana-y-luis';
const params = Promise.resolve({ slug: SLUG });

async function crearGaleria(fotos = 1): Promise<void> {
  await store.saveGalleryMeta({
    slug: SLUG,
    clientName: 'Ana y Luis',
    username: 'ana',
    passwordHash: 'x',
    createdAt: new Date().toISOString(),
    photos: Array.from({ length: fotos }, (_, i) => ({ id: `f${i}`, filename: `f${i}.jpg`, alt: `Foto ${i + 1}` })),
  });
}

async function conSesionDeAdmin(): Promise<void> {
  const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
  mocks.jar[ADMIN_COOKIE] = token;
}

function envio(
  files: Array<[string, Bytes]> = [['a.jpg', JPG]],
  { tanda, headers = {} }: { tanda?: string; headers?: Record<string, string> } = {}
): Request {
  const form = new FormData();
  if (tanda) form.set('tanda', tanda);
  for (const [name, bytes] of files) form.append('photos', new File([bytes], name, { type: 'image/jpeg' }));
  return new Request(`http://localhost:3000/api/admin/galerias/${SLUG}/fotos`, { method: 'POST', headers, body: form });
}

async function ficherosEnDisco(): Promise<string[]> {
  return (await fs.readdir(store.galleryPhotosDir(SLUG)).catch(() => [])).sort();
}

describe('POST /api/admin/galerias/[slug]/fotos', () => {
  it('returns 401 and adds nothing without a session', async () => {
    await crearGaleria();
    const res = await route.POST(envio(), { params });
    expect(res.status).toBe(401);
    expect((await store.getGalleryMeta(SLUG))!.photos).toHaveLength(1);
  });

  it('returns 403 when the request comes from another site', async () => {
    await conSesionDeAdmin();
    await crearGaleria();
    const res = await route.POST(envio(undefined, { headers: { origin: 'https://sitio-de-otro.example' } }), { params });
    expect(res.status).toBe(403);
  });

  it('returns 404 for a gallery that does not exist, and writes nothing', async () => {
    await conSesionDeAdmin();
    const res = await route.POST(envio(), { params });
    expect(res.status).toBe(404);
    expect(await ficherosEnDisco()).toEqual([]);
  });

  it('appends the photos after the existing ones, numbering the alt text on', async () => {
    await conSesionDeAdmin();
    await crearGaleria(40);
    const res = await route.POST(envio([['x.jpg', JPG], ['y.jpg', JPG]]), { params });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, nuevas: 2, total: 42 });
    const meta = (await store.getGalleryMeta(SLUG))!;
    expect(meta.photos).toHaveLength(42);
    expect(meta.photos[0].id).toBe('f0');
    expect(meta.photos[41].alt).toBe('Foto 42 de la boda de Ana y Luis');
    expect(await ficherosEnDisco()).toHaveLength(2);
  });

  it('lets a gallery grow well past the old 200-photo cap, batch after batch', async () => {
    await conSesionDeAdmin();
    await crearGaleria(1180);
    const tanda = Array.from({ length: 40 }, (_, i): [string, Bytes] => [`f-${i}.jpg`, JPG]);
    const res = await route.POST(envio(tanda), { params });
    expect(res.status).toBe(200);
    expect((await store.getGalleryMeta(SLUG))!.photos).toHaveLength(1220);
  });

  it('refuses to go past the per-gallery cap and leaves no orphan files', async () => {
    await conSesionDeAdmin();
    await crearGaleria(limits.MAX_FOTOS_POR_GALERIA - 1);
    const res = await route.POST(envio([['x.jpg', JPG], ['y.jpg', JPG]]), { params });
    expect(res.status).toBe(400);
    expect((await store.getGalleryMeta(SLUG))!.photos).toHaveLength(limits.MAX_FOTOS_POR_GALERIA - 1);
    expect(await ficherosEnDisco()).toEqual([]);
  });

  it('refuses a fake image and removes only what this request wrote', async () => {
    await conSesionDeAdmin();
    await crearGaleria();
    const dir = store.galleryPhotosDir(SLUG);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'f0.jpg'), JPG);

    const res = await route.POST(envio([['bien.jpg', JPG], ['mal.jpg', HTML]]), { params });
    expect(res.status).toBe(400);
    // La foto que ya tenía la galería sigue; la buena de esta tanda, no.
    expect(await ficherosEnDisco()).toEqual(['f0.jpg']);
    expect((await store.getGalleryMeta(SLUG))!.photos).toHaveLength(1);
  });

  it('does not store a retried batch twice', async () => {
    // La tanda entró pero la respuesta se perdió: el navegador la repite
    // con el mismo identificador.
    await conSesionDeAdmin();
    await crearGaleria();
    const tanda = '6f1c2a9e-2d7b-4e8a-9c3f-1b2a3c4d5e6f';
    expect((await route.POST(envio([['a.jpg', JPG]], { tanda }), { params })).status).toBe(200);
    const repetida = await route.POST(envio([['a.jpg', JPG]], { tanda }), { params });
    expect(repetida.status).toBe(200);
    expect(await repetida.json()).toEqual({ ok: true, nuevas: 0, total: 2 });
    expect((await store.getGalleryMeta(SLUG))!.photos).toHaveLength(2);
    expect(await ficherosEnDisco()).toHaveLength(1);
  });

  it('keeps every photo when two batches arrive at the same time', async () => {
    // Dos añadidos simultáneos leen la misma ficha: sin la cola de
    // lib/gallery-store.ts, el segundo en escribir borraba de la lista las
    // fotos del primero.
    await conSesionDeAdmin();
    await crearGaleria();
    const [a, b] = await Promise.all([
      route.POST(envio([['a.jpg', JPG], ['b.jpg', JPG]]), { params }),
      route.POST(envio([['c.jpg', JPG], ['d.jpg', JPG], ['e.jpg', JPG]]), { params }),
    ]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect((await store.getGalleryMeta(SLUG))!.photos).toHaveLength(6);
  });
});
