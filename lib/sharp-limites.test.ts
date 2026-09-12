// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { excedeElTechoDePixeles, MAX_PIXELES } from './sharp-limites';

/**
 * LA BOMBA DE DESCOMPRESIÓN, que es el ataque que el tope de tamaño de fichero
 * NO detecta: ese tope mide el fichero comprimido, y una bomba es precisamente
 * un fichero minúsculo que declara una imagen enorme. Los 67 bytes de aquí
 * abajo declaran 30.000 x 30.000 píxeles, que son 3,6 GB de RAM al
 * decodificarlos y suficiente para tumbar el único proceso Node que sirve toda
 * la web.
 */

/** CRC-32 tal y como lo define el formato PNG. Sin él, sharp descarta el
 *  trozo IHDR por corrupto y no llega a leer el tamaño. */
function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function trozo(tipo: string, datos: number[]): number[] {
  const cuerpo = [...[...tipo].map((c) => c.charCodeAt(0)), ...datos];
  const crc = crc32(new Uint8Array(cuerpo));
  const l = datos.length;
  return [
    (l >>> 24) & 0xff, (l >>> 16) & 0xff, (l >>> 8) & 0xff, l & 0xff,
    ...cuerpo,
    (crc >>> 24) & 0xff, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff,
  ];
}

/** Un IDAT real (zlib de unos cuantos ceros). No cubre ni de lejos las filas
 *  que el IHDR declara --no hace falta: el tamaño se lee de la cabecera-- pero
 *  sin ningún IDAT el fichero no es un PNG bien formado y el lector puede
 *  fallar por un motivo distinto del que aquí se quiere probar. */
const IDAT_MINIMO = [120, 156, 99, 96, 64, 5, 0, 0, 16, 0, 1];

function pngQueDeclara(ancho: number, alto: number): Uint8Array {
  const dim = (n: number) => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    // IHDR: ancho, alto, 8 bits, color verdadero, sin entrelazar
    ...trozo('IHDR', [...dim(ancho), ...dim(alto), 8, 2, 0, 0, 0]),
    ...trozo('IDAT', IDAT_MINIMO),
    ...trozo('IEND', []),
  ]);
}

describe('excedeElTechoDePixeles', () => {
  it('rechaza una imagen que declara más píxeles de los que decodificamos', async () => {
    await expect(excedeElTechoDePixeles(pngQueDeclara(16_000, 16_000))).resolves.toBe(true);
  });

  /**
   * LA REGRESIÓN QUE ESTO IMPIDE, y la encontró esta misma prueba.
   *
   * sharp trae su propio tope de píxeles (unos 268 MP) y LANZA al abrir algo
   * que lo pase. Como esta función devuelve `false` --«déjala pasar»-- ante
   * cualquier error, el guardián fallaba abierto justo con las bombas más
   * grandes: una de 256 MP se rechazaba y una de 900 MP entraba. Se arregló
   * midiendo sin tope (leer la cabecera no decodifica nada, ver el
   * comentario de la función).
   *
   * Los dos tamaños son deliberados: uno por debajo del tope propio de sharp
   * y otro muy por encima, que es donde estaba el agujero.
   */
  it('rechaza también una bomba mayor que el tope interno de sharp', async () => {
    await expect(excedeElTechoDePixeles(pngQueDeclara(15_000, 15_000))).resolves.toBe(true);
    await expect(excedeElTechoDePixeles(pngQueDeclara(30_000, 30_000))).resolves.toBe(true);
  });

  /* La cámara de más resolución que se usa en bodas es una GFX de 102 MP. El
     techo tiene que dejarla pasar sin discusión. */
  it('deja pasar la foto de la cámara más grande que existe en bodas', async () => {
    await expect(excedeElTechoDePixeles(pngQueDeclara(11_648, 8_736))).resolves.toBe(false);
    expect(11_648 * 8_736).toBeLessThan(MAX_PIXELES);
  });

  it('deja pasar una foto normal', async () => {
    await expect(excedeElTechoDePixeles(pngQueDeclara(6_000, 4_000))).resolves.toBe(false);
  });

  /**
   * Ante la duda, pasa. Es deliberado: sharp es un binario nativo y no está en
   * todos los entornos, y un guardián que rechaza TODAS las fotos porque no
   * puede medirlas es peor que uno que deja pasar una rara. Los otros topes
   * --25 MB por fichero, 400 MB por galería-- siguen puestos.
   */
  it('no rechaza un fichero que no puede medir', async () => {
    await expect(excedeElTechoDePixeles(new Uint8Array([1, 2, 3]))).resolves.toBe(false);
  });
});
