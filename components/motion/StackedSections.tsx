'use client';
import { Children, useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './StackedSections.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Section transitions in the Agentura (Framer) manner: a section that fits
 * the viewport pins at the top while the next one slides up over it, and
 * the pinned one recedes (slight scale-down, dimmed) as it is covered -- a
 * stack of cards rather than a plain scroll.
 *
 * Each direct child becomes one panel. Panels taller than the viewport
 * stay in the normal flow (a pinned element taller than the screen could
 * never be read to the end), so they act as the sliding layer over the
 * pinned panel before them. Measured on mount and on resize.
 */
export function StackedSections({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    const panels = Array.from(root.children) as HTMLElement[];
    let ctx: gsap.Context | null = null;
    let timer = 0;

    const build = () => {
      ctx?.revert();
      panels.forEach((p) => p.classList.remove(styles.pinned));
      const pinned = panels.map((p) => p.scrollHeight <= window.innerHeight + 2);
      panels.forEach((p, i) => p.classList.toggle(styles.pinned, pinned[i]));
      ctx = gsap.context(() => {
        panels.forEach((panel, i) => {
          const next = panels[i + 1];
          if (!next || !pinned[i]) return;
          // As the next panel covers this pinned one, a veil of paper
          // rises over it so it recedes -- a veil rather than opacity, so
          // the panels further down the stack never show through.
          const veil = panel.querySelector(`.${styles.veil}`);
          if (!veil) return;
          gsap.fromTo(
            veil,
            { opacity: 0 },
            { opacity: 0.75, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } }
          );
        });
      }, root);
      ScrollTrigger.refresh();
    };

    build();
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timer);
      ctx?.revert();
      panels.forEach((p) => p.classList.remove(styles.pinned));
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className={styles.stack}>
      {Children.map(children, (child, i) => (
        <div className={styles.panel} data-panel={i + 1}>
          {child}
          <div className={styles.veil} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
