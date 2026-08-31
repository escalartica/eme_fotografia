import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
  });
  return { fire: (next: boolean) => listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent)) };
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
