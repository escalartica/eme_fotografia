import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Tamaño REAL de un WebP de /public, leído de su cabecera.
 *
 * Existe porque en este proyecto las medidas de una fotografía se declaran a
 * mano en content/ (`width` y `height` de cada fotograma) y una medida
 * declarada puede mentir: se copia una línea, se cambia el fichero y nadie se
 * entera hasta que el navegador reserva un hueco de la forma equivocada y la
 * página salta al cargar. Los tests que usan esto comparan lo declarado
 * contra el fichero, que es el único que no miente.
 *
 * Se leen los tres formatos de contenedor que produce `sharp`: VP8 (con
 * pérdida), VP8L (sin pérdida) y VP8X (extendido, el que sale en cuanto hay
 * metadatos o transparencia).
 */
export function tamanoWebp(rutaPublica: string): { ancho: number; alto: number } {
  // Anclado al directorio del proyecto y no al de trabajo: con `npm test`
  // desde la raíz da igual, pero un `vitest --root` lo rompería sin decir por
  // qué.
  const b = readFileSync(join(process.cwd(), 'public', rutaPublica.replace(/^\//, '')));
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`no es un WebP: ${rutaPublica}`);
  }
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { ancho: b.readUIntLE(24, 3) + 1, alto: b.readUIntLE(27, 3) + 1 };
  if (chunk === 'VP8 ') return { ancho: b.readUInt16LE(26) & 0x3fff, alto: b.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const n = b.readUInt32LE(21);
    return { ancho: (n & 0x3fff) + 1, alto: ((n >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`cabecera WebP desconocida (${chunk}) en ${rutaPublica}`);
}
