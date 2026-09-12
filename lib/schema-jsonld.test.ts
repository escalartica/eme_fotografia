import { describe, it, expect } from 'vitest';
import { jsonLd } from './schema';

/**
 * POR QUÉ ESTO TIENE PRUEBA PROPIA.
 *
 * `JSON.stringify` a secas dentro de un `<script>` es un agujero de XSS que no
 * se ve: el JSON sale perfectamente válido, pero el analizador de HTML corta
 * el bloque en cuanto encuentra la secuencia `</script`, esté o no dentro de
 * una cadena. Hoy todo lo que entra en los bloques JSON-LD de este sitio sale
 * de ficheros de content/ --lo escribimos nosotros-- así que no hay agujero;
 * esto existe para el día que deje de ser así, que es justo cuando nadie se
 * acuerda de revisar el serializador.
 */
describe('jsonLd', () => {
  it('no deja salir la secuencia que cierra un <script>', () => {
    const salida = jsonLd({ name: 'Boda </script><script>alert(1)</script> de Ana' });
    expect(salida).not.toContain('</script');
    expect(salida).not.toContain('<script');
    expect(salida).toContain('\\u003c');
  });

  /* Escapar no puede cambiar el dato: si lo cambiara, Google leería otra cosa
     de la que la página dice, que es la mitad del sentido del JSON-LD. */
  it('escapa sin alterar el contenido: al leerlo de vuelta es idéntico', () => {
    const datos = {
      name: 'Ana & Luis </script>',
      description: 'Comillas "dobles", acentos áéíóú y un ampersand &amp;',
      lista: ['<b>uno</b>', '>dos<'],
    };
    expect(JSON.parse(jsonLd(datos))).toEqual(datos);
  });

  it('escapa también los signos de mayor y el ampersand', () => {
    const salida = jsonLd({ a: '>', b: '&' });
    expect(salida).not.toContain('>');
    expect(salida).not.toContain('&');
    expect(JSON.parse(salida)).toEqual({ a: '>', b: '&' });
  });

  /**
   * U+2028 y U+2029 son saltos de línea para JavaScript aunque no lo sean para
   * JSON: sin escaparlos, un texto que los contenga parte el `<script>` en dos
   * y la página se lleva un error de sintaxis.
   */
  it('escapa los separadores de línea de Unicode', () => {
    const salida = jsonLd({ a: 'antes despues final' });
    expect(salida).not.toContain(' ');
    expect(salida).not.toContain(' ');
    expect(JSON.parse(salida).a).toBe('antes despues final');
  });
});
