import { describe, it, expect, vi, afterEach } from 'vitest';
import { withPageTransition } from './PageTransition';

afterEach(() => { delete (document as any).startViewTransition; vi.clearAllMocks(); });

describe('withPageTransition', () => {
  it('uses the native View Transitions API when available', () => {
    const startViewTransition = vi.fn((cb: () => void) => { cb(); return { finished: Promise.resolve() }; });
    (document as any).startViewTransition = startViewTransition;
    const navigate = vi.fn();
    withPageTransition(navigate);
    expect(startViewTransition).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalled();
  });

  it('falls back to calling navigate directly when unsupported', () => {
    const navigate = vi.fn();
    withPageTransition(navigate);
    expect(navigate).toHaveBeenCalled();
  });
});
