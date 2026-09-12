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

/**
 * Dónde se guardan las copias reducidas de cada foto (ver
 * lib/gallery-derivatives.ts). Hermana de `photos/`, y por el mismo motivo
 * fuera de public/: una miniatura de una boda privada es tan privada como su
 * original, y bajo public/ no habría forma de comprobar la sesión.
 *
 * Es una caché: se puede borrar entera en caliente y se vuelve a rellenar
 * sola con la siguiente visita.
 */
export function galleryDerivativesDir(slug: string): string {
  return path.join(galleryDir(slug), 'derivados');
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

/**
 * Escribe meta.json de forma ATÓMICA: primero un temporal al lado, luego un
 * rename, que dentro del mismo sistema de ficheros es indivisible.
 *
 * Sin esto, un proceso que muriera a media escritura dejaba un meta.json
 * truncado; `getGalleryMeta` capturaba el error de JSON, devolvía null, y la
 * galería pasaba a ser un 404 permanente con las fotos intactas al lado e
 * inalcanzables. Es un modo de fallo irreversible que cuesta una línea evitar.
 */
async function escribirJsonAtomico(destino: string, contenido: unknown): Promise<void> {
  const tmp = `${destino}.${process.pid}-${Date.now()}.tmp`;
  try {
    await fs.writeFile(tmp, JSON.stringify(contenido, null, 2), { mode: 0o600 });
    await fs.rename(tmp, destino);
  } catch (err) {
    await fs.rm(tmp, { force: true }).catch(() => {});
    throw err;
  }
}

async function escribirMetaAtomico(dir: string, meta: GalleryMeta): Promise<void> {
  await escribirJsonAtomico(path.join(dir, 'meta.json'), meta);
}

/**
 * Actualiza la ficha de una galería que YA EXISTE, sin crear nada si no
 * existe. Ver el comentario de `updateGalleryPasswordHash` para por qué esa
 * distinción importa.
 */
async function escribirMetaExistente(slug: string, meta: GalleryMeta): Promise<void> {
  const dir = galleryDir(slug);
  // Comprobación explícita y justo antes de escribir: reduce la ventana a lo
  // mínimo que permite un almacén en ficheros sin un bloqueo de verdad.
  await fs.access(path.join(dir, 'meta.json'));
  await escribirMetaAtomico(dir, meta);
}

export async function saveGalleryMeta(meta: GalleryMeta): Promise<void> {
  const dir = galleryDir(meta.slug);
  // 0o700/0o600: meta.json guarda el hash de la contraseña de la galería y el
  // nombre del cliente. El modo por defecto (0o644) lo deja legible para
  // cualquier otra cuenta de la máquina, que en un hosting compartido son
  // desconocidos.
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await escribirMetaAtomico(dir, meta);
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

/**
 * ATÓMICA, igual que meta.json, y por el mismo motivo escrito doce líneas más
 * arriba -- que aquí pesa todavía más.
 *
 * Escribía con un `fs.writeFile` directo. Si el proceso muere a media
 * escritura --o si la pareja envía desde el móvil y desde el portátil a la
 * vez--, `getSelection` captura el error de JSON y devuelve `null`: la
 * selección entera de la boda desaparece, y desaparece EN SILENCIO, porque el
 * panel entonces dice «El cliente todavía no ha enviado su selección». El
 * estudio no ve un error, ve una pareja que no ha contestado.
 */
export async function saveSelection(slug: string, items: SelectionItem[]): Promise<void> {
  const dir = galleryDir(slug);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  // Los comentarios del cliente sobre sus propias fotos de boda son suyos, no
  // del resto de cuentas del servidor: mismo 0o600 que meta.json.
  const record: Selection = { items, submittedAt: new Date().toISOString() };
  await escribirJsonAtomico(path.join(dir, 'selection.json'), record);
}

/**
 * BORRA UNA GALERÍA ENTERA, con todo lo que cuelga de ella.
 *
 * Antes de esto no había forma de quitar una galería del panel, y eso no era
 * sólo una comodidad que faltaba: una boda entregada se quedaba en el disco
 * para siempre --con las fotos, el nombre del cliente y el hash de su
 * contraseña--, un error de dedo al crearla obligaba a empezar con otro slug
 * dejando el anterior muerto e inalcanzable, y no existía manera de atender
 * una petición de supresión del RGPD sin entrar por SSH.
 *
 * SE BORRA EL DIRECTORIO ENTERO, no fichero a fichero: dentro van meta.json,
 * selection.json, photos/ y derivados/, y borrar sólo lo que esta función
 * conozca por su nombre dejaría huérfano cualquier fichero que se añada en el
 * futuro. `recursive: true` sobre el directorio de la galería los cubre todos
 * hoy y los que vengan.
 *
 * `force: false` a propósito: si el directorio no existe, `fs.rm` lanza y
 * devolvemos false, para que la ruta pueda responder 404 en vez de fingir que
 * ha borrado algo que nunca estuvo.
 *
 * Ojo: esto NO cierra las sesiones abiertas de esa galería. Eso lo hace la
 * ruta, llamando a `destroySessionsForSubject` -- va aparte porque las
 * sesiones viven en su propio almacén y esta función no debería saber nada de
 * él.
 */
export async function deleteGallery(slug: string): Promise<boolean> {
  if (!isValidSlug(slug)) return false;
  try {
    await fs.rm(galleryDir(slug), { recursive: true, force: false });
    return true;
  } catch (err) {
    // SÓLO "no existía" devuelve false. Cualquier otro fallo --permisos, el
    // fichero en uso, un borrado recursivo que murió a mitad-- se propaga
    // para que la ruta responda 500.
    // Tragárselo todo era peor de lo que parece: la ruta traducía ese false a
    // un 404 "Galería no encontrada", no cerraba las sesiones, y el estudio
    // leía que no había pasado nada cuando en realidad podía quedar el
    // directorio medio vaciado y la pareja dentro durante treinta días.
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw err;
  }
}

/**
 * Cambia la contraseña de una galería, dejando el resto de la ficha intacta.
 *
 * Existe porque el panel sólo enseñaba la contraseña UNA vez, al crear la
 * galería, y no había forma de volver a fijarla: si el estudio no la apuntó y
 * la pareja la perdía, esa galería quedaba inaccesible para siempre y --antes
 * de `deleteGallery`-- tampoco se podía borrar. Pasa el primer mes de uso
 * real.
 *
 * Recibe el hash ya calculado y no la contraseña en claro: que este fichero
 * no sepa nada de scrypt es lo que mantiene el hasheo en un solo sitio
 * (lib/auth/password.ts) y evita que una segunda llamada acabe guardando algo
 * con otro coste o sin sal.
 */
export async function updateGalleryPasswordHash(
  slug: string,
  passwordHash: string
): Promise<boolean> {
  const meta = await getGalleryMeta(slug);
  if (!meta) return false;
  // ESCRIBE SOBRE UN FICHERO QUE TIENE QUE EXISTIR YA, y no pasa por
  // `saveGalleryMeta`, que empieza por un `mkdir` incondicional.
  //
  // La diferencia no es de estilo: entre el `getGalleryMeta` de arriba y esta
  // escritura cabe un borrado. Con el `mkdir`, ese hueco recreaba
  // data/galleries/<slug>/meta.json con el nombre del cliente, su usuario y
  // un hash de contraseña -- datos personales que acababan de borrarse por
  // una petición de supresión volvían al disco, y la galería reaparecía vacía
  // en el panel. Con `flag: 'r+'` sobre un fichero que ya no está, la
  // escritura falla y no resucita nada.
  await escribirMetaExistente(slug, { ...meta, passwordHash });
  return true;
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
