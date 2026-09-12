import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ArrowGlyph } from './ArrowGlyph';

describe('ArrowGlyph', () => {
  it('dibuja la flecha, no la escribe', () => {
    const { container } = render(<ArrowGlyph />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('arrowGlyph');
    // Ni un carácter de flecha en el texto: eso es lo que el iPhone
    // convertía en emoji.
    expect(container.textContent).toBe('');
  });

  it('la envuelve en la clase global `arrow`, de la que cuelga la animación de bucle', () => {
    const { container } = render(<ArrowGlyph />);
    expect(container.querySelector('span')).toHaveClass('arrow');
    // Decorativa: el rótulo del enlace ya dice a dónde va.
    expect(container.querySelector('span')).toHaveAttribute('aria-hidden', 'true');
  });

  it('acepta la clase del módulo cuando el sitio que la usa tiene estados propios', () => {
    const { container } = render(<ArrowGlyph className="rowArrow_abc" />);
    expect(container.querySelector('span')).toHaveClass('rowArrow_abc');
  });

  it('cambia de trazo según la dirección', () => {
    const ne = render(<ArrowGlyph />).container.innerHTML;
    const abajo = render(<ArrowGlyph dir="down" />).container.innerHTML;
    expect(ne).not.toBe(abajo);
  });
});

/**
 * EL GUARDIÁN, que es la mitad que de verdad importa.
 *
 * El defecto no era que faltara un componente: era que en dieciocho sitios
 * había un carácter de flecha escrito a mano. Un componente nuevo no impide
 * que mañana alguien vuelva a teclear uno. Esto sí: recorre el código del
 * sitio y falla si aparece cualquier carácter de flecha.
 *
 * MIRA TAMBIÉN LOS `.ts` Y LOS `.css`, y no sólo los `.tsx`, porque un rótulo
 * de interfaz puede acabar perfectamente en `content/site.ts`, en los textos
 * de un servicio o en un `content: '...'` de una hoja de estilos -- que es
 * donde nadie iría a buscarlo.
 *
 * Y EL RANGO COGE LOS CUATRO BLOQUES de flechas de Unicode, no sólo el
 * primero: en Miscellaneous Symbols and Arrows viven las que un teclado de
 * emoji ofrece antes que ninguna otra.
 *
 * Los comentarios quedan fuera a propósito -- ArrowGlyph.tsx y
 * RotatingBadge.tsx explican el problema y para eso tienen que poder nombrar
 * el carácter.
 */
const FLECHAS = /[\u2190-\u21FF\u2794-\u27BF\u27F0-\u27FF\u2900-\u297F\u2B00-\u2BFF]/;
const CARPETAS = ['components', 'app', 'content', 'styles', 'lib'];

function ficherosDeInterfaz(dir: string): string[] {
  const salida: string[] = [];
  for (const nombre of readdirSync(dir)) {
    if (nombre === 'node_modules' || nombre.startsWith('.')) continue;
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      salida.push(...ficherosDeInterfaz(ruta));
    } else if (/\.(tsx|ts|css)$/.test(nombre) && !/\.test\.tsx?$/.test(nombre)) {
      salida.push(ruta);
    }
  }
  return salida;
}

/** Quita comentarios de bloque y de línea (los `{/* ... *\/}` de JSX caen con
 *  los de bloque, que es lo que llevan dentro). */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

describe('ninguna flecha escrita a mano en la interfaz', () => {
  it('no queda un solo carácter de flecha fuera de los comentarios', () => {
    const culpables: string[] = [];
    for (const carpeta of CARPETAS) {
      for (const ruta of ficherosDeInterfaz(carpeta)) {
        const m = sinComentarios(readFileSync(ruta, 'utf8')).match(FLECHAS);
        if (m) {
          culpables.push(`${ruta}: ${m[0]} (U+${m[0].codePointAt(0)!.toString(16).toUpperCase()})`);
        }
      }
    }
    expect(culpables).toEqual([]);
  });
});
