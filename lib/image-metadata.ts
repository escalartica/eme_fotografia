import type { ImageKind } from '@/lib/gallery-store';
import { OPCIONES_SHARP } from '@/lib/sharp-limites';

/**
 * QUITA LOS METADATOS DE UNA FOTO ANTES DE GUARDARLA.
 *
 * POR QUÉ. Un JPEG salido de una cámara o de un móvil lleva dentro un bloque
 * EXIF, y ese bloque puede llevar las COORDENADAS GPS del sitio donde se
 * disparó. Las fotos de estas galerías se guardaban byte a byte tal y como
 * llegaban y se servían igual, así que la ubicación exacta de la finca --y de
 * la casa de los novios, si hay fotos de los preparativos-- viajaba dentro de
 * cada fichero que la pareja se descarga y reenvía. Lleva además la marca y
 * el número de serie de la cámara, y a veces el nombre del propietario.
 *
 * SIN REENCODAR LOS PÍXELES, que es la parte que importa en una web que vende
 * fotografía. Un JPEG es una secuencia de segmentos: los metadatos viven en
 * unos concretos y se pueden quitar recortando el fichero, dejando los datos
 * de imagen intactos byte a byte. Lo mismo con PNG, que es una secuencia de
 * trozos. Reencodar con sharp habría sido cuatro líneas, pero mete una
 * generación de pérdida en el fichero que el estudio entrega.
 *
 * LA ÚNICA EXCEPCIÓN ES LA ORIENTACIÓN. El EXIF no sólo lleva el GPS: lleva
 * también cómo hay que girar la foto al mostrarla. Quitarlo de un fichero con
 * orientación distinta de 1 dejaría todos los verticales tumbados. En ese
 * caso --y sólo en ese-- sí hay que girar de verdad los píxeles, y ahí sí se
 * reencoda, porque no hay otra forma. Los ficheros exportados desde Lightroom
 * o Capture One ya vienen girados y con orientación 1, que es el caso normal
 * de este estudio.
 *
 * QUÉ SE CONSERVA: el perfil de color ICC (APP2 en JPEG, iCCP en PNG). No es
 * un dato personal y sin él los colores se desplazan al abrir la foto en otro
 * programa, que en una entrega de boda es un defecto visible.
 */

/** Marcadores JPEG cuyo segmento se tira entero. */
const JPEG_SEGMENTOS_A_QUITAR = new Set([
  0xe1, // APP1: Exif (incluido el GPS) y XMP
  0xed, // APP13: bloque de Photoshop, donde viven los datos IPTC
]);

/**
 * Recorta un JPEG dejando fuera los segmentos de metadatos.
 *
 * Un JPEG empieza por FFD8 y sigue con segmentos `FF <marcador> <largo:2>
 * <datos>`. Hay marcadores sin largo (los de reinicio, FFD0-FFD7, y FF01), y
 * al llegar a FFDA --el comienzo del barrido-- el resto del fichero son los
 * datos comprimidos y se copia tal cual.
 *
 * Si algo no cuadra --no empieza por FFD8, un largo imposible, un byte que no
 * es FF donde tenía que haberlo-- se devuelve el original sin tocar. Un
 * fichero que no se entiende no se recorta a ciegas: se prefiere un metadato
 * de más a una foto de boda rota.
 */
