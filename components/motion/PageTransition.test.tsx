import { describe, it, expect, vi, afterEach } from 'vitest';
import { withPageTransition } from './PageTransition';

// `delete document.startViewTransition` no compila: lib.dom la declara
// obligatoria aunque jsdom no la traiga; Reflect hace lo mismo en runtime.
afterEach(() => { Reflect.deleteProperty(document, 'startViewTransition'); vi.clearAllMocks(); });

describe('withPageTransition', () => {
  it('uses the native View Transitions API when available', () => {
    const startViewTransition = vi.fn((cb: () => void) => { cb(); return { finished: Promise.resolve() }; });
    // Doble parcial a propósito: nadie lee el ViewTransition devuelto, y
    // rellenar la interfaz entera sólo añadiría ruido al test.
    document.startViewTransition = startViewTransition as unknown as typeof document.startViewTransition;
    const navigate = vi.fn();
    withPageTransition(navigate);
    expect(startViewTransition).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalled();
  });

  it('falls back to calling navigate directly when unsupported', () => {
    const navigate = vi.fn();
    withPageTransition(navigate);
    expect(navigate).toHaveBeenCalled();
  });
});
