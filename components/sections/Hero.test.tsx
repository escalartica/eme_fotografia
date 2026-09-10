import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const { gsapTo, gsapSet, gsapFrom, splitTextCreate, splitInstance } = vi.hoisted(() => {
  const splitInstance = { chars: ['e', 'm', 'e'], revert: vi.fn() };
  return {
    gsapTo: vi.fn(),
    gsapSet: vi.fn(),
    gsapFrom: vi.fn(),
    splitTextCreate: vi.fn(() => splitInstance),
    splitInstance,
  };
});

vi.mock('gsap', () => ({
  gsap: {
    to: gsapTo,
    set: gsapSet,
    from: gsapFrom,
    registerPlugin: vi.fn(),
    context: vi.fn().mockImplementation((cb: () => void) => {
      cb();
      return { revert: vi.fn() };
    }),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('gsap/SplitText', () => ({ SplitText: { create: splitTextCreate } }));
// The mosaic has its own test (HeroMosaic.test.tsx) and its own gsap needs
// (quickTo, timeline) that the minimal gsap stub above does not provide.
vi.mock('./HeroMosaic', () => ({ HeroMosaic: () => <div data-testid="hero-mosaic" /> }));
// The title sequence has its own test (components/motion/CinematicIntro.test.tsx).
vi.mock('@/components/motion/CinematicIntro', () => ({ CinematicIntro: () => <div data-testid="intro-sequence" /> }));

import { Hero } from './Hero';

// Shared matchMedia stub builder: every test in this file that needs a
// custom matchMedia (rather than the jsdom-less default stub in
// vitest.setup.ts, which returns `matches: false` for every query) uses
// this so per-query behavior stays explicit and readable at the call site.
function mockMatchMedia(overrides: Record<string, boolean>) {
  return ((query: string) => ({
    matches: overrides[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

describe('Hero', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // jsdom has no real media pipeline: HTMLMediaElement.prototype.play/pause
    // throw "not implemented" unless stubbed. Mirrors VideoPreview.test.tsx.
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
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

  it('renders the mosaic band beneath the masthead', () => {
    render(<Hero />);
    expect(screen.getByTestId('hero-mosaic')).toBeInTheDocument();
  });

  it('always renders the hero headline communicating who/what/why', () => {
    render(<Hero />);
    // Both assertions on the H1 itself. A bare getByText(/bodas/i) matched
    // four elements -- the heading, the standfirst and two corner notes --
    // and threw. What this test is about is the HEADING saying who and
    // what, so that is what it should look at.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/EME Fotografía Sevilla/i);
    expect(heading).toHaveTextContent(/bodas/i);
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

  it('reveals the wordmark per character via a masked SplitText once the intro is resolved and motion is not reduced', async () => {
    // Simulate a repeat visit (sessionStorage already marks the intro as
    // shown) so `introResolved` flips `true` synchronously on mount, same
    // convention as "skips the intro sequence on a later mount" above --
    // this is what lets the reveal effect's guard clear without needing to
    // advance fake timers past the 900ms first-visit intro. The split itself
    // is deferred behind `document.fonts.ready` (stubbed resolved in
    // vitest.setup.ts), so the assertion has to wait a tick for that
    // microtask to flush.
    sessionStorage.setItem('eme-intro-shown', 'true');
    render(<Hero />);
    await waitFor(() => expect(splitTextCreate).toHaveBeenCalled());
    // objectContaining, not deep equality: Hero also passes `aria: 'none'`
    // (SplitText must not put aria-label on a generic <span>; the h1's name
    // comes from its sr-only copy). What this test cares about is the split
    // type and the line mask, not the full options bag.
    expect(splitTextCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: 'chars,lines', mask: 'lines' })
    );
    expect(gsapFrom).toHaveBeenCalledWith(
      splitInstance.chars,
      expect.objectContaining({ yPercent: 115, stagger: expect.any(Number) })
    );
  });

  it('does not run the wordmark reveal when motion is reduced', async () => {
    // Same real-matchMedia-override pattern as the other reduced-motion
    // tests in this file: drive the real useReducedMotion hook to `true`.
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = mockMatchMedia({ [REDUCED_MOTION_QUERY]: true });

    try {
      sessionStorage.setItem('eme-intro-shown', 'true');
      render(<Hero />);
      // Flush the document.fonts.ready microtask queue the same way the
      // positive-case test waits for it, then confirm it never fired.
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(splitTextCreate).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
