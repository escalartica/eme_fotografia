import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ogImage, DEFAULT_OG_IMAGE } from './seo';

/**
 * LA TARJETA DE ENLACE ES UNA FOTOGRAFÍA, no el logotipo.
 *
 * Todas las páginas menos las fichas de boda compartían la misma tarjeta
 * genérica, así que un estudio de fotografía mandado por WhatsApp aparecía
 * como un wordmark sobre fondo oscuro. En una previsualización la imagen ES
 * el argumento, y este estudio tiene mejores argumentos que su propia marca.
 *
 * Estas pruebas miran el DISCO, que es lo único que se puede romper sin que
 * nadie se entere: un `og:image` que apunta a un fichero que no existe se
 * comparte sin imagen, y eso no se ve hasta que alguien manda el enlace.
 */

/** Las páginas públicas y la foto que cada una comparte. Al añadir una página
 *  nueva con tarjeta propia, se añade aquí. */
const TARJETAS: [string, string][] = [
  ['portada', '/images/trabajos/maite-y-nerea/cover.webp'],
  ['/trabajos', '/images/trabajos/carmen-y-alberto/cover.webp'],
  ['/servicios', '/images/trabajos/eva-y-rafa/novia-ramo.webp'],
  ['/servicios/fotografia-de-boda', '/images/trabajos/carmen-y-enrique/cover.webp'],
  ['/servicios/video-de-boda', '/images/trabajos/virginia-y-jorge/09.webp'],
  ['/sobre-nosotros', '/images/equipo/equipo.webp'],
  ['/contacto', '/images/trabajos/carmen-y-alberto/06.webp'],
];

function enDisco(ruta: string): string {
  return path.join(process.cwd(), 'public', ruta.replace(/^\//, ''));
}

describe('tarjetas de enlace (OpenGraph)', () => {
  it.each(TARJETAS)('%s comparte una fotografía que existe en disco', (_pagina, foto) => {
    const tarjeta = ogImage(foto)!;
    expect(tarjeta).toMatch(/-og\.jpg$/);
    expect(fs.existsSync(enDisco(tarjeta))).toBe(true);
  });

  /**
   * 1200x630 es la medida que piden Facebook, WhatsApp y X. Con otra, cada uno
   * recorta por su cuenta y el resultado no se parece a lo que se eligió.
   */
  it.each(TARJETAS)('%s comparte una tarjeta de 1200x630', (_pagina, foto) => {
    const bytes = fs.readFileSync(enDisco(ogImage(foto)!));
    // Cabecera JPEG: se busca el marcador SOF0/SOF2, que lleva alto y ancho.
    let i = 2;
    let medida: [number, number] | null = null;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) break;
      const marcador = bytes[i + 1];
      if (marcador === 0xc0 || marcador === 0xc2) {
        medida = [(bytes[i + 7] << 8) | bytes[i + 8], (bytes[i + 5] << 8) | bytes[i + 6]];
        break;
      }
      i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
    }
    expect(medida).toEqual([1200, 630]);
  });

  /* El logotipo sigue siendo el respaldo de las páginas legales, donde una
     fotografía de boda no viene a cuento. */
  it('mantiene la tarjeta de marca para las páginas sin foto propia', () => {
    expect(DEFAULT_OG_IMAGE).toMatch(/\/images\/og\/default\.jpg$/);
    expect(fs.existsSync(enDisco('/images/og/default.jpg'))).toBe(true);
  });
});