export function quitarMetadatosJpeg(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;

  const trozos: Array<[number, number]> = [[0, 2]]; // el FFD8 inicial
  let i = 2;

  while (i + 1 < bytes.length) {
    if (bytes[i] !== 0xff) return bytes; // fichero que no seguimos entendiendo
    const marcador = bytes[i + 1];

    // Relleno: una tira de FF antes del marcador de verdad es legal.
    if (marcador === 0xff) {
      i += 1;
      continue;
    }
    // Marcadores sin segmento de datos.
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd7)) {
      trozos.push([i, i + 2]);
      i += 2;
      continue;
    }
    // Comienzo del barrido: a partir de aquí vienen los datos comprimidos.
    //
    // Y SE CORTA EN EL EOI, no en el final del fichero. Lo que va detrás del
    // FFD9 no son datos de imagen: es donde los móviles y algunas cámaras
    // esconden un SEGUNDO fichero --el JPEG extra de una ráfaga o de un HDR
    // (MPF), el vídeo de una foto en movimiento-- y ese fichero lleva su
    // propio EXIF con su propio GPS. Copiando hasta el final se limpiaba la
    // cabecera y se arrastraba intacto el polizón.
    //
    // Buscar FFD9 dentro de los datos comprimidos es seguro y no es una
    // heurística: en el flujo de entropía un FF siempre va escapado como
    // FF00, y los únicos marcadores legales ahí dentro son los de reinicio
    // (FFD0-FFD7). Un FFD9 sólo puede ser el final de la imagen.
    if (marcador === 0xda) {
      let fin = bytes.length;
      for (let j = i + 2; j + 1 < bytes.length; j += 1) {
        if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
          fin = j + 2;
          break;
        }
      }
      trozos.push([i, fin]);
      i = bytes.length;
      break;
    }
    if (i + 3 >= bytes.length) return bytes;
    const largo = (bytes[i + 2] << 8) | bytes[i + 3];
    if (largo < 2 || i + 2 + largo > bytes.length) return bytes;

    if (!JPEG_SEGMENTOS_A_QUITAR.has(marcador)) {
      trozos.push([i, i + 2 + largo]);
    }
    i += 2 + largo;
  }

  // El bucle sólo termina bien por el `break` del SOS. Si sale por la
  // condición del `while` --un fichero que se acaba a media cabecera-- queda
  // cola sin consumir, y recortar entonces sería inventarse un fichero nuevo
  // en vez de limpiar el que hay. Se devuelve el original.
  if (i < bytes.length) return bytes;

  const total = trozos.reduce((suma, [desde, hasta]) => suma + (hasta - desde), 0);
  if (total === bytes.length) return bytes; // no había nada que quitar
  const salida = new Uint8Array(total);
  let cursor = 0;
  for (const [desde, hasta] of trozos) {
    salida.set(bytes.subarray(desde, hasta), cursor);
    cursor += hasta - desde;
  }
  return salida;
}

/** Trozos PNG que se tiran. Todos son auxiliares: ninguno hace falta para
 *  pintar la imagen. */
const PNG_TROZOS_A_QUITAR = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt']);

const PNG_FIRMA = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * Recorta un PNG dejando fuera los trozos de metadatos.
 *
 * Un PNG es su firma de ocho bytes y una secuencia de trozos
 * `<largo:4> <tipo:4> <datos> <crc:4>`. Cada trozo lleva su propio CRC, así
 * que quitar uno entero no invalida a los demás: no hay nada que recalcular.
 *
 * Misma regla que en JPEG: ante cualquier cosa que no cuadre, se devuelve el
 * original.
 */
export function quitarMetadatosPng(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 8 || !PNG_FIRMA.every((b, n) => bytes[n] === b)) return bytes;

  const trozos: Array<[number, number]> = [[0, 8]];
  let i = 8;
  const texto = new TextDecoder('latin1');

  while (i + 8 <= bytes.length) {
    const largo =
      (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
    if (largo < 0 || i + 12 + largo > bytes.length) return bytes;
    const tipo = texto.decode(bytes.subarray(i + 4, i + 8));
    const fin = i + 12 + largo; // largo + tipo + datos + crc

    if (!PNG_TROZOS_A_QUITAR.has(tipo)) {
      trozos.push([i, fin]);
    }
    i = fin;
    if (tipo === 'IEND') {
      // Todo lo que vaya detrás del IEND sobra por definición, pero no se
      // tira: este recorte promete no tocar nada que no sean metadatos, y un
      // fichero que sale más corto sin que hubiera nada que quitar rompe esa
      // promesa. Se copia tal cual y se sale.
      if (fin < bytes.length) trozos.push([fin, bytes.length]);
      i = bytes.length;
      break;
    }
  }

  // Igual que en JPEG: si el bucle se agota sin IEND, el fichero está
  // truncado y no se recorta a ciegas.
  if (i < bytes.length) return bytes;

  const total = trozos.reduce((suma, [desde, hasta]) => suma + (hasta - desde), 0);
  if (total === bytes.length) return bytes;
  const salida = new Uint8Array(total);
  let cursor = 0;
  for (const [desde, hasta] of trozos) {
    salida.set(bytes.subarray(desde, hasta), cursor);
    cursor += hasta - desde;
  }
  return salida;
}

