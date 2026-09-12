import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { quickTo, xTo, yTo, getProperty, killTweensOf, set } = vi.hoisted(() => {
  const xTo = vi.fn();
  const yTo = vi.fn();
  return {
    xTo,
    yTo,
    quickTo: vi.fn((_el: unknown, prop: string) => (prop === 'x' ? xTo : yTo)),
    getProperty: vi.fn(() => 0),
    killTweensOf: vi.fn(),
    set: vi.fn(),
  };
});

vi.mock('gsap', () => ({ gsap: { quickTo, getProperty, killTweensOf, set } }));
vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));

import { Magnetic } from './Magnetic';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

/** El puntero fino es lo que activa el efecto; se puede apagar por prueba. */
function mockPointer({ fine }: { fine: boolean }) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: fine,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  );
}

/** jsdom devuelve todo ceros en getBoundingClientRect: hay que darle una caja. */
function stubBox(el: Element, box: { left: number; top: number; width: number; height: number }) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    right: box.left + box.width,
    bottom: box.top + box.height,
    x: box.left,
    y: box.top,
    toJSON: () => ({}),
  } as DOMRect);
}

function move(clientX: number, clientY: number) {
  const event = new MouseEvent('pointermove', { clientX, clientY }) as MouseEvent & { pointerType: string };
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  window.dispatchEvent(event);
}

beforeEach(() => mockPointer({ fine: true }));
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Magnetic', () => {
  it('always renders its child, so the link exists whether or not the effect runs', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<Magnetic><a href="https://example.test/contacto">Consultar</a></Magnetic>);
    expect(screen.getByRole('link', { name: 'Consultar' })).toBeInTheDocument();
  });

  it('sets up no pointer tracking when motion is reduced', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<Magnetic><a href="https://example.test/contacto">Consultar</a></Magnetic>);
    expect(quickTo).not.toHaveBeenCalled();
  });

  it('sets up no pointer tracking on a touch screen, where there is no pointer to lean towards', () => {
    mockPointer({ fine: false });
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<Magnetic><a href="https://example.test/contacto">Consultar</a></Magnetic>);
    expect(quickTo).not.toHaveBeenCalled();
  });

  it('pulls a fraction of the way towards a pointer inside the attraction radius', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(
      <Magnetic strength={0.5} radius={100}><a href="https://example.test/contacto">Consultar</a></Magnetic>,
    );
    stubBox(container.firstElementChild!, { left: 100, top: 100, width: 200, height: 40 });
    // Centro en reposo: (200, 120). El puntero, 20 px a la derecha y 10 abajo.
    move(220, 130);
    expect(xTo).toHaveBeenCalledWith(10);
    expect(yTo).toHaveBeenCalledWith(5);
  });

  it('returns to its resting place once the pointer leaves the radius', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(
      <Magnetic strength={0.5} radius={40}><a href="https://example.test/contacto">Consultar</a></Magnetic>,
    );
    stubBox(container.firstElementChild!, { left: 100, top: 100, width: 200, height: 40 });
    move(220, 130);
    xTo.mockClear();
    yTo.mockClear();
    // 500 px a la derecha del borde derecho: muy fuera del radio.
    move(800, 120);
    expect(xTo).toHaveBeenCalledWith(0);
    expect(yTo).toHaveBeenCalledWith(0);
  });

  it('measures the distance from the edge of the box, not its centre, so a wide link does not attract from far away sideways', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(
      <Magnetic strength={0.5} radius={20}><a href="https://example.test/contacto">Consultar</a></Magnetic>,
    );
    stubBox(container.firstElementChild!, { left: 100, top: 100, width: 200, height: 40 });
    // A 60 px del centro pero DENTRO de la caja: atrae.
    move(260, 120);
    expect(xTo).toHaveBeenCalledWith(30);
    xTo.mockClear();
    // A 30 px del borde derecho, con un radio de 20: ya no, y vuelve a su
    // sitio en vez de quedarse desplazado.
    move(330, 120);
    expect(xTo).toHaveBeenCalledWith(0);
    expect(xTo).not.toHaveBeenCalledWith(65);
  });

  it('ignores anything that is not a mouse, so a stylus or a finger never drags the link around', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(<Magnetic><a href="https://example.test/contacto">Consultar</a></Magnetic>);
    stubBox(container.firstElementChild!, { left: 100, top: 100, width: 200, height: 40 });
    const event = new MouseEvent('pointermove', { clientX: 220, clientY: 130 }) as MouseEvent;
    Object.defineProperty(event, 'pointerType', { value: 'touch' });
    window.dispatchEvent(event);
    expect(xTo).not.toHaveBeenCalled();
  });

  it('drops its listeners and clears the transform on unmount', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Magnetic><a href="https://example.test/contacto">Consultar</a></Magnetic>);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(killTweensOf).toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith(expect.anything(), { x: 0, y: 0 });
  });
});
