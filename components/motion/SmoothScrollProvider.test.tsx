import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SmoothScrollProvider } from './SmoothScrollProvider';

const lenisInstances: Array<{ raf: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }> = [];
vi.mock('lenis', () => ({
  default: vi.fn().mockImplementation(function LenisMock() {
    const instance = { raf: vi.fn(), destroy: vi.fn() };
    lenisInstances.push(instance);
    return instance;
  }),
}));

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

afterEach(() => { lenisInstances.length = 0; vi.clearAllMocks(); });

describe('SmoothScrollProvider', () => {
  it('initializes Lenis when motion is not reduced', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<SmoothScrollProvider><div>contenido</div></SmoothScrollProvider>);
    expect(lenisInstances.length).toBe(1);
  });

  it('does not initialize Lenis when motion is reduced', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<SmoothScrollProvider><div>contenido</div></SmoothScrollProvider>);
    expect(lenisInstances.length).toBe(0);
  });
});
