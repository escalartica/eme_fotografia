import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Link from 'next/link';
import { Cursor } from './Cursor';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));

function mockPointerFine() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('pointer: fine'),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('Cursor', () => {
  it('shows the hovered label when entering a data-cursor target', () => {
    mockPointerFine();
    render(
      <>
        <Cursor />
        <button data-cursor="ver">Ver proyecto</button>
      </>
    );
    fireEvent.mouseOver(screen.getByText('Ver proyecto'));
    expect(screen.getByTestId('cursor-label')).toHaveTextContent('VER');
  });

  it('does not render on coarse pointers (touch)', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('pointer: coarse'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Cursor />);
    expect(screen.queryByTestId('cursor-label')).not.toBeInTheDocument();
  });

  it('shows the "ABRIR" label when entering an abrir data-cursor target', () => {
    mockPointerFine();
    render(
      <>
        <Cursor />
        <a href="https://example.com" target="_blank" data-cursor="abrir">Enlace externo</a>
      </>
    );
    fireEvent.mouseOver(screen.getByText('Enlace externo'));
    expect(screen.getByTestId('cursor-label')).toHaveTextContent('ABRIR');
  });

  it('shows the "EXPLORAR" label when entering an explorar data-cursor target', () => {
    mockPointerFine();
    render(
      <>
        <Cursor />
        {/* Enlace interno con next/link, como en el sitio real: un <a> a una
            ruta propia se saltaría el router del App Router. */}
        <Link href="/siguiente" data-cursor="explorar">Siguiente proyecto</Link>
      </>
    );
    fireEvent.mouseOver(screen.getByText('Siguiente proyecto'));
    expect(screen.getByTestId('cursor-label')).toHaveTextContent('EXPLORAR');
  });

  // SOBRE UN VÍDEO, UN TRIÁNGULO Y NO LA PALABRA. «REPRODUCIR» en versalitas
  // dentro de un disco, encima de una fotografía de boda y a la vez que el
  // botón que decía lo mismo en el centro del cuadro, era el mismo mensaje dos
  // veces tapando el trabajo. El triángulo no tiene idioma y ocupa una cuarta
  // parte.
  it('draws a play triangle over a video instead of spelling the word', () => {
    mockPointerFine();
    const { container } = render(
      <>
        <Cursor />
        <div data-cursor="reproducir">
          <span>Tráiler</span>
        </div>
      </>
    );
    fireEvent.mouseOver(screen.getByText('Tráiler'));
    const pista = screen.getByTestId('cursor-label');
    expect(pista).toHaveTextContent('');
    expect(container.querySelector('[data-testid="cursor-label"] svg')).not.toBeNull();
  });

  it('keeps words for the hints that have no symbol everyone reads', () => {
    mockPointerFine();
    render(
      <>
        <Cursor />
        <Link href="/trabajos" data-cursor="explorar">Siguiente</Link>
      </>
    );
    fireEvent.mouseOver(screen.getByText('Siguiente'));
    expect(screen.getByTestId('cursor-label')).toHaveTextContent('EXPLORAR');
  });
});
