import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamList, type TeamMember } from './TeamList';

// El doble del observador guarda la llamada de vuelta para poder decidir desde
// el test qué fila cruza la banda central. El sustituto global de
// vitest.setup.ts no vale: su `observe()` no hace nada.
let intersectCallback: IntersectionObserverCallback | undefined;
beforeEach(() => {
  intersectCallback = undefined;
  window.IntersectionObserver = vi.fn().mockImplementation(function (cb: IntersectionObserverCallback) {
    intersectCallback = cb;
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  }) as unknown as typeof IntersectionObserver;
});

const EQUIPO: TeamMember[] = [
  { name: 'eme · María Leal', role: 'Dirección creativa y fotografía', portrait: '/images/equipo/eme-retrato.webp', href: 'https://instagram.com/emefotografia' },
  { name: 'Rafa', role: 'Realización audiovisual', portrait: '/images/equipo/rafa-retrato.webp' },
  { name: 'Raúl', role: 'Operador de cámara y dron', portrait: '/images/equipo/raul-retrato.webp' },
];

const filas = () => screen.getAllByRole('listitem');

/**
 * Simula que estas filas cruzan la banda central, con la proporción dada.
 *
 * Va dentro de `act`: el observador llama desde fuera de React, así que el
 * `setState` que dispara no se vuelca en el DOM hasta el siguiente ciclo. Sin
 * esto, una comprobación escrita justo después lee el DOM anterior y falla
 * aunque el componente haga lo correcto -- y, peor, otra que casualmente
 * esperase un microtick (un `await findBy*`) pasaría, dejando una suite que
 * aprueba o suspende según cómo esté escrita cada prueba.
 */
function cruzan(entradas: { indice: number; ratio: number }[]) {
  const todas = filas();
  act(() => {
    intersectCallback!(
      entradas.map((e) => ({
        target: todas[e.indice],
        isIntersecting: e.ratio > 0,
        intersectionRatio: e.ratio,
      })) as unknown as IntersectionObserverEntry[],
      {} as IntersectionObserver
    );
  });
}

describe('TeamList', () => {
  it('names every person and what they do', () => {
    render(<TeamList members={EQUIPO} />);
    for (const persona of EQUIPO) {
      expect(screen.getByText(persona.name)).toBeInTheDocument();
      expect(screen.getByText(persona.role)).toBeInTheDocument();
    }
  });

  // LA SECCIÓN NO EMPIEZA VACÍA. El retrato grande antes solo existía mientras
  // el puntero estaba sobre una fila: en una sección que se llama «Equipo», las
  // caras no se veían hasta que alguien acertaba a pasar el ratón por encima, y
  // desde el móvil no se veían nunca.
  it('shows the first portrait from the first paint, with no gesture', () => {
    const { container } = render(<TeamList members={EQUIPO} />);
    const activas = container.querySelectorAll('[data-activa]');
    expect(activas.length).toBeGreaterThan(0);
    expect(filas()[0].hasAttribute('data-activa')).toBe(true);
  });

  it('follows the scroll: the row crossing the middle band becomes the active one', () => {
    render(<TeamList members={EQUIPO} />);
    cruzan([{ indice: 2, ratio: 1 }]);
    expect(filas()[2].hasAttribute('data-activa')).toBe(true);
    expect(filas()[0].hasAttribute('data-activa')).toBe(false);
  });

  // Con dos filas dentro de la banda a la vez, gana la que más la ocupa. Sin
  // esto mandaba «la última que entró» y el retrato saltaba adelante y atrás
  // al desplazarse despacio.
  it('picks the row that fills the band most when two are inside at once', () => {
    render(<TeamList members={EQUIPO} />);
    cruzan([
      { indice: 1, ratio: 0.2 },
      { indice: 2, ratio: 0.9 },
    ]);
    expect(filas()[2].hasAttribute('data-activa')).toBe(true);
  });

  it('lets the pointer override the scroll while it is over a row', async () => {
    const user = userEvent.setup();
    render(<TeamList members={EQUIPO} />);
    await user.hover(filas()[1]);
    expect(filas()[1].hasAttribute('data-activa')).toBe(true);
    // Mientras el puntero manda, el scroll no se lo quita.
    cruzan([{ indice: 2, ratio: 1 }]);
    expect(filas()[1].hasAttribute('data-activa')).toBe(true);
  });

  it('opens an external profile safely when a person has one', () => {
    render(<TeamList members={EQUIPO} />);
    const enlace = within(filas()[0]).getByRole('link');
    expect(enlace).toHaveAttribute('href', EQUIPO[0].href);
    expect(enlace).toHaveAttribute('target', '_blank');
    expect(enlace.getAttribute('rel')).toContain('noopener');
  });

  // SIN NUMERAL. Cinco personas no son una secuencia que haya que leer en
  // orden, y el «01» iba a la izquierda del nombre disputándole el peso.
  it('does not number the people', () => {
    render(<TeamList members={EQUIPO} />);
    for (const n of ['01', '02', '03']) {
      expect(screen.queryByText(n)).toBeNull();
    }
  });
});
