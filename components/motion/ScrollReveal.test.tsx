import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollReveal } from './ScrollReveal';
import styles from './ScrollReveal.module.css';

/**
 * These tests describe the ONE guarantee this component has to keep: the
 * content it wraps is in the DOM and is not hidden. The previous
 * implementation set `opacity: 0` from JavaScript and relied on a GSAP
 * ScrollTrigger to undo it, so the old suite asserted against gsap.set and
 * gsap.to call arguments -- it verified the mechanism, not the promise, and
 * it would have passed just as happily on a build where the copy never
 * became visible again. There is no GSAP here any more: the reveal is a CSS
 * scroll-driven animation, so what is worth asserting is the markup.
 */
describe('ScrollReveal', () => {
  it('renders its children with no JavaScript involved', () => {
    render(<ScrollReveal><p>Contenido visible</p></ScrollReveal>);
    expect(screen.getByText('Contenido visible')).toBeInTheDocument();
  });

  it('never sets an inline opacity, so content is visible at rest', () => {
    const { container } = render(<ScrollReveal><p>Contenido</p></ScrollReveal>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('');
    expect(wrapper.style.visibility).toBe('');
  });

  it('carries the base reveal class', () => {
    const { container } = render(<ScrollReveal><p>Contenido</p></ScrollReveal>);
    expect(container.firstElementChild).toHaveClass(styles.reveal);
  });

  it('adds the blur variant only when asked', () => {
    const { container: plain } = render(<ScrollReveal><p>a</p></ScrollReveal>);
    expect(plain.firstElementChild).not.toHaveClass(styles.blur);
    const { container: blurred } = render(<ScrollReveal blur><p>b</p></ScrollReveal>);
    expect(blurred.firstElementChild).toHaveClass(styles.blur);
  });

  it('uses the curtain wipe instead of the rise when clipReveal is set', () => {
    const { container } = render(<ScrollReveal clipReveal><p>c</p></ScrollReveal>);
    expect(container.firstElementChild).toHaveClass(styles.clip);
  });

  it('turns a stagger delay into an animation-range offset', () => {
    const { container } = render(<ScrollReveal delay={0.15}><p>d</p></ScrollReveal>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--reveal-offset')).toBe('12%');
  });

  it('caps that offset so a late item still reveals on screen', () => {
    const { container } = render(<ScrollReveal delay={5}><p>e</p></ScrollReveal>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--reveal-offset')).toBe('24%');
  });

  it('keeps a caller-supplied className alongside its own', () => {
    const { container } = render(<ScrollReveal className="propia"><p>f</p></ScrollReveal>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass('propia');
    expect(wrapper).toHaveClass(styles.reveal);
  });
});
