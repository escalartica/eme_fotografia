import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevealWords } from './RevealWords';

/**
 * Este componente lleva ya CASI TODOS LOS TITULARES DEL SITIO, así que lo que
 * se rompa aquí se rompe en todas las páginas a la vez -- y se rompe de una
 * forma que no se ve en una captura: el titular sigue leyéndose, pero su
 * texto real deja de tener espacios. Quien lo copia se lleva una palabra
 * ilegible, quien lo escucha con un lector de pantalla oye otra, y Google
 * indexa una tercera. De eso van las dos primeras pruebas.
 */
describe('RevealWords', () => {
  it('conserva el texto exacto, con sus espacios', () => {
    const { container } = render(
      <h2>
        <RevealWords segments={[{ text: 'Bodas reales, ' }, { text: 'historias irrepetibles.', em: true }]} />
      </h2>,
    );
    // Sin normalizar: es el texto que se copia al portapapeles y el que lee
    // un lector de pantalla, no el que se ve.
    expect(container.textContent).toBe('Bodas reales, historias irrepetibles.');
  });

  /**
   * LA TRAMPA QUE ESTO VIGILA. Los tramos se concatenan tal cual antes de
   * partir por espacios, así que el espacio que separa dos tramos tiene que
   * ir DENTRO de uno de ellos. Un `[{text:'Bodas reales,'}, {text:'historias'}]`
   * --sin el espacio final en el primero-- no da dos palabras: da una,
   * «reales,historias». Esta prueba fija que es el texto y no el marcado
   * quien pone los espacios.
   */
  it('no inventa espacios entre tramos: los pone el texto', () => {
    const { container } = render(
      <RevealWords segments={[{ text: 'Bodas reales,' }, { text: 'historias' }]} />,
    );
    expect(container.textContent).toBe('Bodas reales,historias');
  });

  it('parte por palabras y las escalona en orden', () => {
    const { container } = render(<RevealWords segments={[{ text: 'una dos tres' }]} />);
    const internos = [...container.querySelectorAll('span > span')];
    expect(internos.map((s) => s.textContent)).toEqual(['una', 'dos', 'tres']);
    // El escalonado se declara como variable de posición, no como retardo: en
    // una animación guiada por el scroll el retardo no significa tiempo.
    expect(internos.map((s) => (s as HTMLElement).style.getPropertyValue('--i'))).toEqual(['0', '1', '2']);
  });

  it('continúa la cuenta con offset, para un titular partido en dos elementos', () => {
    const { container } = render(<RevealWords segments={[{ text: 'tres cuatro' }]} offset={3} />);
    const internos = [...container.querySelectorAll('span > span')];
    expect(internos.map((s) => (s as HTMLElement).style.getPropertyValue('--i'))).toEqual(['3', '4']);
  });

  /**
   * Un tramo puede acabar a mitad de palabra, y eso es justo lo que permite
   * que «verdad» vaya en cursiva y el punto que le sigue NO. La palabra tiene
   * que seguir siendo UNA.
   */
  it('mantiene entera una palabra repartida entre dos tramos', () => {
    const { container } = render(
      <h2>
        <RevealWords
          segments={[{ text: 'Más ' }, { text: 'verdad', em: true }, { text: '.' }]}
          emClassName="cursiva"
        />
      </h2>,
    );
    const internos = [...container.querySelectorAll('span > span')];
    expect(internos.map((s) => s.textContent)).toEqual(['Más', 'verdad.']);
    const em = container.querySelector('em');
    expect(em).toHaveTextContent('verdad');
    expect(em).toHaveClass('cursiva');
  });

  /**
   * El componente no envuelve nada: devuelve las palabras sueltas para que el
   * <h2> que las contiene siga siendo del que llama, con su id y sus clases.
   * Si algún día se envolviera en un <div>, el encabezado dejaría de ser un
   * encabezado en la mitad del sitio.
   */
  it('no añade ningún elemento propio alrededor del titular', () => {
    render(
      <h2 id="prueba">
        <RevealWords segments={[{ text: 'Nuestra mirada' }]} />
      </h2>,
    );
    const h2 = screen.getByRole('heading', { level: 2, name: 'Nuestra mirada' });
    expect(h2).toHaveAttribute('id', 'prueba');
  });
});