/**
 * Punto de entrada: devuelve los bytes que hay que guardar.
 *
 * El reparto por formato no es arbitrario:
 *
 * - JPEG: es de donde sale el problema, porque es lo que graban las cámaras y
 *   los móviles. Se recorta sin tocar los píxeles, salvo que la orientación
 *   obligue a girar (ver arriba).
 * - PNG: se recorta igual. Casi ningún flujo de boda entrega PNG, pero
 *   admitirlo y no limpiarlo sería dejar una puerta abierta por pereza.
 * - WebP y AVIF: sólo se reencodan si de verdad traen metadatos. Salen de un
 *   revelador, que no suele incrustar GPS, así que el caso normal es no tocar
 *   nada; y su formato de contenedor exige recalcular banderas para recortar
 *   a mano, que es bastante más frágil que recortar un JPEG.
 *
 * Si algo falla --sharp no puede leer el fichero, la memoria se acaba-- se
 * devuelven los bytes originales y se sigue. Perder un metadato es malo;
 * perder la foto de la boda de alguien porque el limpiador se atragantó, peor.
 */
export async function limpiarMetadatos(
  bytes: Uint8Array,
  kind: ImageKind
): Promise<Uint8Array> {
  // EL RECORTE SE HACE PRIMERO Y SIN SHARP, y ése es el orden que importa.
  // La versión anterior metía el `import('sharp')` dentro del mismo `try` que
  // devolvía el original al fallar, así que si sharp no cargaba --binario
  // nativo, otra arquitectura, memoria agotada-- TODOS los JPEG y PNG se
  // guardaban con su EXIF completo. Justo el fallo que este módulo existe
  // para impedir, y sin una línea de aviso. Ahora sharp sólo hace falta para
  // el caso raro (girar), y si no está, lo limpio ya está limpio.
  if (kind === 'jpg') {
    const recortado = quitarMetadatosJpeg(bytes);
    try {
      const sharp = (await import('sharp')).default;
      const { orientation } = await sharp(bytes, OPCIONES_SHARP).metadata();
      if ((orientation ?? 1) === 1) return recortado;
      // Orientación distinta de 1: hay que girar los píxeles de verdad, y eso
      // obliga a reencodar. `quality: 95` con `mozjpeg` y sin submuestreo de
      // color deja una diferencia que no se ve a tamaño completo; es el
      // precio de que el vertical no salga tumbado.
      //
      // `keepIccProfile()` NO es opcional: sharp descarta los metadatos de
      // salida por defecto, y eso incluye el perfil de color. Sin esta línea,
      // los verticales --que son precisamente los que pasan por aquí-- se
      // entregaban sin perfil, así que una foto en AdobeRGB salía desaturada
      // y la entrega quedaba con la mitad de las fotos de otro color.
      const girado = await sharp(bytes, OPCIONES_SHARP)
        .rotate()
        .keepIccProfile()
        .jpeg({ quality: 95, mozjpeg: true, chromaSubsampling: '4:4:4' })
        .toBuffer();
      return new Uint8Array(girado);
    } catch (err) {
      // Se avisa, no se calla: un limpiador que falla en silencio no lo
      // descubre nadie. Se devuelve lo recortado, que ya no lleva EXIF.
      console.error('[fotos] no se pudo comprobar la orientación con sharp:', err);
      return recortado;
    }
  }

  if (kind === 'png') return quitarMetadatosPng(bytes);

  try {
    const sharp = (await import('sharp')).default;
    const meta = await sharp(bytes, OPCIONES_SHARP).metadata();
    const traeMetadatos = Boolean(meta.exif || meta.xmp || (meta.orientation ?? 1) !== 1);
    if (!traeMetadatos) return bytes;
    const limpio = await sharp(bytes, OPCIONES_SHARP)
      .rotate()
      .keepIccProfile()
      .toFormat(kind === 'avif' ? 'avif' : 'webp', { quality: 92 })
      .toBuffer();
    return new Uint8Array(limpio);
  } catch (err) {
    console.error('[fotos] no se pudieron limpiar los metadatos de un %s:', kind, err);
    return bytes;
  }
}
