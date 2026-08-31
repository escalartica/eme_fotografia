import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Confianza } from './Confianza';

describe('Confianza', () => {
  it('renders the real community numbers as the animated targets', () => {
    vi.useFakeTimers();
    render(<Confianza />);
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
