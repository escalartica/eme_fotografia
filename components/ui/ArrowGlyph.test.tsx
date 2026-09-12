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
 * había un `↗` escrito a mano. Un componente nuevo no impide que mañana
 * alguien vuelva a teclear uno. Esto sí: recorre el código del sitio y falla
 * si aparece cualquiera de los cuatro caracteres de flecha en un fichero de
 * interfaz.
 *
 * Los comentarios quedan fuera a propósito -- ArrowGlyph.tsx y RotatingBadge
 * .tsx explican el problema y para eso tienen que poder nombrar el carácter.
 */
const FLECHAS = /[←-⇿➔-➿]/;
const CARPETAS = ['components', 'app'];

function ficherosDeInterfaz(dir: string): string[] {
  const salida: string[] = [];
  for (const nombre of readdirSync(dir)) {
    if (nombre === 'node_modules' || nombre.startsWith('.')) continue;
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      salida.push(...ficherosDeInterfaz(ruta));
    } else if (nombre.endsWith('.tsx') && !nombre.endsWith('.test.tsx')) {
      salida.push(ruta);
    }
  }
  return salida;
}

/** Quita comentarios de bloque, de línea y los `{/* ... *\/}` de JSX. */
function sinComentarios(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('ninguna flecha escrita a mano en la interfaz', () => {
  it('no queda un solo carácter de flecha fuera de los comentarios', () => {
    const culpables: string[] = [];
    for (const carpeta of CARPETAS) {
      for (const ruta of ficherosDeInterfaz(carpeta)) {
        const limpio = sinComentarios(readFileSync(ruta, 'utf8'));
        const m = limpio.match(FLECHAS);
        if (m) culpables.push(`${ruta}: ${m[0]}`);
      }
    }
    expect(culpables).toEqual([]);
  });
});
