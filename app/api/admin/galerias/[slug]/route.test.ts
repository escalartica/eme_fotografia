// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
// Se carga con el cwd real, antes de que createTempDataRoot lo desvíe.
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { ADMIN_COOKIE } from '@/lib/auth/cookies';
import { verifyPassword } from '@/lib/auth/password';

const mocks = vi.hoisted(() => ({ jar: {} as Record<string, string> }));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
}));

const dataRoot = createTempDataRoot('eme-api-galeria-slug-');
const galleriesDir = path.join(dataRoot.root, 'data', 'galleries');

let route: typeof import('./route');
let store: typeof import('@/lib/gallery-store');
let sessions: typeof import('@/lib/auth/session');
let password: typeof import('@/lib/auth/password');

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    route: await import('./route'),
    store: await import('@/lib/gallery-store'),
    sessions: await import('@/lib/auth/session'),
    password: await import('@/lib/auth/password'),
  }));
  route = loaded.route;
  store = loaded.store;
  sessions = loaded.sessions;
  password = loaded.password;
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

const SLUG = 'boda-ana-y-luis';

/** Una galería completa en disco: ficha, una foto y una selección enviada. */
async function crearGaleria(): Promise<void> {
  await store.saveGalleryMeta({
    slug: SLUG,
    clientName: 'Ana y Luis',
    username: 'ana',
    passwordHash: await password.hashPassword('contra-vieja-1234'),
    createdAt: new Date().toISOString(),
    photos: [{ id: 'foto-1', filename: 'foto-1.jpg', alt: 'Una foto' }],
  });
  const dir = store.galleryPhotosDir(SLUG);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'foto-1.jpg'), new Uint8Array([0xff, 0xd8, 0xff]));
  await store.saveSelection(SLUG, [{ photoId: 'foto-1', liked: true, comment: 'esta' }]);
}

async function conSesionDeAdmin(): Promise<void> {
  const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
  mocks.jar[ADMIN_COOKIE] = token;
}

