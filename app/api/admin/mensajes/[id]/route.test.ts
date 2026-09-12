// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { ADMIN_COOKIE, CLIENT_COOKIE } from '@/lib/auth/cookies';

const mocks = vi.hoisted(() => ({ jar: {} as Record<string, string> }));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
}));

const dataRoot = createTempDataRoot('eme-api-mensajes-');
const dataDir = path.join(dataRoot.root, 'data');
const mensajesDir = path.join(dataDir, 'contact-submissions');

const MENSAJE = {
  nombre: 'Ana',
  email: 'ana@example.com',
  fecha: '2027-06-12',
  lugar: 'Carmona',
  tipoEvento: 'foto-y-video',
  mensaje: 'Hola',
  // Obligatorio desde que el formulario pide el consentimiento expreso
  // (RGPD art. 7.1): sin esta marca, saveContactSubmission rechaza el envío
  // y este fichero no llega ni a tener un mensaje que borrar.
  consentimiento: 'si' as const,
};

let route: typeof import('./route');
let contactStore: typeof import('@/lib/contact-store');
let sessions: typeof import('@/lib/auth/session');
let id: string;

beforeAll(async () => {
  const loaded = await dataRoot.load(async () => ({
    route: await import('./route'),
    contactStore: await import('@/lib/contact-store'),
    sessions: await import('@/lib/auth/session'),
  }));
  route = loaded.route;
  contactStore = loaded.contactStore;
  sessions = loaded.sessions;
});

beforeEach(async () => {
  mocks.jar = {};
  // Sin argumento de directorio, a propósito: así se comprueba que la ruta y
  // este test miran el MISMO sitio (el que la redirección temporal fija).
  ({ id } = await contactStore.saveContactSubmission({ ...MENSAJE }));
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

const borrar = (mensajeId: string, headers: Record<string, string> = {}) =>
  route.DELETE(new Request(`http://localhost:3000/api/admin/mensajes/${mensajeId}`, { method: 'DELETE', headers }), {
    params: Promise.resolve({ id: mensajeId }),
  });

const sigueEnDisco = async () => (await fs.readdir(mensajesDir)).length;

async function conSesionDeAdmin(): Promise<void> {
  const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
  mocks.jar[ADMIN_COOKIE] = token;
}

describe('DELETE /api/admin/mensajes/[id]', () => {
  it('returns 401 and deletes nothing without a session', async () => {
    // Borrar los mensajes del estudio es tan grave como leerlos.
    expect((await borrar(id)).status).toBe(401);
    expect(await sigueEnDisco()).toBe(1);
  });

  it("returns 401 for a client's gallery session", async () => {
    const { token } = await sessions.createSession('client', 'boda-ana-y-luis', 'ana');
    mocks.jar[CLIENT_COOKIE] = token;
    expect((await borrar(id)).status).toBe(401);
    expect(await sigueEnDisco()).toBe(1);
  });

  it("returns 401 when a client's token is presented in the panel cookie", async () => {
    // Copiar la cookie de una galería al nombre de la del panel no puede
    // convertir a una pareja en administradora.
    const { token } = await sessions.createSession('client', 'boda-ana-y-luis', 'ana');
    mocks.jar[ADMIN_COOKIE] = token;
    expect((await borrar(id)).status).toBe(401);
    expect(await sigueEnDisco()).toBe(1);
  });

  it('returns 403 when the request comes from another site', async () => {
    // Sin esto, una web cualquiera podría hacer que el navegador del estudio,
    // con su cookie puesta, borrara sus mensajes solo por visitarla.
    await conSesionDeAdmin();
    expect((await borrar(id, { origin: 'https://otro.example' })).status).toBe(403);
    expect(await sigueEnDisco()).toBe(1);
  });

  it('refuses an id that is not a UUID, so no path can escape the messages directory', async () => {
    await conSesionDeAdmin();
    for (const malo of ['../../admin/users', '..', 'todos', `${id}/../../x`, '']) {
      const res = await borrar(malo);
      expect(res.status, `id=${malo}`).toBe(404);
    }
    expect(await sigueEnDisco()).toBe(1);
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    await conSesionDeAdmin();
    expect((await borrar('11111111-2222-3333-4444-555555555555')).status).toBe(404);
    expect(await sigueEnDisco()).toBe(1);
  });

  it('deletes the message for real (RGPD, derecho de supresión)', async () => {
    await conSesionDeAdmin();
    const res = await borrar(id);
    expect(res.status).toBe(200);
    expect(await sigueEnDisco()).toBe(0);
    expect(await contactStore.listContactSubmissions(mensajesDir)).toEqual([]);
  });

  it('returns 404 the second time, instead of pretending it deleted something', async () => {
    await conSesionDeAdmin();
    expect((await borrar(id)).status).toBe(200);
    expect((await borrar(id)).status).toBe(404);
  });

  it('deletes only the message asked for', async () => {
    await conSesionDeAdmin();
    const { id: otro } = await contactStore.saveContactSubmission({ ...MENSAJE, nombre: 'Eva' });
    await borrar(id);
    const quedan = await contactStore.listContactSubmissions(mensajesDir);
    expect(quedan.map((m) => m.id)).toEqual([otro]);
  });
});
