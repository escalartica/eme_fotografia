import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { gsapFromTo } = vi.hoisted(() => ({
  gsapFromTo: vi.fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    fromTo: gsapFromTo,
    registerPlugin: vi.fn(),
    context: vi.fn().mockImplementation((cb) => {
      cb();
      return { revert: vi.fn() };
    }),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));

import { ScrollParallax } from './ScrollParallax';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

afterEach(() => vi.clearAllMocks());

describe('ScrollParallax', () => {
  it('always renders children in the DOM (progressive enhancement)', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollParallax><img alt="Foto" /></ScrollParallax>);
    expect(screen.getByAltText('Foto')).toBeInTheDocument();
  });

  it('skips animation setup when motion is reduced', () => {
    (useReducedMotion as any).mockReturnValue(true);
    render(<ScrollParallax><img alt="Foto" /></ScrollParallax>);
    expect(gsapFromTo).not.toHaveBeenCalled();
  });

  it('sets up a scrubbed GSAP tween with a symmetric yPercent travel range when motion is not reduced', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollParallax><img alt="Foto" /></ScrollParallax>);
    expect(gsapFromTo).toHaveBeenCalled();
    const [, from, to] = gsapFromTo.mock.calls[0];
    expect(from).toMatchObject({ yPercent: -8 });
    expect(to).toMatchObject({ yPercent: 8, ease: 'none' });
    expect(to.scrollTrigger).toMatchObject({ start: 'top bottom', end: 'bottom top', scrub: true });
  });

  it('honors a custom strength for both the travel range and scrollTrigger is still wired', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollParallax strength={15}><img alt="Foto" /></ScrollParallax>);
    const [, from, to] = gsapFromTo.mock.calls[0];
    expect(from).toMatchObject({ yPercent: -15 });
    expect(to).toMatchObject({ yPercent: 15 });
  });
});
