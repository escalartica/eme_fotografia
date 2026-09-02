import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

describe('/sobre-nosotros page', () => {
  // ShowreelClip.tsx calls the real <video>.play() on mount -- jsdom has no
  // real media pipeline (same limitation VideoPreview.test.tsx/Hero.test.tsx
  // already work around), so it returns undefined instead of a Promise.
  beforeAll(() => {
    (window.HTMLMediaElement.prototype as any).play = () => Promise.resolve();
  });

  it('speaks in the studio voice, not a fabricated personal bio', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EME Fotografía Sevilla');
    expect(screen.getByRole('heading', { name: /equipo/i })).toBeInTheDocument();
  });

  it('flags the team photo/name as pending real content', () => {
    render(<Page />);
    expect(screen.getByText(/pendiente de/i)).toBeInTheDocument();
  });

  it('shows a real work showreel clip', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /nuestro trabajo/i })).toBeInTheDocument();
  });
});
