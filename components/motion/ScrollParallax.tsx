'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Wraps `children` (expected to fill its own box — e.g. an
 * object-fit:cover image) in a scroll-scrubbed vertical parallax layer.
 * The caller's containing element must be `position:relative` +
 * `overflow:hidden` (the clip boundary for this layer's oversized travel
 * range) — the same shape as ProjectGallery.tsx's `.item`/`.parallaxInner`
 * pair, generalized into a reusable component instead of copy-pasted.
 *
 * `trigger` (measured by ScrollTrigger, never transformed) and `layer`
 * (transformed, never measured) are deliberately different elements, one
 * level apart — not this project's documented nested-ScrollReveal bug
 * class (an ANCESTOR's translateY invalidating a DESCENDANT's own trigger
 * measurement): here the transformed element and the measured element are
 * siblings, neither nested inside the other, so the transform can never
 * shift what ScrollTrigger is reading.
 *
 * `layer` becomes a positioned ancestor (`position:absolute`), so an
 * absolutely-positioned descendant inside `children` (e.g.
 * EditorialSpread's `.playLabel`) would inherit this layer's own motion
 * instead of staying fixed — skip this wrapper for any children that rely
 * on that kind of internal absolute positioning.
 */
export function ScrollParallax({
  children,
  strength = 8,
}: {
  children: React.ReactNode;
  /** Travel range in percent of this layer's own height, split evenly
   * above/below rest (e.g. 8 -> -8%..+8%). Keep small — this should read
   * as depth, not as a slide. */
  strength?: number;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !triggerRef.current || !layerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        layerRef.current,
        { yPercent: -strength },
        {
          yPercent: strength,
          ease: 'none',
          scrollTrigger: {
            trigger: triggerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, triggerRef);
    return () => ctx.revert();
  }, [reducedMotion, strength]);

  return (
    <div ref={triggerRef} style={{ position: 'absolute', inset: 0 }}>
      <div ref={layerRef} style={{ position: 'absolute', inset: `-${strength}% 0`, width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
