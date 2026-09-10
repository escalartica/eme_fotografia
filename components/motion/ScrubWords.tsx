'use client';
import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * A paragraph whose words come up from faint to full ink as the reader
 * scrolls through it -- the "read along" statement Agentura and Lundani
 * put between sections. Scrubbed, so it tracks the scroll both ways.
 * Static (fully inked) under prefers-reduced-motion.
 */
export function ScrubWords({ as: Tag = 'p', className, children }: { as?: ElementType; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    let split: SplitText | null = null;
    let ctx: gsap.Context | null = null;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        split = SplitText.create(el, { type: 'words', tag: 'span', aria: 'none' });
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.4 },
          }
        );
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
      split?.revert();
    };
  }, [reducedMotion]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp ref={ref} className={className}>
      {children}
    </Comp>
  );
}
