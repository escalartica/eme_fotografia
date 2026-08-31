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

  it('never leaves the intro sequence stuck on screen when the OS reports reduced motion', () => {
    // Regression test for a hook-timing race: useReducedMotion() starts `false`
    // and only flips to `true` inside its OWN internal effect (asynchronously,
    // after its first `matchMedia` read). To reproduce the real race — not just
    // assert an end-state that a naive "reducedMotion mocked true from the start"
    // test could pass trivially without ever exercising it — this drives the
    // REAL useReducedMotion hook (not a vi.mock stub returning `true` outright)
    // by overriding window.matchMedia so the hook's internal effect resolves
    // `matches: true`. That reproduces the exact sequence that caused the bug:
    // Hero's effect first runs with the stale `reducedMotion=false` (scheduling
    // the intro overlay + a 1400ms timer), then reducedMotion flips to `true` in
    // the same commit, so Hero's effect re-runs before that timer ever fires.
    // Without the fix, the reduced-motion branch only set sessionStorage and
    // returned, leaving `showIntro` stuck `true` from the earlier run.
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    try {
      render(<Hero />);
      expect(screen.queryByTestId('intro-sequence')).not.toBeInTheDocument();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
