import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { gsapTo } = vi.hoisted(() => ({
  gsapTo: vi.fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    to: gsapTo,
    context: vi.fn((fn) => {
      fn();
      return { revert: vi.fn() };
    }),
    registerPlugin: vi.fn(),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));

import { Manifiesto } from './Manifiesto';

describe('Manifiesto', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the studio\'s philosophy statement as a heading + copy', () => {
    render(<Manifiesto />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/editorial/i)).toBeInTheDocument();
  });

  it('renders a non-semantic masked-photo duplicate of the heading, hidden from assistive tech', () => {
    render(<Manifiesto />);
    const heading = screen.getByRole('heading', { level: 2 });
    const masked = screen.getByTestId('manifiesto-heading-masked');
    expect(masked).toHaveAttribute('aria-hidden', 'true');
    expect(masked.textContent).toBe(heading.textContent);
    // Only one real heading should exist for screen readers.
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
  });

  it('sets up the masked-photo crossfade scroll trigger when motion is not reduced', () => {
    render(<Manifiesto />);
    expect(gsapTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        opacity: 1,
        scrollTrigger: expect.objectContaining({ scrub: true }),
      })
    );
  });

  it('never sets up the crossfade when motion is reduced, leaving the masked layer at its CSS opacity: 0 default', () => {
    // Same real-matchMedia-override pattern established in Hero.test.tsx:
    // drive the real useReducedMotion hook to `true` rather than mocking the
    // hook itself.
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
      render(<Manifiesto />);
      expect(gsapTo).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
