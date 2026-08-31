import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Confianza } from './Confianza';

describe('Confianza', () => {
  it('renders the real community numbers as the animated targets once scrolled into view', () => {
    // The count-up is now gated behind visibility (see the "scroll-triggered"
    // describe block below), so this test must simulate the section
    // intersecting the viewport before advancing timers — otherwise the
    // default no-op IntersectionObserver stub from vitest.setup.ts never
    // fires and the count-up never starts.
    let intersectCallback: IntersectionObserverCallback | undefined;
    (window as any).IntersectionObserver = vi.fn().mockImplementation(function (cb: IntersectionObserverCallback) {
      intersectCallback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    });
    vi.useFakeTimers();
    render(<Confianza />);
    act(() => { intersectCallback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('2320')).toBeInTheDocument();
    expect(screen.getByText('1622')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renders the target values immediately with no count-up when reduced motion is preferred', () => {
    // Global constraint: every animation must respect prefers-reduced-motion via
    // useReducedMotion — no exceptions. This drives the REAL useReducedMotion hook
    // (not a vi.mock stub) by overriding window.matchMedia so its internal effect
    // resolves matches: true, mirroring Hero's "no flash-screen intro" pattern:
    // straight to final content, no animation. We deliberately do NOT advance any
    // timers here — if a regression reintroduces an unconditional setInterval
    // count-up, the numbers would still read 0 (or a partial value) at this point
    // and the assertions below would fail.
    vi.useFakeTimers();
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
      render(<Confianza />);
      expect(screen.getByText('2320')).toBeInTheDocument();
      expect(screen.getByText('1622')).toBeInTheDocument();
    } finally {
      window.matchMedia = originalMatchMedia;
      vi.useRealTimers();
    }
  });
});

describe('Confianza — scroll-triggered', () => {
  let intersectCallback: IntersectionObserverCallback | undefined;

  beforeEach(() => {
    intersectCallback = undefined;
    (window as any).IntersectionObserver = vi.fn().mockImplementation(function (cb: IntersectionObserverCallback) {
      intersectCallback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    });
  });

  it('does not start counting until it scrolls into view', () => {
    vi.useFakeTimers();
    render(<Confianza />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.queryByText('2320')).not.toBeInTheDocument();

    act(() => { intersectCallback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('2320')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
