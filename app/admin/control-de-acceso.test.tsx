import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { createTempDataRoot } from '@/lib/test-helpers/temp-data-root';
import { ADMIN_COOKIE, CLIENT_COOKIE } from '@/lib/auth/cookies';
import { hashPassword } from '@/lib/auth/password';

/**
 * CONTROL DE ACCESO DE LAS PÁGINAS PRIVADAS.
 *
 * Las rutas de la API ya tenían sus pruebas; las PÁGINAS del panel y de la
 * galería no tenían ninguna, y son la otra mitad de la puerta: cada una
 * comprueba la sesión por su cuenta. Aquí se fija, página por página, que sin
 * sesión no se ve nada, y que la sesión de una galería no abre otra.
 */

class Redireccion extends Error {
  constructor(public readonly destino: string) {
    super(`redirect ${destino}`);
  }
}
class NoEncontrado extends Error {}

const mocks = vi.hoisted(() => ({ jar: {} as Record<string, string>, host: 'www.emefotografiasevilla.com' }));
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw new Redireccion(destino);
  },
  notFound: () => {
    throw new NoEncontrado();
  },
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin',
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mocks.jar[name] === undefined ? undefined : { name, value: mocks.jar[name] }),
  }),
  headers: async () => new Headers({ host: mocks.host }),
}));

const dataRoot = createTempDataRoot('eme-paginas-privadas-');
const dataDir = path.join(dataRoot.root, 'data');

type Pagina = (props: never) => Promise<React.ReactElement>;
let paginas: Record<string, Pagina>;
let sessions: typeof import('@/lib/auth/session');
let store: typeof import('@/lib/gallery-store');
let contacto: typeof import('@/lib/contact-store');
let recovery: typeof import('@/lib/admin-recovery');

beforeAll(async () => {
  const cargado = await dataRoot.load(async () => ({
    panel: (await import('./page')).default,
    mensajes: (await import('./mensajes/page')).default,
    estadisticas: (await import('./estadisticas/page')).default,
    nueva: (await import('./galerias/nueva/page')).default,
    detalle: (await import('./galerias/[slug]/page')).default,
    login: (await import('./login/page')).default,
    recuperar: (await import('./recuperar/page')).default,
    token: (await import('./recuperar/[token]/page')).default,
    galeria: (await import('../[slug]/page')).default,
    sessions: await import('@/lib/auth/session'),
    store: await import('@/lib/gallery-store'),
    contacto: await import('@/lib/contact-store'),
    recovery: await import('@/lib/admin-recovery'),
  }));
  const { sessions: s, store: st, contacto: c, recovery: r, ...resto } = cargado;
  paginas = resto as unknown as Record<string, Pagina>;
  sessions = s;
  store = st;
  contacto = c;
  recovery = r;
});

const SLUG = 'boda-ana-y-luis';

