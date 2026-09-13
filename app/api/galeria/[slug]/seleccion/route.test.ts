// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import 'next/server';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { CLIENT_COOKIE, ADMIN_COOKIE } from '@/lib/auth/cookies';

const mocks = vi.hoisted(() => ({
  jar: {} as Record<string, string>,
  avisar: vi.fn(async (_datos: { favoritas: number; conNota: number; total: number; panelUrl: string; clientName: string }) => ({ id: 'x' })),
}));
// El aviso por correo, sin abrir un socket: lo que se comprueba aquí es
// CUÁNDO se manda, no qué pone (eso está en lib/mail.test.ts).
vi.mock('@/lib/mail', () => ({
  isMailConfigured: () => true,
  avisarDeSeleccion: mocks.avisar,
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
}));

const dataRoot = createTempDataRoot('eme-api-seleccion-');
const dataDir = path.join(dataRoot.root, 'data');

const ANA = 'boda-ana-y-luis';
const EVA = 'boda-eva-y-marta';

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

async function crearGaleria(slug: string, photoIds: string[]): Promise<void> {
  await store.saveGalleryMeta({
    slug,
    clientName: 'Pareja',
    username: 'pareja',
    passwordHash: 'scrypt:aa:bb',
    createdAt: '2026-09-01T10:00:00.000Z',
    photos: photoIds.map((id) => ({ id, filename: `${id}.jpg`, alt: id })),
  });
}

