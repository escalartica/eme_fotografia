// @vitest-environment node
//
// Entorno `node`, no el `jsdom` por defecto del proyecto: este módulo es código
// de servidor puro (node:fs, node:path) y no toca el DOM. En jsdom, además,
// `File`/`FormData` son los de jsdom y no los de Node, que es lo que de verdad
// recibe una Route Handler en producción.
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createTempDataRoot } from './test-helpers/temp-data-root';
import { hashPassword, verifyPassword } from './auth/password';

const dataRoot = createTempDataRoot('eme-gallery-store-');
const galleriesDir = path.join(dataRoot.root, 'data', 'galleries');

let store: typeof import('./gallery-store');

beforeAll(async () => {
  store = await dataRoot.load(() => import('./gallery-store'));
});

afterEach(async () => {
  await fs.rm(galleriesDir, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(dataRoot.root, { recursive: true, force: true });
});

const enc = new TextEncoder();
/** Construye la cabecera de un fichero a partir de bytes y de texto ASCII. */
function bytes(...parts: Array<number[] | string>): Uint8Array {
  return new Uint8Array(parts.flatMap((p) => (typeof p === 'string' ? Array.from(enc.encode(p)) : p)));
}

async function makeGallery(slug: string, password: string) {
  await store.saveGalleryMeta({
    slug,
    clientName: 'Ana y Luis',
    weddingDate: '2027-06-12',
    username: 'ana',
    passwordHash: await hashPassword(password),
    createdAt: '2026-09-01T10:00:00.000Z',
    photos: [
      { id: 'foto-1', filename: 'foto-1.jpg', alt: 'Foto 1' },
      { id: 'foto-2', filename: 'foto-2.jpg', alt: 'Foto 2' },
    ],
  });
}

describe('isValidSlug', () => {
  it('accepts the shape the studio actually types for a wedding link', () => {
    expect(store.isValidSlug('boda-ana-y-luis')).toBe(true);
    expect(store.isValidSlug('ana2027')).toBe(true);
    expect(store.isValidSlug('a')).toBe(true);
  });

  it('rejects path traversal and anything with a separator in it', () => {
    // Esta función es la ÚNICA frontera entre un segmento de URL y un
    // path.join sobre data/galleries/: si alguno de estos pasara, una petición
    // podría leer o escribir fuera del directorio de galerías.
    expect(store.isValidSlug('..')).toBe(false);
    expect(store.isValidSlug('../../etc')).toBe(false);
    expect(store.isValidSlug('boda/ana')).toBe(false);
    expect(store.isValidSlug('boda\\ana')).toBe(false);
    expect(store.isValidSlug('%2e%2e')).toBe(false);
    expect(store.isValidSlug('..%2fadmin')).toBe(false);
  });

  it('rejects uppercase, dots, spaces, underscores and stray hyphens', () => {
    expect(store.isValidSlug('Boda-Ana')).toBe(false);
    expect(store.isValidSlug('boda.ana')).toBe(false);
    expect(store.isValidSlug('boda ana')).toBe(false);
    expect(store.isValidSlug('boda_ana')).toBe(false);
    expect(store.isValidSlug('-boda')).toBe(false);
    expect(store.isValidSlug('boda-')).toBe(false);
    expect(store.isValidSlug('boda--ana')).toBe(false);
  });

  it('rejects the empty string', () => {
    expect(store.isValidSlug('')).toBe(false);
  });

  it('rejects every reserved slug, so no gallery can be created at a dead URL', () => {
    // Una galería creada con uno de estos nombres queda permanentemente
    // ensombrecida por la ruta estática de Next y el estudio no se entera:
    // el enlace que le da a su cliente abre otra página.
    for (const reserved of store.RESERVED_SLUGS) {
      expect(store.isValidSlug(reserved), `slug reservado: ${reserved}`).toBe(false);
    }
  });

  it('rejects the three legal pages, which are real top-level routes', () => {
    // Se añadieron después que el resto de la lista: antes el formulario de
    // alta aceptaba "privacidad" y la galería nacía muerta sin decir nada.
    expect(store.isValidSlug('aviso-legal')).toBe(false);
    expect(store.isValidSlug('privacidad')).toBe(false);
    expect(store.isValidSlug('cookies')).toBe(false);
  });
});

describe('isValidPhotoFilename', () => {
  it('accepts the `<uuid>.<ext>` names this project writes', () => {
    expect(store.isValidPhotoFilename('ce53274e-75ba-4c5a-8707-5af7d7bfcc65.jpg')).toBe(true);
    expect(store.isValidPhotoFilename('a.webp')).toBe(true);
    expect(store.isValidPhotoFilename('a.png')).toBe(true);
    expect(store.isValidPhotoFilename('a.avif')).toBe(true);
    expect(store.isValidPhotoFilename('a.jpeg')).toBe(true);
  });

  it('rejects path traversal in the filename segment', () => {
    // La otra mitad de la frontera: app/[slug]/photo/[filename] mete esto en un
    // path.join sobre el directorio de fotos de la galería.
    expect(store.isValidPhotoFilename('../secret.jpg')).toBe(false);
    expect(store.isValidPhotoFilename('..')).toBe(false);
    expect(store.isValidPhotoFilename('../../meta.json')).toBe(false);
    expect(store.isValidPhotoFilename('a/b.jpg')).toBe(false);
    expect(store.isValidPhotoFilename('a\\b.jpg')).toBe(false);
    expect(store.isValidPhotoFilename('a..jpg')).toBe(false);
  });

  it('rejects extensions that a browser would execute or render as a document', () => {
    expect(store.isValidPhotoFilename('photo.svg')).toBe(false);
    expect(store.isValidPhotoFilename('photo.html')).toBe(false);
    expect(store.isValidPhotoFilename('photo.php')).toBe(false);
    expect(store.isValidPhotoFilename('photo.jpg.exe')).toBe(false);
    expect(store.isValidPhotoFilename('.jpg')).toBe(false);
    expect(store.isValidPhotoFilename('photo.jpg%00.txt')).toBe(false);
    expect(store.isValidPhotoFilename('')).toBe(false);
  });
});

describe('sniffImageKind', () => {
  it('identifies a JPEG by its SOI marker', () => {
    expect(store.sniffImageKind(bytes([0xff, 0xd8, 0xff, 0xe0], [0x00, 0x10], 'JFIF'))).toBe('jpg');
  });

  it('identifies a PNG by its 8-byte signature', () => {
    expect(store.sniffImageKind(bytes([0x89], 'PNG', [0x0d, 0x0a, 0x1a, 0x0a], [0, 0, 0, 0x0d]))).toBe('png');
  });

  it('identifies a WebP by the RIFF container plus the WEBP fourcc', () => {
    expect(store.sniffImageKind(bytes('RIFF', [0x24, 0, 0, 0], 'WEBP', 'VP8 '))).toBe('webp');
  });

  it('identifies both AVIF brands (still image and sequence)', () => {
    expect(store.sniffImageKind(bytes([0, 0, 0, 0x20], 'ftyp', 'avif', [0, 0, 0, 0]))).toBe('avif');
    expect(store.sniffImageKind(bytes([0, 0, 0, 0x20], 'ftyp', 'avis', [0, 0, 0, 0]))).toBe('avif');
  });

  it('rejects an HTML page uploaded as if it were a photo', () => {
    // El Content-Type de un multipart lo escribe quien sube el fichero: si el
    // servidor se fiara de él, bastaría declarar image/jpeg para dejar un .html
    // servido desde el dominio del estudio.
    expect(store.sniffImageKind(bytes('<!DOCTYPE html><html><body>hola</body></html>'))).toBe(null);
  });

  it('rejects an SVG, which is a document that can carry <script>', () => {
    expect(store.sniffImageKind(bytes('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBe(
      null
    );
    expect(store.sniffImageKind(bytes('<?xml version="1.0"?><svg></svg>'))).toBe(null);
  });

  it('rejects other real image formats this project does not serve, and truncated input', () => {
    expect(store.sniffImageKind(bytes('GIF89a'))).toBe(null);
    expect(store.sniffImageKind(bytes([0x42, 0x4d]))).toBe(null); // BMP
    expect(store.sniffImageKind(bytes([0xff, 0xd8]))).toBe(null); // JPEG a medias
    expect(store.sniffImageKind(new Uint8Array())).toBe(null);
  });

  it('has a content type for every kind it can return', () => {
    // Si alguien añade un tipo al sniffer y olvida el Content-Type, la ruta que
    // sirve las fotos devolvería `undefined` en la cabecera.
    for (const kind of ['jpg', 'png', 'webp', 'avif'] as const) {
      expect(store.IMAGE_CONTENT_TYPES[kind]).toMatch(/^image\//);
    }
  });
});

describe('galleryPhotosDir', () => {
  it('resolves inside the galleries directory', () => {
    // Esta aserción es además el seguro de los tests: si la redirección a un
    // directorio temporal dejara de funcionar, este test falla en vez de que
    // toda la suite empiece a escribir en los datos reales del estudio.
    expect(store.galleryPhotosDir('boda-ana')).toBe(path.join(galleriesDir, 'boda-ana', 'photos'));
  });

  it('throws instead of building a path for an invalid slug', () => {
    expect(() => store.galleryPhotosDir('..')).toThrow(/Invalid gallery slug/);
    expect(() => store.galleryPhotosDir('../../etc')).toThrow(/Invalid gallery slug/);
    expect(() => store.galleryPhotosDir('privacidad')).toThrow(/Invalid gallery slug/);
  });
});

describe('galerías en disco', () => {
  it('creates a gallery and reads it back', async () => {
    await makeGallery('boda-ana', 'contra-segura-1234');
    const meta = await store.getGalleryMeta('boda-ana');
    expect(meta).not.toBeNull();
    expect(meta!.clientName).toBe('Ana y Luis');
    expect(meta!.weddingDate).toBe('2027-06-12');
    expect(meta!.username).toBe('ana');
    expect(meta!.photos).toHaveLength(2);
  });

  it("accepts the gallery's own password and rejects a different one", async () => {
    await makeGallery('boda-ana', 'contra-segura-1234');
    const meta = await store.getGalleryMeta('boda-ana');
    expect(await verifyPassword('contra-segura-1234', meta!.passwordHash)).toBe(true);
    expect(await verifyPassword('contra-segura-1235', meta!.passwordHash)).toBe(false);
    expect(await verifyPassword('', meta!.passwordHash)).toBe(false);
  });

  it('never stores the password in clear', async () => {
    await makeGallery('boda-ana', 'contra-segura-1234');
    const raw = await fs.readFile(path.join(galleriesDir, 'boda-ana', 'meta.json'), 'utf-8');
    expect(raw).not.toContain('contra-segura-1234');
    expect(raw).toContain('scrypt:');
  });

  it("writes meta.json unreadable to other accounts on the machine", async () => {
    // Guarda el hash de la contraseña y el nombre del cliente. El modo por
    // defecto (0644) lo deja legible para cualquier otra cuenta de un hosting
    // compartido.
    await makeGallery('boda-ana', 'contra-segura-1234');
    const stat = await fs.stat(path.join(galleriesDir, 'boda-ana', 'meta.json'));
    expect(stat.mode & 0o777).toBe(0o600);
  });

  it('returns null for a slug that has no gallery', async () => {
    expect(await store.getGalleryMeta('no-existe')).toBeNull();
  });

  it('returns null, without throwing, for a traversal slug', async () => {
    expect(await store.getGalleryMeta('..')).toBeNull();
    expect(await store.getGalleryMeta('../../etc')).toBeNull();
    expect(await store.getGalleryMeta('')).toBeNull();
  });

  it('refuses to write a gallery under an invalid slug', async () => {
    await expect(
      store.saveGalleryMeta({
        slug: '../../etc',
        clientName: 'x',
        username: 'x',
        passwordHash: 'scrypt:aa:bb',
        createdAt: '2026-09-01T10:00:00.000Z',
        photos: [],
      })
    ).rejects.toThrow(/Invalid gallery slug/);
  });

  it('lists nothing before any gallery exists and the created slugs afterwards', async () => {
    expect(await store.listGallerySlugs()).toEqual([]);
    await makeGallery('boda-ana', 'contra-segura-1234');
    await makeGallery('boda-eva', 'contra-segura-1234');
    expect((await store.listGallerySlugs()).sort()).toEqual(['boda-ana', 'boda-eva']);
  });
});

describe('selección del cliente', () => {
  it('returns null while the client has not sent anything', async () => {
    await makeGallery('boda-ana', 'contra-segura-1234');
    expect(await store.getSelection('boda-ana')).toBeNull();
  });

  it('stores the selection and reads it back with a timestamp', async () => {
    await makeGallery('boda-ana', 'contra-segura-1234');
    await store.saveSelection('boda-ana', [
      { photoId: 'foto-1', liked: true, comment: 'esta para el álbum' },
      { photoId: 'foto-2', liked: false, comment: '' },
    ]);
    const selection = await store.getSelection('boda-ana');
    expect(selection!.items).toEqual([
      { photoId: 'foto-1', liked: true, comment: 'esta para el álbum' },
      { photoId: 'foto-2', liked: false, comment: '' },
    ]);
    expect(Number.isNaN(Date.parse(selection!.submittedAt))).toBe(false);
  });

  it('replaces the previous selection instead of appending to it', async () => {
    // El cliente reenvía su selección cada vez que cambia de opinión: si se
    // acumulara, el estudio vería marcadas fotos que el cliente ya descartó.
    await makeGallery('boda-ana', 'contra-segura-1234');
    await store.saveSelection('boda-ana', [{ photoId: 'foto-1', liked: true, comment: '' }]);
    await store.saveSelection('boda-ana', [{ photoId: 'foto-2', liked: true, comment: '' }]);
    const selection = await store.getSelection('boda-ana');
    expect(selection!.items).toEqual([{ photoId: 'foto-2', liked: true, comment: '' }]);
  });

  it('writes selection.json unreadable to other accounts on the machine', async () => {
    await makeGallery('boda-ana', 'contra-segura-1234');
    await store.saveSelection('boda-ana', [{ photoId: 'foto-1', liked: true, comment: 'privado' }]);
    const stat = await fs.stat(path.join(galleriesDir, 'boda-ana', 'selection.json'));
    expect(stat.mode & 0o777).toBe(0o600);
  });

  it('returns null and refuses to write for a traversal slug', async () => {
    expect(await store.getSelection('../../etc')).toBeNull();
    await expect(store.saveSelection('../../etc', [])).rejects.toThrow(/Invalid gallery slug/);
  });
});
