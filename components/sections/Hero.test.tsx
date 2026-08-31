import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  beforeEach(() => sessionStorage.clear());

  it('shows the intro sequence on first visit', () => {
    render(<Hero />);
    expect(screen.getByTestId('intro-sequence')).toBeInTheDocument();
  });

  it('skips the intro sequence on a later mount within the same session', () => {
    sessionStorage.setItem('eme-intro-shown', 'true');
    render(<Hero />);
    expect(screen.queryByTestId('intro-sequence')).not.toBeInTheDocument();
  });

  it('always renders the hero headline communicating who/what/why', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/EME Fotografía Sevilla/i);
    expect(screen.getByText(/bodas/i)).toBeInTheDocument();
  });
});
