import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileMenu } from './MobileMenu';

/**
 * LA SALIDA DEL PANEL, EN SU PROPIO FICHERO.
 *
 * MobileMenu.test.tsx simula `prefers-reduced-motion: reduce` para todo el
 * fichero --y con razón: sin eso, la animación escalonada de entrada hacía
 * intermitentes las pruebas de la trampa de foco--. Pero ese atajo apaga
 * justo el camino que este trabajo añadió: con movimiento reducido el panel
 * se desmonta al instante y no llegan a ejecutarse ni `closing`, ni
 * SALIDA_MS, ni el `inert`, ni la retención del candado del scroll.
 *
 * Así que el camino normal --el de la inmensa mayoría de los teléfonos-- se
 * prueba aquí, con el reloj falso y con GSAP sustituido por un doble mudo.
 * GSAP se sustituye porque lo que se comprueba es la MÁQUINA DE ESTADOS, no
 * la interpolación: con el reloj falso, el `requestAnimationFrame` del que
 * vive el motor de GSAP también está intervenido, y una animación real
 * dentro de `vi.advanceTimersByTime` no prueba nada y sí puede colgarse.
 */
vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));

vi.mock('gsap', () => {
  const tween = { fromTo: vi.fn(() => tween), to: vi.fn(() => tween) };
  return {
    gsap: {
      context: (fn: () => void) => {
        fn();
        return { revert: vi.fn() };
      },
      timeline: () => tween,
      fromTo: vi.fn(),
      to: vi.fn(),
    },
  };
});

/** Lo que tarda el panel en irse. Tiene que ser el mismo número que
 *  SALIDA_MS en MobileMenu.tsx; si alguien lo cambia allí y no aquí, la
 *  tercera prueba falla, que es exactamente lo que debe pasar. */
const SALIDA_MS = 340;

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  document.body.style.overflowY = '';
});

describe('MobileMenu — la salida', () => {
  it('al cerrarse NO desaparece de golpe: sigue en el DOM, ya inerte, y la página sigue bloqueada', () => {
    const { rerender } = render(<MobileMenu isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(<MobileMenu isOpen={false} onClose={vi.fn()} />);

    const panel = screen.getByRole('dialog');
    // Sigue puesto -- es toda la diferencia con `if (!isOpen) return null`,
    // que lo borraba en un fotograma.
    expect(panel).toBeInTheDocument();
    expect(panel.className).toMatch(/closing/);
    // Y mientras se va no se puede ni tocar ni tabular dentro: `inert` saca
    // del árbol de accesibilidad, del orden de tabulación y del puntero a la
    // vez. Sin él, los nueve enlaces de dentro seguían siendo alcanzables.
    expect(panel).toHaveAttribute('inert');
    // El candado aguanta puesto los 340 ms, o la página de debajo recupera el
    // scroll a media salida y salta.
    expect(document.body.style.overflowY).toBe('hidden');
  });

  it('se desmonta cuando la animación termina, y devuelve el scroll', () => {
    const { rerender } = render(<MobileMenu isOpen onClose={vi.fn()} />);
    rerender(<MobileMenu isOpen={false} onClose={vi.fn()} />);

    vi.advanceTimersByTime(SALIDA_MS);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflowY).not.toBe('hidden');
  });

  /**
   * LA REGRESIÓN QUE DE VERDAD IMPORTA. Si al reabrir no se cancelase el
   * temporizador de la salida anterior, el panel se desmontaría solo en
   * mitad de una apertura: el menú se abriría y desaparecería sin que nadie
   * lo tocara. Es el fallo clásico de este patrón y no lo ve nadie leyendo
   * el código.
   */
  it('reabrirlo antes de que termine la salida cancela el desmontaje', () => {
    const { rerender } = render(<MobileMenu isOpen onClose={vi.fn()} />);
    rerender(<MobileMenu isOpen={false} onClose={vi.fn()} />);
    vi.advanceTimersByTime(SALIDA_MS / 2);
    rerender(<MobileMenu isOpen onClose={vi.fn()} />);

    const panel = screen.getByRole('dialog');
    expect(panel).toBeInTheDocument();
    expect(panel).not.toHaveAttribute('inert');

    // Y pasado de sobra el plazo del temporizador viejo, sigue ahí.
    vi.advanceTimersByTime(SALIDA_MS * 2);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.body.style.overflowY).toBe('hidden');
  });
});