beforeEach(async () => {
  mocks.jar = {};
  await fs.rm(dataDir, { recursive: true, force: true });
  await store.saveGalleryMeta({
    slug: SLUG,
    clientName: 'Ana y Luis',
    weddingDate: '2026-06-20',
    username: 'ana',
    passwordHash: await hashPassword('secreta-de-la-boda'),
    createdAt: '2026-09-01T10:00:00.000Z',
    photos: [
      { id: 'f1', filename: 'f1.webp', alt: 'Los novios en la escalera' },
      { id: 'f2', filename: 'f2.webp', alt: 'El ramo' },
    ],
  });
  await store.saveSelection(SLUG, [{ photoId: 'f1', liked: true, comment: 'Esta en grande' }]);
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

async function comoAdmin() {
  const { token } = await sessions.createSession('admin', 'estudio', 'estudio');
  mocks.jar[ADMIN_COOKIE] = token;
}
async function comoPareja(slug = SLUG) {
  const { token } = await sessions.createSession('client', slug, 'ana');
  mocks.jar[CLIENT_COOKIE] = token;
}
const conSlug = (slug: string) => ({ params: Promise.resolve({ slug }) }) as never;

async function destinoDe(promesa: Promise<unknown>): Promise<string | null> {
  try {
    await promesa;
    return null;
  } catch (err) {
    if (err instanceof Redireccion) return err.destino;
    throw err;
  }
}

describe('páginas del panel sin sesión', () => {
  it.each([
    ['panel', undefined],
    ['mensajes', undefined],
    ['estadisticas', { searchParams: Promise.resolve({}) }],
    ['nueva', undefined],
    ['detalle', conSlug(SLUG)],
  ])('%s manda al acceso', async (nombre, props) => {
    expect(await destinoDe(paginas[nombre](props as never))).toBe('/admin/login');
  });

  it('una sesión de PAREJA no abre el panel', async () => {
    await comoPareja();
    expect(await destinoDe(paginas.panel(undefined as never))).toBe('/admin/login');
  });

  it('una cookie inventada no abre el panel', async () => {
    mocks.jar[ADMIN_COOKIE] = 'inventada';
    expect(await destinoDe(paginas.panel(undefined as never))).toBe('/admin/login');
  });
});

describe('páginas del panel con sesión', () => {
  it('el panel lista las galerías con su selección', async () => {
    await comoAdmin();
    render(await paginas.panel(undefined as never));
    expect(screen.getByRole('heading', { name: 'Galerías privadas' })).toBeInTheDocument();
    expect(screen.getAllByText(/Ana y Luis/).length).toBeGreaterThan(0);
  });

  it('el panel sin galerías no se rompe', async () => {
    await fs.rm(path.join(dataDir, 'galleries'), { recursive: true, force: true });
    await comoAdmin();
    render(await paginas.panel(undefined as never));
    expect(screen.getByRole('heading', { name: 'Galerías privadas' })).toBeInTheDocument();
  });

  it('mensajes enseña lo que ha llegado por el formulario', async () => {
    await contacto.saveContactSubmission({
      nombre: 'Lucía Pérez',
      email: 'lucia@example.com',
      telefono: '600000000',
      fecha: '2027-05-01',
      lugar: 'Sevilla',
      tipoEvento: 'Boda',
      mensaje: 'Nos casamos en mayo',
      consentimiento: 'si',
    } as never);
    await comoAdmin();
    render(await paginas.mensajes(undefined as never));
    expect(screen.getByRole('heading', { name: 'Mensajes recibidos' })).toBeInTheDocument();
    expect(screen.getByText(/Lucía Pérez/)).toBeInTheDocument();
  });

  it('estadísticas se pinta aunque no haya visitas', async () => {
    await comoAdmin();
    render(await paginas.estadisticas({ searchParams: Promise.resolve({ dias: '7' }) } as never));
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
  });

  it('el detalle de una galería existe y el de una inventada es 404', async () => {
    await comoAdmin();
    render(await paginas.detalle(conSlug(SLUG)));
    expect(screen.getAllByText(/Ana y Luis/).length).toBeGreaterThan(0);
    await expect(paginas.detalle(conSlug('no-existe'))).rejects.toBeInstanceOf(NoEncontrado);
  });

  it('con sesión, el acceso y la recuperación llevan al panel', async () => {
    await comoAdmin();
    expect(await destinoDe(paginas.login(undefined as never))).toBe('/admin');
    expect(await destinoDe(paginas.recuperar(undefined as never))).toBe('/admin');
  });
});

describe('acceso y recuperación sin sesión', () => {
  it('el acceso enseña el formulario', async () => {
    render(await paginas.login(undefined as never));
    expect(screen.getByRole('heading', { name: 'Acceso de administración' })).toBeInTheDocument();
  });

  it('recuperar enseña el formulario', async () => {
    render(await paginas.recuperar(undefined as never));
    expect(screen.getByRole('button', { name: 'Enviarme el enlace' })).toBeInTheDocument();
  });

  it('un enlace de recuperación inventado no enseña el formulario', async () => {
    render(await paginas.token({ params: Promise.resolve({ token: 'inventado' }) } as never));
    expect(screen.getByRole('heading', { name: 'Este enlace ya no sirve' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Contraseña nueva')).not.toBeInTheDocument();
  });

  it('un enlace bueno sí enseña el formulario', async () => {
    const { token } = await recovery.crearToken();
    render(await paginas.token({ params: Promise.resolve({ token }) } as never));
    expect(screen.getByLabelText('Contraseña nueva')).toBeInTheDocument();
  });
});

describe('galería privada de la pareja', () => {
  it('sin sesión enseña el acceso, no las fotos', async () => {
    render(await paginas.galeria(conSlug(SLUG)));
    expect(screen.getByRole('heading', { name: 'Vuestras fotos de boda' })).toBeInTheDocument();
    expect(screen.queryByAltText('Los novios en la escalera')).not.toBeInTheDocument();
  });

  it('la sesión de OTRA galería no abre esta', async () => {
    await store.saveGalleryMeta({
      slug: 'boda-otra',
      clientName: 'Otra pareja',
      username: 'otra',
      passwordHash: await hashPassword('otra-contrasena-1'),
      createdAt: '2026-09-02T10:00:00.000Z',
      photos: [],
    });
    await comoPareja('boda-otra');
    render(await paginas.galeria(conSlug(SLUG)));
    expect(screen.getByRole('heading', { name: 'Vuestras fotos de boda' })).toBeInTheDocument();
  });

  it('con su sesión ve la galería', async () => {
    await comoPareja();
    render(await paginas.galeria(conSlug(SLUG)));
    expect(screen.queryByRole('heading', { name: 'Vuestras fotos de boda' })).not.toBeInTheDocument();
    expect(screen.getAllByText(/Ana y Luis/).length).toBeGreaterThan(0);
  });

  it('una galería que no existe es 404, no un formulario de acceso', async () => {
    await expect(paginas.galeria(conSlug('no-existe'))).rejects.toBeInstanceOf(NoEncontrado);
  });

  it('un slug con ../ es 404', async () => {
    await expect(paginas.galeria(conSlug('..%2F..%2Fetc'))).rejects.toBeInstanceOf(NoEncontrado);
  });
});
