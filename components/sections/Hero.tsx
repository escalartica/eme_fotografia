'use client';
import { useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
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
  // Tracks whether the intro-timer effect below has *finished deciding* the
  // intro's fate (skipped outright on a repeat visit, skipped under reduced
  // motion, or played and timed out) — distinct from `showIntro` itself,
  // which starts `false` on the very first render for every visitor
  // (including first-time ones, before this effect has had a chance to flip
  // it to `true`). The wordmark-reveal effect further down needs to tell
  // "no intro is coming" apart from "intro hasn't been decided yet", since
  // both look identical as `showIntro === false` on that first render — this
  // flag is what makes that distinction possible.
  const [introResolved, setIntroResolved] = useState(false);
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(INTRO_KEY) === 'true';
    if (alreadyShown) {
      setIntroResolved(true);
      return;
    }
    if (reducedMotion) {
      // No flash-screen under reduced motion — mark it shown and skip straight to content.
      // Also clear any intro state a prior stale run of this effect may have set: on
      // mount, useReducedMotion() starts `false` and flips to `true` asynchronously in
      // its own effect, so this effect can run once with the stale `false` value
      // (scheduling the intro) before re-running here with the corrected `true` value.
      // Without this, showIntro would stay stuck `true` with no timer left to clear it.
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
      setIntroResolved(true);
      return;
    }
    setShowIntro(true);
    const timer = setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
      setIntroResolved(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // Progressive wordmark reveal: once the intro overlay is fully resolved
  // (either it never showed, or it just finished), stagger the two wordmark
  // lines in with a GSAP timeline (transform/opacity only). Gating on
  // `introResolved` (not just mount) means first-time visitors never see the
  // reveal wasted behind the opaque intro overlay, and `showIntro` in the
  // dependency array means it re-checks the moment the overlay actually
  // unmounts. Gated behind `!reducedMotion` like every other motion effect
  // in this file — under reduced motion the lines simply render in their
  // final, fully visible state (no `gsap.set` "from" state is ever applied).
  useEffect(() => {
    if (reducedMotion || !introResolved || showIntro || !wordmarkRef.current) return;
    const lines = Array.from(wordmarkRef.current.children) as HTMLElement[];
    const ctx = gsap.context(() => {
      gsap.timeline().fromTo(
        lines,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: motion.duration.base,
          stagger: 0.12,
          ease: motion.ease.standard,
        }
      );
    }, wordmarkRef);
    return () => ctx.revert();
  }, [reducedMotion, introResolved, showIntro]);

  // Cursor-reactive depth (desktop only, very contained): nudge the video
  // layer a few px opposite the pointer as it moves within the Hero, on top
  // of (not instead of) the scroll-driven `yPercent` parallax above — GSAP
  // composes `x`/`y` and `yPercent` on the same element into one transform,
  // so both can drive the same node simultaneously without fighting.
  // `gsap.quickTo` is used instead of `gsap.to` per pointermove because it's
  // a cheap, pre-built interpolator (no new tween object allocated per
  // event) and it never touches React state, so there's no re-render cost.
  // Gated behind `!reducedMotion` AND a real `matchMedia('(hover: hover) and
  // (pointer: fine)')` check, not just `!reducedMotion` alone: `pointermove`
  // does fire on touch devices during a drag/scroll gesture, so the hover +
  // fine-pointer check is what actually excludes touch-only visitors, sparing
  // them a listener they'd never meaningfully trigger.
  useEffect(() => {
    if (reducedMotion || !heroRef.current || !imageRef.current) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const hero = heroRef.current;
    const image = imageRef.current;
    // Peak-to-peak travel is capped at DEPTH_RANGE px total (i.e. +/- half
    // that on each axis) — "parallax muy contenido", a few pixels, never a
    // distracting swim.
    const DEPTH_RANGE = 12;
    const xTo = gsap.quickTo(image, 'x', { duration: 0.6, ease: motion.ease.standard });
    const yTo = gsap.quickTo(image, 'y', { duration: 0.6, ease: motion.ease.standard });

    const handlePointerMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      // -0.5..0.5 across each axis, inverted so the video drifts opposite
      // the cursor (a subtle "looking past the frame" depth cue).
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      xTo(relX * -DEPTH_RANGE);
      yTo(relY * -DEPTH_RANGE);
    };

    hero.addEventListener('pointermove', handlePointerMove);
    return () => {
      hero.removeEventListener('pointermove', handlePointerMove);
      gsap.set(image, { x: 0, y: 0 });
    };
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
        {/* City + service-area statement lives INSIDE the H1 (not a sibling
            <p>) so it carries real SEO weight as the page's single most
            prominent heading, not a de-emphasized subtitle — matching this
            session's Patrones-Awwwards audit (A2). The service-area phrase
            ("Andalucía y donde haga falta") isn't a new claim: it compresses
            the already-approved FAQ answer ("Sí, cubrimos bodas y eventos
            fuera de Sevilla... según distancia", content/faq.ts) rather than
            inventing a new one. It's a <span>, not a <p> -- <p> isn't valid
            phrasing content inside <h1> -- and shares the wordmark reveal
            timeline below (Array.from(wordmarkRef.current.children)) as its
            first staggered line. */}
        <h1 ref={wordmarkRef} className={styles.wordmark}>
          <span className={styles.eyebrow}>
            Fotografía y vídeo de bodas y eventos en {site.legalCity}, Andalucía y donde haga falta, con la mirada de un editorial de moda.
          </span>
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
