import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PageHit } from './PageHit';

let ruta = '/';
let parametros = new URLSearchParams();

vi.mock('next/navigation', () => ({
  usePathname: () => ruta,
  useSearchParams: () => parametros,
}));

let enviados: string[] = [];

beforeEach(() => {
  ruta = '/';
  parametros = new URLSearchParams();
  enviados = [];
  localStorage.clear();
  Object.defineProperty(navigator, 'sendBeacon', {
    configurable: true,
    writable: true,
    value: vi.fn((_url: string, blob: Blob) => {
      enviados.push(blob.type);
      return true;
    }),
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('PageHit', () => {
  it('manda un aviso por página vista', () => {
    render(<PageHit />);
    expect(enviados).toHaveLength(1);
  });

  /**
   * EL FALLO QUE ESTO EVITA no es técnico, es de negocio: el estudio entra en
   * su propia web varias veces al día y hasta ahora cada una de esas visitas
   * engordaba sus propias estadísticas. Con dos o tres visitas reales
   * diarias, eso es la mitad de la tabla con la que se decide cuánto se gasta
   * en anuncios.
   */
  it('deja de contar en este navegador al abrir con ?sinestadisticas=1', () => {
    parametros = new URLSearchParams('sinestadisticas=1');
    render(<PageHit />);
    expect(enviados).toHaveLength(0);
    expect(localStorage.getItem('eme-sin-estadisticas')).toBe('1');
  });

  it('y sigue sin contar en las páginas siguientes, ya sin el parámetro', () => {
    localStorage.setItem('eme-sin-estadisticas', '1');
    ruta = '/trabajos';
    render(<PageHit />);
    expect(enviados).toHaveLength(0);
  });

  it('vuelve a contar con ?sinestadisticas=0', () => {
    localStorage.setItem('eme-sin-estadisticas', '1');
    parametros = new URLSearchParams('sinestadisticas=0');
    render(<PageHit />);
    expect(enviados).toHaveLength(1);
    expect(localStorage.getItem('eme-sin-estadisticas')).toBeNull();
  });

  /**
   * Y a un visitante de verdad no le afecta nada de esto: en navegación
   * privada `localStorage` puede lanzar, y eso no puede costar una visita.
   */
  it('cuenta igual si el navegador no deja tocar el almacenamiento', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('bloqueado');
      },
    });
    try {
      render(<PageHit />);
      expect(enviados).toHaveLength(1);
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original);
    }
  });
});
