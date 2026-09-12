import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Contador } from './Contador';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

let intersectCallback: IntersectionObserverCallback | undefined;
let desconectado = false;

/**
 * El reloj de la animación, a mano.
 *
 * Aquí había temporizadores falsos de vitest MÁS un doble de
 * `requestAnimationFrame` hecho con `setTimeout`. La mezcla se rompe al
 * desmontar: el componente limpia con `cancelAnimationFrame` un identificador
 * que había creado `setTimeout`, y el reloj falso se planta («Cannot clear
 * timer: timer created with setTimeout() but cleared with
 * cancelAnimationFrame()»). Con una cola propia el par pedir/cancelar es
 * coherente, no hace falta reloj falso ninguno, y además la prueba controla
 * fotograma a fotograma en vez de a base de adivinar milisegundos.
 */
let cola: FrameRequestCallback[] = [];
let ahora = 0;

beforeEach(() => {
  intersectCallback = undefined;
  desconectado = false;
  cola = [];
  ahora = 0;
  vi.mocked(useReducedMotion).mockReturnValue(false);
  window.IntersectionObserver = vi.fn().mockImplementation(function (cb: IntersectionObserverCallback) {
    intersectCallback = cb;
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(() => { desconectado = true; }) };
  }) as unknown as typeof IntersectionObserver;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => cola.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.spyOn(performance, 'now').mockImplementation(() => ahora);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const entraEnPantalla = () =>
  act(() => {
    intersectCallback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
  });

/** Corre los fotogramas pendientes hasta que pasen `ms` de reloj. */
function avanzar(ms: number) {
  const fin = ahora + ms;
  while (ahora < fin && cola.length > 0) {
    ahora = Math.min(fin, ahora + 16);
    const pendientes = cola;
    cola = [];
    act(() => pendientes.forEach((cb) => cb(ahora)));
  }
}

describe('Contador', () => {
  // LA RAZÓN DE SER DE ESTA PRUEBA. Si la cifra arrancara en cero, el HTML que
  // sirve el servidor -- el que leen Google y quien tenga JavaScript
  // desactivado -- diría «+0 parejas nos han confiado su boda». La cuenta es un
  // adorno; el dato no puede depender de ella.
  it('renders the final figure before any script runs', () => {
    render(<Contador valor={300} formato="entero-con-mas" />);
    expect(screen.getByText('+300')).toBeInTheDocument();
  });

  it('counts up to the figure once it comes into view', () => {
    render(<Contador valor={300} formato="entero-con-mas" />);
    entraEnPantalla();
    avanzar(40);
    // A mitad de camino ya no dice el valor final: está contando.
    expect(screen.getByRole('img').textContent).not.toBe('+300');
    avanzar(2000);
    expect(screen.getByRole('img').textContent).toBe('+300');
  });

  // Una cifra que vuelve a contar cada vez que se pasa por delante deja de
  // leerse como un dato y pasa a ser un adorno.
  it('counts once and then stops watching', () => {
    render(<Contador valor={300} />);
    entraEnPantalla();
    expect(desconectado).toBe(true);
  });

  // Lo que se anuncia es la cifra, no los números por los que pasa.
  it('announces only the final figure while the digits are running', () => {
    render(<Contador valor={5} formato="nota" />);
    entraEnPantalla();
    avanzar(40);
    expect(screen.getByRole('img', { name: '5,0' })).toBeInTheDocument();
  });

  // EL FALLO QUE ESTO IMPIDE QUE VUELVA. `Cifras` es un componente de servidor
  // y éste de cliente. La primera versión recibía el formateador como función,
  // y React tumba la página entera al arrancar: «Functions cannot be passed
  // directly to Client Components». Lo pilló el cliente, no las pruebas --
  // aquí los dos componentes son de cliente y la función pasaba sin más. Que
  // el formato sea una cadena es lo que hace que la frontera se pueda cruzar.
  it('takes its format as a serialisable value, not a function', () => {
    render(<Contador valor={5} formato="nota" />);
    expect(screen.getByText('5,0')).toBeInTheDocument();
  });

  it('stays still for anyone who asked for less motion', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<Contador valor={300} formato="entero-con-mas" />);
    expect(window.IntersectionObserver).not.toHaveBeenCalled();
    expect(screen.getByText('+300')).toBeInTheDocument();
  });
});