function peticion(metodo: 'DELETE' | 'PATCH', cuerpo?: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost:3000/api/admin/galerias/${SLUG}`, {
    method: metodo,
    headers: cuerpo ? { 'Content-Type': 'application/json', ...headers } : headers,
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
}

const params = Promise.resolve({ slug: SLUG });

describe('DELETE /api/admin/galerias/[slug]', () => {
  it('no borra nada sin sesión de administración', async () => {
    await crearGaleria();
    const res = await route.DELETE(peticion('DELETE'), { params });
    expect(res.status).toBe(401);
    expect(await store.getGalleryMeta(SLUG)).not.toBeNull();
  });

  /* Una pareja puede copiar su propia cookie al nombre de la del panel. Lo
     único que lo para es que la sesión lleve su rol dentro. */
  it('no acepta la sesión de un cliente presentada como la del panel', async () => {
    await crearGaleria();
    const { token } = await sessions.createSession('client', SLUG, 'ana');
    mocks.jar[ADMIN_COOKIE] = token;
    const res = await route.DELETE(peticion('DELETE'), { params });
    expect(res.status).toBe(401);
    expect(await store.getGalleryMeta(SLUG)).not.toBeNull();
  });

  /* Sin esto, una web cualquiera podría hacer que el navegador del estudio,
     con su cookie puesta, borrara una boda sólo por visitarla. */
  it('rechaza una petición que venga de otro origen', async () => {
    await crearGaleria();
    await conSesionDeAdmin();
    const res = await route.DELETE(peticion('DELETE', undefined, { origin: 'https://malo.example' }), { params });
    expect(res.status).toBe(403);
    expect(await store.getGalleryMeta(SLUG)).not.toBeNull();
  });

  it('borra la ficha, las fotos y la selección', async () => {
    await crearGaleria();
    await conSesionDeAdmin();
    const res = await route.DELETE(peticion('DELETE'), { params });
    expect(res.status).toBe(200);
    expect(await store.getGalleryMeta(SLUG)).toBeNull();
    expect(await store.getSelection(SLUG)).toBeNull();
    await expect(fs.access(path.join(galleriesDir, SLUG))).rejects.toThrow();
  });

  /**
   * La mitad que es fácil de olvidar. Las sesiones de cliente duran treinta
   * días: sin cerrarlas, la pareja que tuviera su galería abierta seguiría
   * teniendo sesión válida un mes después de un borrado que se pidió
   * justamente para que dejaran de estar.
   */
  it('cierra las sesiones abiertas de esa boda, y sólo las de esa boda', async () => {
    await crearGaleria();
    const suya = await sessions.createSession('client', SLUG, 'ana');
    const deOtraBoda = await sessions.createSession('client', 'boda-eva-y-rafa', 'eva');
    const delEstudio = await sessions.createSession('admin', 'estudio', 'estudio');
    mocks.jar[ADMIN_COOKIE] = delEstudio.token;

    const res = await route.DELETE(peticion('DELETE'), { params });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, sesionesCerradas: 1 });
    expect(await sessions.getSession(suya.token)).toBeNull();
    expect(await sessions.getSession(deOtraBoda.token)).not.toBeNull();
    expect(await sessions.getSession(delEstudio.token)).not.toBeNull();
  });

  it('responde 404 si la galería no existe, sin fingir que ha borrado algo', async () => {
    await conSesionDeAdmin();
    const res = await route.DELETE(peticion('DELETE'), { params });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/admin/galerias/[slug]', () => {
  it('no cambia nada sin sesión de administración', async () => {
    await crearGaleria();
    const res = await route.PATCH(peticion('PATCH', { password: 'contra-nueva-1234' }), { params });
    expect(res.status).toBe(401);
    const meta = await store.getGalleryMeta(SLUG);
    expect(await verifyPassword('contra-vieja-1234', meta!.passwordHash)).toBe(true);
  });

  it('cambia la contraseña y deja el resto de la ficha intacto', async () => {
    await crearGaleria();
    await conSesionDeAdmin();
    const res = await route.PATCH(peticion('PATCH', { password: 'contra-nueva-1234' }), { params });
    expect(res.status).toBe(200);

    const meta = await store.getGalleryMeta(SLUG);
    expect(await verifyPassword('contra-nueva-1234', meta!.passwordHash)).toBe(true);
    expect(await verifyPassword('contra-vieja-1234', meta!.passwordHash)).toBe(false);
    expect(meta!.clientName).toBe('Ana y Luis');
    expect(meta!.username).toBe('ana');
    expect(meta!.photos).toHaveLength(1);
  });

  /* Una sesión viva es una contraseña vieja que sigue funcionando: si se
     cambia porque se ha filtrado, dejarla abierta deja el problema donde
     estaba. */
  it('cierra las sesiones abiertas de esa galería al cambiar la contraseña', async () => {
    await crearGaleria();
    const suya = await sessions.createSession('client', SLUG, 'ana');
    await conSesionDeAdmin();
    await route.PATCH(peticion('PATCH', { password: 'contra-nueva-1234' }), { params });
    expect(await sessions.getSession(suya.token)).toBeNull();
  });

  /* El mismo mínimo que al crear (ver ../route.ts): si divergieran, el panel
     aceptaría al cambiar una contraseña que no habría aceptado al crear. */
  it('exige los mismos ocho caracteres que el alta', async () => {
    await crearGaleria();
    await conSesionDeAdmin();
    const res = await route.PATCH(peticion('PATCH', { password: 'corta' }), { params });
    expect(res.status).toBe(400);
    const meta = await store.getGalleryMeta(SLUG);
    expect(await verifyPassword('contra-vieja-1234', meta!.passwordHash)).toBe(true);
  });

  /* Recortar en silencio guardaba una contraseña distinta de la que el
     estudio acababa de escribir y le iba a pasar al cliente: la pareja no
     podía entrar y nadie sabía por qué. */
  it('rechaza una contraseña demasiado larga en vez de recortarla', async () => {
    await crearGaleria();
    await conSesionDeAdmin();
    const larguisima = 'a'.repeat(250);
    const res = await route.PATCH(peticion('PATCH', { password: larguisima }), { params });
    expect(res.status).toBe(400);
    const meta = await store.getGalleryMeta(SLUG);
    expect(await verifyPassword(larguisima.slice(0, 200), meta!.passwordHash)).toBe(false);
    expect(await verifyPassword('contra-vieja-1234', meta!.passwordHash)).toBe(true);
  });

  it('rechaza un cuerpo sin contraseña o que no sea JSON', async () => {
    await crearGaleria();
    await conSesionDeAdmin();
    expect((await route.PATCH(peticion('PATCH', {}), { params })).status).toBe(400);
    const roto = new Request(`http://localhost:3000/api/admin/galerias/${SLUG}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'no soy json',
    });
    expect((await route.PATCH(roto, { params })).status).toBe(400);
  });

  it('responde 404 si la galería no existe', async () => {
    await conSesionDeAdmin();
    const res = await route.PATCH(peticion('PATCH', { password: 'contra-nueva-1234' }), { params });
    expect(res.status).toBe(404);
  });
});
