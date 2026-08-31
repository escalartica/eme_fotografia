'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Hero.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const INTRO_KEY = 'eme-intro-shown';

export function Hero() {
  const [showIntro, setShowIntro] = useState(false);
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(INTRO_KEY) === 'true';
    if (alreadyShown) return;
    if (reducedMotion) {
      // No flash-screen under reduced motion — mark it shown and skip straight to content.
      // Also clear any intro state a prior stale run of this effect may have set: on
      // mount, useReducedMotion() starts `false` and flips to `true` asynchronously in
      // its own effect, so this effect can run once with the stale `false` value
      // (scheduling the intro) before re-running here with the corrected `true` value.
      // Without this, showIntro would stay stuck `true` with no timer left to clear it.
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
      return;
    }
    setShowIntro(true);
    const timer = setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
    }, 1400);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // Contained parallax on the hero background image: a very subtle
  // translateY as the user scrolls past the section. Scoped to the Hero
  // only (per the client's "parallax muy contenido" request), animates
  // only `transform` (GSAP's `yPercent` compiles to a CSS transform), and
  // is fully gated behind reduced motion — no ScrollTrigger is ever
  // created when reducedMotion is true.
  useEffect(() => {
    if (reducedMotion || !heroRef.current || !imageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, heroRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={heroRef} className={styles.hero} data-hero-fullbleed>
      {showIntro && (
        <div data-testid="intro-sequence" className={styles.intro}>
          <span className={styles.introMark}>eme</span>
        </div>
      )}
      <div ref={imageRef} className={styles.imageParallax}>
        <Image
          src="/images/hero/placeholder-hero-01.webp"
          alt="Pareja de novios en un momento espontáneo, fotografía editorial de boda"
          fill
          priority
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h1>{site.brandName}</h1>
        <p>Fotografía y vídeo de bodas y eventos en {site.legalCity}, con la mirada de un editorial de moda.</p>
      </div>
    </section>
  );
}
