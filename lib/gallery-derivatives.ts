import fs from 'node:fs/promises';
import path from 'node:path';
import { galleryDerivativesDir, galleryPhotosDir, isValidPhotoFilename, isValidSlug } from '@/lib/gallery-store';
import { OPCIONES_SHARP } from '@/lib/sharp-limites';
import { ANCHOS, esAnchoValido, type Ancho } from '@/lib/gallery-anchos';

export { ANCHOS, esAnchoValido };
export type { Ancho };

/**
 * Copias reducidas de las fotos de una galería privada.
 *
 * EL PROBLEMA QUE RESUELVE. La cuadrícula de la galería pinta cada foto en
 * una casilla de entre 176 y 360 px de ancho, y hasta ahora recibía el
 * fichero tal y como salió de la cámara -- varios megas por miniatura. Una
 * boda de doscientas fotos obligaba a la pareja a descargar cientos de
 * megabytes para ver una cuadrícula, y en el móvil con datos eso es, sin más,
 * una galería que no carga. Es el mayor gasto de datos de todo el sitio, y el
 * único sitio donde no se podía arreglar con `next/image`: el optimizador de
 * Next pide la imagen por HTTP sin la cookie de sesión, así que contra una
 * ruta con contraseña recibe un 401.
 *
 * CÓMO. Se genera bajo demanda con sharp y se guarda en disco junto a la
 * galería. La primera visita paga el redimensionado de las que se vean; a
 * partir de ahí se sirve el fichero ya hecho. La caché es desechable: borrar
 * `derivados/` no pierde nada.
 *
 * ANCHOS CERRADOS, no un número libre de la URL. Un `?w=` abierto es una
 * invitación a pedir diez mil redimensionados distintos de la misma foto y
 * llenar el disco (y la CPU) de un servidor pequeño. Esta lista cubre lo que
 * la interfaz pide de verdad: la casilla a 1x y a 2x, y el visor a pantalla
 * completa en una pantalla normal y en una retina.
 */
// ANCHOS, Ancho y esAnchoValido viven ahora en lib/gallery-anchos.ts, sin una
// sola dependencia. Estaban aquí y los importaba lib/gallery-srcset, que usan
// dos componentes de CLIENTE: eso arrastraba este fichero --y con él `fs`,
// `path` y sharp-- al paquete del navegador, y la compilación de producción se
// caía con un «Can't resolve 'child_process'» que no se parece en nada a la
// causa. Se reexportan para no romper a quien ya los importaba de aquí.

/**
 * Devuelve la copia de `ancho` px de una foto, generándola si aún no existe.
 * `null` cuando la foto original no está.
 *
 * NO comprueba la sesión: eso es trabajo de la ruta, que lo hace antes de
 * llamar aquí. Esta función no debe usarse desde ningún sitio que no haya
 * comprobado antes quién pregunta.
 */
export async function copiaReducida(
  slug: string,
  filename: string,
  ancho: Ancho
): Promise<Uint8Array | null> {
  // Mismo cinturón que la ruta, por si algún día se llama desde otro sitio:
  // estos dos valores acaban dentro de un path.join.
  if (!isValidSlug(slug) || !isValidPhotoFilename(filename)) return null;

  const destino = path.join(galleryDerivativesDir(slug), `${ancho}-${filename}.webp`);
  try {
    return new Uint8Array(await fs.readFile(destino));
  } catch {
    // Todavía no está en caché: se genera.
  }

  let original: Buffer;
  try {
    original = await fs.readFile(path.join(galleryPhotosDir(slug), filename));
  } catch {
    return null;
  }

  // Importación diferida: sharp es un binario nativo y pesa. Cargarlo arriba
  // del módulo lo mete en el arranque del servidor aunque nadie abra una
  // galería en todo el día.
  const sharp = (await import('sharp')).default;
  // El techo de píxeles va en TODAS las llamadas a sharp del proyecto: ver
  // lib/sharp-limites.ts para qué ataque para y por qué 120 MP.
  const salida = await sharp(original, OPCIONES_SHARP)
    .rotate() // respeta la orientación EXIF; sin esto los verticales salen tumbados
    .resize({ width: ancho, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  // Se escribe primero con nombre temporal y se renombra: si dos visitas
  // piden la misma copia a la vez, ninguna lee un fichero a medio escribir.
  const tmp = `${destino}.${process.pid}-${Date.now()}.tmp`;
  try {
    await fs.mkdir(galleryDerivativesDir(slug), { recursive: true });
    await fs.writeFile(tmp, salida);
    await fs.rename(tmp, destino);
  } catch {
    // Si el disco está lleno o es de solo lectura, se sirve igual lo que se
    // acaba de calcular: la caché es una optimización, no un requisito.
    await fs.rm(tmp, { force: true }).catch(() => {});
  }
  return new Uint8Array(salida);
}
