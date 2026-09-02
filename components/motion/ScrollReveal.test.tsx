import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { gsapTo, gsapSet } = vi.hoisted(() => ({
  gsapTo: vi.fn(),
  gsapSet: vi.fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    to: gsapTo,
    registerPlugin: vi.fn(),
    context: vi.fn().mockImplementation((cb, ref) => {
      cb();
      return { revert: vi.fn() };
    }),
    set: gsapSet,
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

  it('does not add a filter property by default', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollReveal><p>Contenido</p></ScrollReveal>);
    expect(gsapSet.mock.calls[0][1]).not.toHaveProperty('filter');
    expect(gsapTo.mock.calls[0][1]).not.toHaveProperty('filter');
  });

  it('layers a blur filter transition on top of the base reveal when blur is true', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollReveal blur><p>Contenido</p></ScrollReveal>);
    expect(gsapSet.mock.calls[0][1]).toMatchObject({ opacity: 0, y: 40, filter: 'blur(6px)' });
    expect(gsapTo.mock.calls[0][1]).toMatchObject({ opacity: 1, y: 0, filter: 'blur(0px)' });
  });

  it('skips the blur filter too when motion is reduced, even with blur set', () => {
    (useReducedMotion as any).mockReturnValue(true);
    render(<ScrollReveal blur><p>Contenido</p></ScrollReveal>);
    expect(gsapSet).not.toHaveBeenCalled();
    expect(gsapTo).not.toHaveBeenCalled();
  });

  it('uses a clip-path wipe instead of the base y-translate when clipReveal is true', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollReveal clipReveal><p>Contenido</p></ScrollReveal>);
    expect(gsapSet.mock.calls[0][1]).toMatchObject({ opacity: 0, clipPath: 'inset(0 0 100% 0)' });
    expect(gsapSet.mock.calls[0][1]).not.toHaveProperty('y');
    expect(gsapTo.mock.calls[0][1]).toMatchObject({ opacity: 1, clipPath: 'inset(0 0 0% 0)' });
    expect(gsapTo.mock.calls[0][1]).not.toHaveProperty('y');
  });

  it('uses the base y-translate, not clip-path, when clipReveal is not set', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollReveal><p>Contenido</p></ScrollReveal>);
    expect(gsapSet.mock.calls[0][1]).toMatchObject({ opacity: 0, y: 40 });
    expect(gsapSet.mock.calls[0][1]).not.toHaveProperty('clipPath');
  });
});
