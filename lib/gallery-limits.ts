/**
 * LOS TOPES DE LAS GALERÍAS, EN UN SOLO SITIO.
 *
 * Los usan el formulario del panel (que avisa antes de subir), las dos rutas
 * que reciben fotos (que son las que mandan de verdad) y los tests. Antes
 * cada fichero tenía su copia del número, con un comentario pidiendo que
 * coincidieran, y el día que una boda pasó de doscientas fotos hubo que
 * perseguirlos uno a uno.
 *
 * Este fichero no importa nada de Node: lo carga también el navegador.
 */

/**
 * CUÁNTAS FOTOS PUEDE TENER UNA GALERÍA EN TOTAL.
 *
 * Una boda entregada para que la pareja elija ronda las 1.200 fotos y puede
 * pasar de ahí. El tope no está para limitar el trabajo del estudio: está
 * para que un error (arrastrar la carpeta equivocada, la de todo el año) no
 * llene el disco del servidor. 3.000 cubre con holgura una boda larga y deja
 * fuera ese accidente.
 *
 * Si alguna vez hace falta más, se cambia este número y nada más: las
 * fotos se suben por tandas (ver FOTOS_POR_TANDA), así que el total no
 * depende de lo que admite nginx en una sola petición.
 */
export const MAX_FOTOS_POR_GALERIA = 3000;

/**
 * CUÁNTAS FOTOS VIAJAN EN CADA PETICIÓN.
 *
 * Mil doscientas fotos no caben en una sola subida: incluso encogidas en el
 * navegador (lib/reducir-foto.ts, unos 600 KB cada una) son más de 700 MB,
 * por encima de los 420 MB que acepta nginx (`client_max_body_size`,
 * docs/DESPLIEGUE.md §7) y de lo que conviene que el servidor tenga en
 * memoria de una vez. El formulario las parte en tandas de este tamaño y las
 * manda una detrás de otra.
 *
 * Cuarenta fotos encogidas son unos 25 MB: una tanda que falla por la red se
 * repite en segundos, no en minutos.
 */
export const FOTOS_POR_TANDA = 40;

/**
 * CUÁNTO PUEDE PESAR UNA TANDA.
 *
 * Por si el encogido falla y salen los originales: cuarenta JPEG de 25 MB
 * serían 1 GB en una petición. El formulario cierra la tanda antes de pasar
 * de este peso aunque no lleve cuarenta fotos.
 */
export const BYTES_POR_TANDA = 150 * 1024 * 1024;

/**
 * Lo máximo que acepta el SERVIDOR en una petición, sea alta o añadido.
 *
 * Es más alto que la tanda del formulario a propósito: la tanda es lo que se
 * manda, esto es la red de seguridad contra un POST que no venga de él. Por
 * debajo de los 420 MB de nginx, para que el error lo dé esta aplicación (en
 * español y diciendo qué hacer) y no una página 413 de nginx.
 */
export const MAX_FOTOS_POR_PETICION = 200;
export const MAX_BYTES_POR_PETICION = 400 * 1024 * 1024;

/**
 * Parte una lista de ficheros en tandas que respetan los dos topes de
 * arriba. Una foto que ella sola pase de BYTES_POR_TANDA viaja sola: el
 * servidor la aceptará o no por su propio tope por foto, pero no se queda
 * atascada en el reparto.
 */
export function repartirEnTandas<T extends { size: number }>(
  ficheros: readonly T[],
  maxFotos: number = FOTOS_POR_TANDA,
  maxBytes: number = BYTES_POR_TANDA
): T[][] {
  const tandas: T[][] = [];
  let actual: T[] = [];
  let peso = 0;
  for (const f of ficheros) {
    if (actual.length > 0 && (actual.length >= maxFotos || peso + f.size > maxBytes)) {
      tandas.push(actual);
      actual = [];
      peso = 0;
    }
    actual.push(f);
    peso += f.size;
  }
  if (actual.length > 0) tandas.push(actual);
  return tandas;
}
