import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { gsapTo } = vi.hoisted(() => ({
  gsapTo: vi.fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    to: gsapTo,
    registerPlugin: vi.fn(),
    context: vi.fn().mockImplementation((cb, ref) => {
      cb();
      return { revert: vi.fn() };
    }),
    set: vi.fn(),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));

import { ScrollReveal } from './ScrollReveal';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

afterEach(() => vi.clearAllMocks());

describe('ScrollReveal', () => {
  it('always renders children in the DOM (progressive enhancement)', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollReveal><p>Contenido visible</p></ScrollReveal>);
    expect(screen.getByText('Contenido visible')).toBeInTheDocument();
  });

  it('skips animation setup when motion is reduced', () => {
    (useReducedMotion as any).mockReturnValue(true);
    render(<ScrollReveal><p>Contenido</p></ScrollReveal>);
    expect(gsapTo).not.toHaveBeenCalled();
  });

  it('sets up a GSAP animation when motion is not reduced', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollReveal><p>Contenido</p></ScrollReveal>);
    expect(gsapTo).toHaveBeenCalled();
  });
});
