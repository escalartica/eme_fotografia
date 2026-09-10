'use client';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import LenisContext from './LenisContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    // A Lenis instance cannot exist before the DOM does, so there is no
    // value to read during render and nothing to hoist out of the effect:
    // creating it here and publishing it on the context is the only order
    // that works. Not the pattern the rule is aimed at (deriving state
    // that could have been computed during render).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenisInstance(lenis);
    // Canonical Lenis+ScrollTrigger wiring: drive Lenis from GSAP's own
    // ticker (one rAF loop instead of a second, independent one) and tell
    // ScrollTrigger to recompute on every Lenis scroll tick, so scroll-linked
    // tweens (Hero's parallax, Manifiesto's crossfade, TrabajosFilter's
    // re-flow) read Lenis's smoothed position on the same frame it changes,
    // not on whatever cadence the native `scroll` event happens to fire at.
    // Does NOT touch gsap.defaults()/ScrollTrigger.defaults() -- each
    // component already tunes its own easing/duration via lib/motion-tokens,
    // and a global default would silently override those.
    lenis.on('scroll', ScrollTrigger.update);
    function tick(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>;
}
