import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

describe('/sobre-nosotros page', () => {
  it('speaks in the studio voice, not a fabricated personal bio', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EME Fotografía Sevilla');
    expect(screen.getByRole('heading', { name: /equipo/i })).toBeInTheDocument();
  });

  it('flags the team photo/name as pending real content', () => {
    render(<Page />);
    expect(screen.getByText(/pendiente de/i)).toBeInTheDocument();
  });
});
