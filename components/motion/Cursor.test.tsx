import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
