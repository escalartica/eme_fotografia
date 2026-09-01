'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollReveal({
  children,
  className,
  blur,
}: {
  children: React.ReactNode;
  className?: string;
  /**
   * Optional refinement (found via reference-site research: a subtle
   * `filter: blur(6px) → 0` reveal, seen on hollywoodexhibit2026.com's
   * intro copy). Layers a blur transition on top of the base
   * opacity+translate reveal below rather than replacing it. `filter` is
   * not a `transform`/`opacity` property — the site's general animation
   * rule — so this is an intentional, narrowly-scoped exception: it
   * defaults to `undefined`/falsy, so every other `ScrollReveal` instance
   * on the site keeps its existing base-only behavior untouched. It shares
   * the same `reducedMotion` early-return as the base reveal below, so it
   * never runs when the user prefers reduced motion.
   */
  blur?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.set(ref.current, { opacity: 0, y: 40, ...(blur ? { filter: 'blur(6px)' } : {}) });
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        ...(blur ? { filter: 'blur(0px)' } : {}),
        duration: motion.duration.slow,
        ease: motion.ease.standard,
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      });
    }, ref);
    return () => ctx.revert();
  }, [reducedMotion, blur]);

  return <div ref={ref} className={className}>{children}</div>;
}
