import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/**
 * EL FICHERO DE VERIFICACIÓN DE GOOGLE SEARCH CONSOLE.
 *
 * Google pide que este fichero siga estando ahí DESPUÉS de verificar: si
 * desaparece, la propiedad se desverifica sola al cabo de un tiempo y se
 * pierde el acceso a los datos de búsqueda -- que son los únicos que dicen
 * por qué palabras nos encuentran y cuáles no.
 *
 * Es un fichero suelto en public/, sin nada que lo enlace, así que nadie se
 * daría cuenta de haberlo borrado hasta que Google avisara semanas después.
 * De ahí este test.
 */
const NOMBRE = 'googleead20c6572993e65.html';

describe('verificación de Google Search Console', () => {
  const fichero = path.join(process.cwd(), 'public', NOMBRE);

  it('sigue en public/, servido en la raíz del dominio', () => {
    expect(existsSync(fichero)).toBe(true);
  });

  it('conserva exactamente el contenido que Google espera', () => {
    // Google compara el cuerpo entero. Un salto de línea de más no lo tumba,
    // pero un cambio en el testigo sí, y eso es lo que este test protege.
    expect(readFileSync(fichero, 'utf8').trim()).toBe(`google-site-verification: ${NOMBRE}`);
  });
});
