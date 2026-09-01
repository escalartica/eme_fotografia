import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

describe('Home page', () => {
  it('renders every narrative section in order', () => {
    render(<Page />);
    const headingTexts = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headingTexts).toEqual([
      'No contamos bodas. Contamos historias con fecha.',
      'Trabajos seleccionados',
      'Servicios',
      'No dirigimos la boda: la seguimos de cerca hasta que se cuenta sola.',
      'Lo que dicen de nosotros',
      '¿Celebras algo importante?',
    ]);
  });
});