beforeEach(async () => {
  mocks.jar = {};
  mocks.avisar.mockClear();
  await crearGaleria(ANA, ['foto-1', 'foto-2']);
  await crearGaleria(EVA, ['eva-1']);
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

function enviar(body: unknown, headers: Record<string, string> = {}, slug: string = ANA) {
  return new Request(`http://localhost:3000/api/galeria/${slug}/seleccion`, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
const ctx = (slug: string = ANA) => ({ params: Promise.resolve({ slug }) });

async function sesionDe(slug: string): Promise<void> {
  const { token } = await sessions.createSession('client', slug, 'pareja');
  mocks.jar[CLIENT_COOKIE] = token;
}

describe('POST /api/galeria/[slug]/seleccion', () => {
  it('returns 401 and writes nothing without a session', async () => {
    const res = await route.POST(enviar({ items: [{ photoId: 'foto-1', liked: true, comment: '' }] }), ctx());
    expect(res.status).toBe(401);
    expect(await store.getSelection(ANA)).toBeNull();
  });

  it("returns 401 for another gallery's session, and leaves this gallery untouched", async () => {
    // El caso que el cliente quiere garantizado: una pareja con sesión abierta
    // no puede tocar la selección de otra boda cambiando el slug de la URL.
    await sesionDe(EVA);
    const res = await route.POST(enviar({ items: [{ photoId: 'foto-1', liked: true, comment: 'mía' }] }), ctx(ANA));
    expect(res.status).toBe(401);
    expect(await store.getSelection(ANA)).toBeNull();
  });

  it('returns 401 for an admin session presented in the client cookie', async () => {
    const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
    mocks.jar[ADMIN_COOKIE] = token;
    mocks.jar[CLIENT_COOKIE] = token;
    expect((await route.POST(enviar({ items: [] }), ctx())).status).toBe(401);
  });

  it('returns 403 when the request comes from another site', async () => {
    await sesionDe(ANA);
    const res = await route.POST(enviar({ items: [] }, { origin: 'https://otro.example' }), ctx());
    expect(res.status).toBe(403);
    expect(await store.getSelection(ANA)).toBeNull();
  });

  it('returns 404 when the session is valid but the gallery no longer exists', async () => {
    await sesionDe('boda-borrada');
    expect((await route.POST(enviar({ items: [] }, {}, 'boda-borrada'), ctx('boda-borrada'))).status).toBe(404);
  });

  it('returns 400 for a malformed body, without leaking internals', async () => {
    await sesionDe(ANA);
    const roto = await route.POST(enviar('{no-es-json'), ctx());
    expect(roto.status).toBe(400);
    const { error } = (await roto.json()) as { error: string };
    expect(error).not.toContain(dataRoot.root);
    expect(error).not.toMatch(/JSON|SyntaxError|Unexpected token/i);
  });

  it('returns 400 when items is not an array', async () => {
    await sesionDe(ANA);
    expect((await route.POST(enviar({ items: 'todas' }), ctx())).status).toBe(400);
    expect((await route.POST(enviar({}), ctx())).status).toBe(400);
    expect((await route.POST(enviar({ items: { 'foto-1': true } }), ctx())).status).toBe(400);
  });

  it('stores the selection the client sent', async () => {
    await sesionDe(ANA);
    const res = await route.POST(
      enviar({
        items: [
          { photoId: 'foto-1', liked: true, comment: 'esta para el álbum' },
          { photoId: 'foto-2', liked: false, comment: '' },
        ],
      }),
      ctx()
    );
    expect(res.status).toBe(200);
    const selection = await store.getSelection(ANA);
    expect(selection!.items).toEqual([
      { photoId: 'foto-1', liked: true, comment: 'esta para el álbum' },
      { photoId: 'foto-2', liked: false, comment: '' },
    ]);
  });

  it("drops photo ids that do not belong to this gallery", async () => {
    // El cuerpo lo escribe el cliente: sin este filtro, el panel del estudio
    // acabaría mostrando notas colgando de fotos que no son de esa boda.
    await sesionDe(ANA);
    const res = await route.POST(
      enviar({
        items: [
          { photoId: 'foto-1', liked: true, comment: 'buena' },
          { photoId: 'eva-1', liked: true, comment: 'de otra boda' },
          { photoId: '../../meta.json', liked: true, comment: 'travesía' },
        ],
      }),
      ctx()
    );
    expect(res.status).toBe(200);
    const selection = await store.getSelection(ANA);
    expect(selection!.items.map((i) => i.photoId)).toEqual(['foto-1']);
  });

  it('ignores entries that are not objects at all', async () => {
    await sesionDe(ANA);
    const res = await route.POST(
      enviar({ items: [null, 'foto-1', 42, [], { photoId: 'foto-2', liked: true, comment: '' }] }),
      ctx()
    );
    expect(res.status).toBe(200);
    expect((await store.getSelection(ANA))!.items).toEqual([{ photoId: 'foto-2', liked: true, comment: '' }]);
  });

  it('caps a comment instead of writing it whole to disk', async () => {
    // Sin tope, unos cuantos envíos llenan el disco del servidor.
    await sesionDe(ANA);
    await route.POST(enviar({ items: [{ photoId: 'foto-1', liked: true, comment: 'a'.repeat(50000) }] }), ctx());
    expect((await store.getSelection(ANA))!.items[0].comment).toHaveLength(2000);
  });

  it('normalises liked and comment instead of trusting whatever was sent', async () => {
    await sesionDe(ANA);
    await route.POST(
      enviar({ items: [{ photoId: 'foto-1', liked: 'sí', comment: { texto: 'objeto' } }] }),
      ctx()
    );
    const item = (await store.getSelection(ANA))!.items[0];
    expect(item.liked).toBe(false);
    expect(item.comment).toBe('');
  });

  /**
   * EL AVISO NO PUEDE SER UN AMPLIFICADOR. El limitador de la ruta permite
   * 240 escrituras cada diez minutos --tiene que permitirlas: cada corazón
   * que marca una pareja acaba en una--, y un correo por cada envío
   * definitivo son 240 correos en diez minutos al buzón del estudio,
   * disparables por cualquiera que tenga el enlace y la contraseña. Suficiente
   * para quemar la cuota del proveedor y, con ella, el formulario de
   * contacto.
   *
   * Sin mala intención tampoco hace falta: quien pulsa «Enviar» tres veces
   * porque no vio la confirmación mandaría tres.
   */
  it('avisa al estudio del primer envío, y no de los tres clics siguientes', async () => {
    await sesionDe(ANA);
    const cuerpo = { items: [{ photoId: 'foto-1', liked: true, comment: '' }] };

    for (let i = 0; i < 4; i += 1) {
      const res = await route.POST(enviar(cuerpo), ctx());
      expect(res.status).toBe(200);
    }

    expect(mocks.avisar).toHaveBeenCalledTimes(1);
    const datos = mocks.avisar.mock.calls[0][0];
    expect(datos.favoritas).toBe(1);
    expect(datos.total).toBe(2);
    expect(datos.panelUrl).toContain(`/admin/galerias/${ANA}`);
  });

  /** El guardado automático manda un borrador cada pocos segundos mientras la
   *  pareja marca. Si cada uno avisara, el buzón quedaría enterrado. */
  it('no avisa de los borradores del guardado automático', async () => {
    await sesionDe(ANA);
    for (let i = 0; i < 5; i += 1) {
      await route.POST(enviar({ borrador: true, items: [{ photoId: 'foto-1', liked: true, comment: '' }] }), ctx());
    }
    expect(mocks.avisar).not.toHaveBeenCalled();
  });

  /** Y el correo no puede tumbar el envío: la selección ya está en disco. */
  it('si el correo falla, la selección se guarda igual', async () => {
    await sesionDe(ANA);
    mocks.avisar.mockRejectedValueOnce(new Error('el servidor de correo no responde'));

    const res = await route.POST(enviar({ items: [{ photoId: 'foto-1', liked: true, comment: '' }] }), ctx());
    expect(res.status).toBe(200);

    const guardada = await store.getSelection(ANA);
    expect(guardada!.items).toHaveLength(1);
  });

  it('replaces the previous submission when the client changes their mind', async () => {
    await sesionDe(ANA);
    await route.POST(enviar({ items: [{ photoId: 'foto-1', liked: true, comment: '' }] }), ctx());
    await route.POST(enviar({ items: [{ photoId: 'foto-2', liked: true, comment: '' }] }), ctx());
    expect((await store.getSelection(ANA))!.items).toEqual([{ photoId: 'foto-2', liked: true, comment: '' }]);
  });
});
