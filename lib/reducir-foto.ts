/**
 * ENCOGER CADA FOTO EN EL NAVEGADOR, ANTES DE SUBIRLA.
 *
 * EL PROBLEMA. Una boda son cientos de fotos exportadas a 45 megapíxeles, y
 * eso no cabe en una sola subida: eme tenía que partirlas en tandas, esperar
 * cada una, y acordarse de por dónde iba. Desde una conexión de casa, cuarenta
 * fotos son varios cientos de megas y muchos minutos.
 *
 * POR QUÉ SE PUEDE ENCOGER SIN PERDER NADA. Esta galería es para ELEGIR, no
 * para imprimir: la pareja mira, marca corazones y escribe notas. Y el propio
 * sitio nunca sirve más de 2400 px de ancho ni siquiera en el visor a pantalla
 * completa (lib/gallery-srcset.ts), así que todo lo que pase de 2560 se tira
 * en el servidor de todas formas. Los originales se quedan donde tienen que
 * estar, en el disco de eme.
 *
 * En números: un JPEG de 12 MB recién salido del revelado sale de aquí en
 * torno a 600 KB. Cuarenta fotos pasan de unos 400 MB a unos 25.
 *
 * SI ALGO FALLA, SE SUBE EL ORIGINAL. Un navegador viejo, un fichero que el
 * decodificador no entiende, un canvas que se queda sin memoria: cualquiera de
 * esas cosas devuelve el fichero tal cual. Encoger es una mejora, no un
 * requisito, y perder la subida entera por ella sería un mal negocio.
 */

/** Lo que mide el lado largo después de encoger. El escalón más alto que
 *  llega a servir el sitio son 2400 px; 2560 deja un poco de aire. */
export const LADO_LARGO = 2560;

/** Sobre 0,82 la diferencia no se ve y el fichero crece deprisa. */
const CALIDAD = 0.82;

/** Por debajo de esto no merece la pena tocar nada: ya es pequeña. */
const YA_ES_PEQUENA = 1_200_000;

function dibujar(bitmap: ImageBitmap, ancho: number, alto: number): HTMLCanvasElement {
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const pincel = lienzo.getContext('2d');
  if (!pincel) throw new Error('sin contexto 2d');
  // El navegador ya interpola bien al reducir de una sola pasada con esto
  // puesto; hacerlo a mano en varios pasos no mejora nada visible.
  pincel.imageSmoothingEnabled = true;
  pincel.imageSmoothingQuality = 'high';
  pincel.drawImage(bitmap, 0, 0, ancho, alto);
  return lienzo;
}

function aBlob(lienzo: HTMLCanvasElement, tipo: string): Promise<Blob | null> {
  return new Promise((resolve) => lienzo.toBlob(resolve, tipo, CALIDAD));
}

/**
 * Devuelve una versión reducida, o el mismo fichero si no hace falta o no se
 * ha podido. Nunca lanza.
 */
export async function reducirFoto(file: File): Promise<File> {
  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') return file;

  let bitmap: ImageBitmap | null = null;
  try {
    // `imageOrientation: 'from-image'` es lo que respeta el EXIF: sin ello,
    // una foto vertical hecha con la cámara girada se sube tumbada -- y aquí
    // se pierde el EXIF para siempre, porque el canvas no lo conserva (que de
    // paso es justo lo que queremos: nadie tiene por qué recibir las
    // coordenadas de la casa de la novia).
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

    const mayor = Math.max(bitmap.width, bitmap.height);
    if (mayor <= LADO_LARGO && file.size <= YA_ES_PEQUENA) return file;

    const escala = Math.min(1, LADO_LARGO / mayor);
    const ancho = Math.max(1, Math.round(bitmap.width * escala));
    const alto = Math.max(1, Math.round(bitmap.height * escala));

    const lienzo = dibujar(bitmap, ancho, alto);

    // WebP primero; si el navegador no sabe, `toBlob` devuelve un PNG y eso
    // sería más grande que el original, así que se comprueba el tipo.
    let blob = await aBlob(lienzo, 'image/webp');
    let extension = 'webp';
    if (!blob || blob.type !== 'image/webp') {
      blob = await aBlob(lienzo, 'image/jpeg');
      extension = 'jpg';
    }
    if (!blob || blob.size === 0) return file;
    // Si encoger no ha servido de nada (una foto ya optimizada, un recorte
    // pequeño), se queda el original: es el que mejor se ve.
    if (blob.size >= file.size) return file;

    const nombre = file.name.replace(/\.[^.]+$/, '') + '.' + extension;
    return new File([blob], nombre, { type: blob.type, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
