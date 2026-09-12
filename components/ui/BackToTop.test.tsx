import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { BackToTop } from './BackToTop';

/**
 * EL BOTÓN FLOTANTE NO PUEDE SENTARSE ENCIMA DEL PIE.
 *
 * Está fijo a `right: var(--gutter)` y a un palmo del borde inferior, o sea
 * en el mismo rincón que, al final del scroll, ocupa el bloque legal del pie.
 * Medido en producción a 1440 px: el rótulo «Volver arriba» del pie iba de
 * 1239 a 1378 y este botón, de 1334 a 1378 -- se comía sus últimas letras y
 * las de la cifra de seguidores. Y además eran DOS «volver arriba» a la vez
 * en la misma pantalla.
 */

/** Guarda la llamada del observador para poder dispararla a mano. */
let avisar: ((entradas: { isIntersecting: boolean }[]) => void) | null = null;
const observarEspia = vi.fn();

const IOOriginal = window.IntersectionObserver;

beforeEach(() => {
  avisar = null;
  observarEspia.mockClear();
  window.IntersectionObserver = class {
    constructor(cb: (entradas: { isIntersecting: boolean }[]) => void) {
      avisar = cb;
    }
    observe(el: Element) {
      observarEspia(el);
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof window.IntersectionObserver;
  // Dos pantallas de recorrido: es lo que el botón exige para aparecer.
  Object.defineProperty(window, 'scrollY', { value: 5000, writable: true, configurable: true });
});

afterEach(() => {
  window.IntersectionObserver = IOOriginal;
  vi.restoreAllMocks();
});

function pintarConPie() {
  return render(
    <>
      <BackToTop />
      <footer>
        <div data-pie-legal>Aviso legal</div>
      </footer>
    </>
  );
}

describe('BackToTop', () => {
  it('aparece cuando hay recorrido de vuelta', () => {
    pintarConPie();
    expect(screen.getByRole('button', { name: /volver al principio/i })).toBeVisible();
  });

  it('se retira cuando el bloque legal del pie entra en pantalla', () => {
    pintarConPie();
    const boton = screen.getByRole('button', { name: /volver al principio/i });
    expect(boton).toBeVisible();

    act(() => avisar?.([{ isIntersecting: true }]));

    // `hidden`, que además lo saca del orden de tabulación: no basta con que
    // no se vea, no puede quedarse enfocable encima de un enlace del pie.
    expect(boton).not.toBeVisible();
  });

  it('vuelve al salir del pie', () => {
    pintarConPie();
    const boton = screen.getByRole('button', { name: /volver al principio/i });
    act(() => avisar?.([{ isIntersecting: true }]));
    act(() => avisar?.([{ isIntersecting: false }]));
    expect(boton).toBeVisible();
  });

  it('vigila el bloque legal, no el pie entero', () => {
    // El pie mide una pantalla completa: si se observara el `<footer>`, el
    // botón desaparecería en cuanto asomara su borde superior, dejando sin
    // vuelta arriba justo la pantalla en la que todavía hace falta.
    pintarConPie();
    expect(observarEspia).toHaveBeenCalledTimes(1);
    expect((observarEspia.mock.calls[0][0] as HTMLElement).hasAttribute('data-pie-legal')).toBe(true);
  });

  it('no se rompe en una página sin pie', () => {
    expect(() => render(<BackToTop />)).not.toThrow();
    expect(observarEspia).not.toHaveBeenCalled();
  });
});
