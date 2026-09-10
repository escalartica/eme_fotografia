import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';
import { site } from '@/content/site';

describe('/sobre-nosotros page', () => {
  // ShowreelClip.tsx calls the real <video>.play() on mount -- jsdom has no
  // real media pipeline, so it returns undefined instead of a Promise.
  beforeAll(() => {
    (window.HTMLMediaElement.prototype as unknown as { play: () => Promise<void> }).play = () => Promise.resolve();
  });

  it('speaks in the studio voice and names the founder', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EME Fotografía Sevilla');
    expect(screen.getByRole('heading', { name: /equipo/i })).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(site.founderName)).length).toBeGreaterThan(0);
  });

  it('has no placeholder copy left', () => {
    render(<Page />);
    expect(screen.queryByText(/pendiente de/i)).not.toBeInTheDocument();
  });

  it('walks through mirada, proceso, showreel and figures', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /nuestra mirada/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cómo trabajamos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /en movimiento/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /cifras/i })).toBeInTheDocument();
  });
});
