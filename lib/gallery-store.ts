import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Data access for private client galleries. Same philosophy as
 * lib/contact-store.ts: plain JSON files under data/ (gitignored --
 * client photos and password hashes must never land in the repo), no
 * database dependency. One directory per gallery:
 *
 *   data/galleries/<slug>/meta.json        -- gallery + client credentials
 *   data/galleries/<slug>/photos/<file>    -- the actual image files,
 *                                              NEVER under public/ (that
 *                                              directory is always
 *                                              statically servable with
 *                                              no auth check possible --
 *                                              see app/[slug]/photo route)
 *   data/galleries/<slug>/selection.json   -- the client's latest
 *                                              submitted like/comment set
 */

export interface GalleryPhoto {
  id: string;
  filename: string;
  alt: string;
}

export interface GalleryMeta {
  slug: string;
  clientName: string;
  weddingDate?: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  photos: GalleryPhoto[];
}

export interface SelectionItem {
  photoId: string;
  liked: boolean;
  comment: string;
}

export interface Selection {
  items: SelectionItem[];
  submittedAt: string;
}

const GALLERIES_DIR = path.join(process.cwd(), 'data', 'galleries');

// Every existing top-level route (app/<name>/) and everything Next.js
// serves directly from public/ at the root -- a gallery slug living at
// app/[slug]/page.tsx must never be able to collide with one of these.
// Static segments always win their own route in Next.js's router, so
// none of these ever actually breaks even without this list -- this
// exists to stop an admin from CREATING a gallery whose slug would be
// permanently unreachable (shadowed by the real route) and silently
// confuse them, not to prevent a routing bug.
export const RESERVED_SLUGS = new Set([
  'contacto', 'servicios', 'trabajos', 'sobre-nosotros', 'admin', 'api',
  // Las tres rutas legales son rutas de primer nivel igual que las de
  // arriba (app/(site)/aviso-legal/, /privacidad/, /cookies/) y faltaban:
  // el formulario de alta aceptaba "privacidad" como slug y la galería
  // quedaba muerta sin decir nada, que es justo lo que esta lista existe
  // para impedir.
  'aviso-legal', 'privacidad', 'cookies',
  'status', 'favicon.ico', 'apple-icon.png', 'robots.txt', 'sitemap.xml',
  'fonts', 'images', 'videos', '_next',
]);

/**
 * Lowercase letters, digits and single hyphens only, no leading/trailing
 * hyphen. This is the ONLY gate between a URL segment (attacker-
 * controlled input) and a filesystem path under data/galleries/ -- every
 * store function below builds its path from a slug that has already
 * passed this check. A slug of `..` or `../../etc` never reaches here
 * with a passing result, so it can never escape GALLERIES_DIR.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && !RESERVED_SLUGS.has(slug);
}

/**
 * Same shape restriction as the slug, applied to the requested filename
 * in the photo-serving route (app/[slug]/photo/[filename]/route.ts) --
 * the second half of the path-traversal boundary. Filenames this project
 * writes are always `<uuid>.<ext>` (see saveUploadedPhoto), so this is
 * intentionally stricter than "no dot-dot": no path separators, no dots
 * except the single extension separator.
 */
export function isValidPhotoFilename(filename: string): boolean {
  return /^[a-z0-9-]+\.(webp|jpg|jpeg|png|avif)$/i.test(filename);
}

function galleryDir(slug: string): string {
  if (!isValidSlug(slug)) throw new Error(`Invalid gallery slug: ${slug}`);
  return path.join(GALLERIES_DIR, slug);
}

export function galleryPhotosDir(slug: string): string {
  return path.join(galleryDir(slug), 'photos');
}

export async function listGallerySlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(GALLERIES_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function getGalleryMeta(slug: string): Promise<GalleryMeta | null> {
  if (!isValidSlug(slug)) return null;
  try {
    const raw = await fs.readFile(path.join(galleryDir(slug), 'meta.json'), 'utf-8');
    return JSON.parse(raw) as GalleryMeta;
  } catch {
    return null;
  }
}

export async function saveGalleryMeta(meta: GalleryMeta): Promise<void> {
  const dir = galleryDir(meta.slug);
  // 0o700/0o600: meta.json guarda el hash de la contraseña de la galería y el
  // nombre del cliente. El modo por defecto (0o644) lo deja legible para
  // cualquier otra cuenta de la máquina, que en un hosting compartido son
  // desconocidos.
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2), { mode: 0o600 });
}

export async function getSelection(slug: string): Promise<Selection | null> {
  if (!isValidSlug(slug)) return null;
  try {
    const raw = await fs.readFile(path.join(galleryDir(slug), 'selection.json'), 'utf-8');
    return JSON.parse(raw) as Selection;
  } catch {
    return null;
  }
}

export async function saveSelection(slug: string, items: SelectionItem[]): Promise<void> {
  const dir = galleryDir(slug);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  // Los comentarios del cliente sobre sus propias fotos de boda son suyos, no
  // del resto de cuentas del servidor: mismo 0o600 que meta.json.
  const record: Selection = { items, submittedAt: new Date().toISOString() };
  await fs.writeFile(path.join(dir, 'selection.json'), JSON.stringify(record, null, 2), { mode: 0o600 });
}

/** Extensiones que este proyecto acepta subir y sirve después. */
export type ImageKind = 'jpg' | 'png' | 'webp' | 'avif';

/**
 * Detecta el tipo REAL de una imagen mirando sus primeros bytes.
 *
 * El `Content-Type` de un fichero en un multipart lo escribe el cliente: es un
 * campo de texto, no una comprobación. Un atacante con sesión de administración
 * --o el propio navegador mal usado-- puede declarar `image/jpeg` y subir un
 * .html, un .svg con <script> dentro o un fichero ejecutable, y el servidor lo
 * guardaba tal cual y luego lo devolvía. La extensión que acaba en disco sale
 * ahora de ESTOS bytes, no de lo que diga el cliente, así que lo que se guarda
 * y lo que se sirve como `Content-Type` siempre coinciden con el contenido.
 *
 * Los SVG quedan fuera a propósito: un SVG es un documento XML que puede
 * llevar <script> y se ejecuta si el navegador lo abre como documento.
 */
export function sniffImageKind(bytes: Uint8Array): ImageKind | null {
  const startsWith = (offset: number, sig: number[]) =>
    bytes.length >= offset + sig.length && sig.every((b, i) => bytes[offset + i] === b);
  const ascii = (offset: number, text: string) =>
    startsWith(offset, [...text].map((c) => c.charCodeAt(0)));

  // JPEG: SOI + marcador.
  if (startsWith(0, [0xff, 0xd8, 0xff])) return 'jpg';
  // PNG: firma de 8 bytes.
  if (startsWith(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  // WebP: contenedor RIFF con el tipo 'WEBP' en el byte 8.
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) return 'webp';
  // AVIF: caja ISO-BMFF 'ftyp' con marca 'avif' o 'avis' (secuencia).
  if (ascii(4, 'ftyp') && (ascii(8, 'avif') || ascii(8, 'avis'))) return 'avif';
  return null;
}

/** El `Content-Type` que se devuelve al servir cada tipo. Una sola definición
 * para la subida y para la ruta que sirve las fotos. */
export const IMAGE_CONTENT_TYPES: Record<ImageKind, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
};
