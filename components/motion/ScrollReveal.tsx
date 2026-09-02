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
  delay = 0,
  clipReveal,
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
  /**
   * Optional stagger delay in seconds (GSAP `delay`), for callers rendering
   * a list of ScrollReveal instances that should reveal in visible sequence
   * rather than each firing independently the instant it individually
   * crosses the trigger threshold (which, for tightly-grouped siblings,
   * often crosses close enough in time to read as simultaneous rather than
   * staggered). Defaults to 0 — no behavior change for existing callers.
   */
  delay?: number;
  /**
   * "Image reveal" / clip-path wipe (audit finding: explicitly requested,
   * missing site-wide) — a curtain-style reveal from a closed
   * `clip-path: inset(0 0 100% 0)` (fully hidden, clipped from the bottom
   * edge up) to fully open, in place of the base reveal's `y: 40 -> 0`
   * translate. Mutually exclusive with the base translate (using both
   * reads as the image sliding AND being wiped at once, fighting each
   * other) — opacity and the optional `blur` still apply the same as the
   * base reveal. `clip-path` is a third narrow exception to this
   * codebase's "animate only transform/opacity" rule, alongside `blur`'s
   * existing one: both are GPU-composited, non-layout-affecting
   * properties, not arbitrary reflow-triggering ones.
   */
  clipReveal?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.set(ref.current, {
        opacity: 0,
        ...(clipReveal ? { clipPath: 'inset(0 0 100% 0)' } : { y: 40 }),
        ...(blur ? { filter: 'blur(6px)' } : {}),
      });
      gsap.to(ref.current, {
        opacity: 1,
        ...(clipReveal ? { clipPath: 'inset(0 0 0% 0)' } : { y: 0 }),
        ...(blur ? { filter: 'blur(0px)' } : {}),
        duration: motion.duration.slow,
        delay,
        ease: motion.ease.standard,
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      });
    }, ref);
    return () => ctx.revert();
  }, [reducedMotion, blur, delay, clipReveal]);

  return <div ref={ref} className={className}>{children}</div>;
}
