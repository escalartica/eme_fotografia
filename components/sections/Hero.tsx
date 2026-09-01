'use client';
import { useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
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
  // The video (5.5MB) is not the LCP element -- the poster image is, since
  // it's what actually paints first. fetchPriority="high" belongs here, not
  // on the <video>, which was the reviewer-caught inversion (a prior fix
  // for lost LCP priority accidentally prioritized the wrong asset).
  preload('/videos/posters/real-boda-01-full.webp', { as: 'image', fetchPriority: 'high' });
  const [showIntro, setShowIntro] = useState(false);
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Contained parallax on the hero background video: a very subtle
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

  // Imperative autoplay for the hero footage — mirrors VideoPreview.tsx's
  // pattern exactly: never rely on the native `autoPlay` attribute, drive
  // `.play()`/`.pause()` from an effect gated on reduced motion. With
  // reduced motion, `.play()` is never called and the `poster` frame is
  // shown instead. Unlike VideoPreview (a below-the-fold thumbnail gated
  // on IntersectionObserver visibility), the Hero is always visible on
  // load, so it plays on mount rather than waiting to scroll into view.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (reducedMotion) {
      el.pause();
      return;
    }
    el.play().catch(() => {});
  }, [reducedMotion]);

  return (
    <section ref={heroRef} className={styles.hero} data-hero-fullbleed>
      {showIntro && (
        <div data-testid="intro-sequence" className={styles.intro}>
          <span className={styles.introMark}>eme</span>
        </div>
      )}
      <div ref={imageRef} className={styles.imageParallax}>
        <video
          ref={videoRef}
          className={styles.video}
          src="/videos/previews/real-boda-01-full.mp4"
          poster="/videos/posters/real-boda-01-full.webp"
          muted
          loop
          playsInline
          // Reduced-motion users never call .play() (see the effect above) --
          // don't make them download 5.5MB of video they'll never see play.
          // 'metadata' still lets .play() work instantly for everyone else.
          preload={reducedMotion ? 'none' : 'metadata'}
          aria-label="Vídeo de la boda de Eva y Rafa: preparativos, salida y ceremonia"
        />
      </div>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.eyebrow}>
          Fotografía y vídeo de bodas y eventos en {site.legalCity}, con la mirada de un editorial de moda.
        </p>
        <h1 className={styles.wordmark}>
          <span className={styles.wordmarkLine}>EME</span>{' '}
          <span className={styles.wordmarkLine}>Fotografía {site.legalCity}</span>
        </h1>
      </div>
      <div className={styles.scrollIndicator} aria-hidden="true">
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
