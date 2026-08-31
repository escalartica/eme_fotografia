import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

function mockMatchMedia(matches: boolean) {
  // `matches` is a live property on a real MediaQueryList — it reflects the
  // current query result at the moment it's read, not just at construction
  // time. Model that here (via a getter) so a hook that re-reads
  // window.matchMedia(...).matches after a 'change' event — as a real
  // MediaQueryList-backed external store does — observes the update, not a
  // frozen initial value.
  let current = matches;
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  window.matchMedia = vi.fn().mockReturnValue({
    get matches() { return current; },
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
  });
  return {
    fire: (next: boolean) => {
      current = next;
      listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent));
    },
  };
}

afterEach(() => vi.restoreAllMocks());

describe('useReducedMotion', () => {
  it('reflects the initial media query value', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const { fire } = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => fire(true));
    expect(result.current).toBe(true);
  });
});
