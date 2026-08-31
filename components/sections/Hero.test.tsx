import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { gsapTo } = vi.hoisted(() => ({
  gsapTo: vi.fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    to: gsapTo,
    registerPlugin: vi.fn(),
    context: vi.fn().mockImplementation((cb: () => void) => {
      cb();
      return { revert: vi.fn() };
    }),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));

import { Hero } from './Hero';

describe('Hero', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // jsdom has no real media pipeline: HTMLMediaElement.prototype.play/pause
    // throw "not implemented" unless stubbed. Mirrors VideoPreview.test.tsx.
    (window.HTMLMediaElement.prototype as any).play = vi.fn().mockResolvedValue(undefined);
    (window.HTMLMediaElement.prototype as any).pause = vi.fn();
  });
  afterEach(() => vi.clearAllMocks());

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

  it('sets up a contained parallax tween on the hero image when motion is not reduced', () => {
    render(<Hero />);
    expect(gsapTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        scrollTrigger: expect.objectContaining({ trigger: expect.anything() }),
      })
    );
  });

  it('renders the real wedding footage as the hero background video, with its poster', () => {
    render(<Hero />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video?.getAttribute('src')).toContain('real-boda-01-full.mp4');
    expect(video?.getAttribute('poster')).toContain('real-boda-01-full.webp');
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
  });

  it('plays the hero video imperatively when motion is not reduced', () => {
    render(<Hero />);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('never calls .play() on the hero video when motion is reduced, showing the static poster instead', () => {
    // Same real-matchMedia-override pattern as the other reduced-motion tests
    // in this file: drive the real useReducedMotion hook to `true`.
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
      expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('does not set up parallax when motion is reduced', () => {
    // Same real-matchMedia-override pattern as the stuck-intro-overlay
    // regression test above: drive the real useReducedMotion hook to `true`
    // rather than mocking the hook itself, since this file establishes that
    // convention already.
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
      expect(gsapTo).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
