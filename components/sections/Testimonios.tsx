'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { testimonials } from '@/content/testimonials';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ExternalLinkIcon } from '@/components/ui/Icon';
import styles from './Testimonios.module.css';
import { RevealWords } from '@/components/motion/RevealWords';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AUTO_ADVANCE_MS = 6000;

// Oversized editorial pull-quote, cycling between the 4 real Bodas.net
// reviews. All 4 stay in the DOM at all times -- the 3 not currently
// "active" are moved off-screen with the classic clip-rect visually-hidden
// technique (styles.visuallyHidden), never `display:none`/`aria-hidden`, so
// a screen reader browsing the section linearly still reaches every review
// regardless of which one auto-advance or the manual controls currently
// have visible. The active one carries `aria-current="true"`.
//
// Auto-advance uses a self-resetting setTimeout (not setInterval) keyed on
// activeIndex, so a manual prev/next click naturally restarts the countdown
// instead of racing an in-flight interval tick. Under
// prefers-reduced-motion it's skipped entirely -- this project's hard rule
// (see useReducedMotion) is that nothing auto-advances for a
// reduced-motion user; the manual controls stay live either way, so
// reduced-motion degrades to a fully manual-only cycle rather than a static
// single testimonial losing the other 3 to interaction.
//
// Before this pass the whole section had no scroll-in entrance at all --
// visitors who scrolled straight to it just found it already fully
// rendered, the one static-feeling stop between Manifiesto's line-by-line
// SplitText reveal above and CtaContacto's own reveal below. The heading
// and trust-badge row below use the shared `ScrollReveal` component
// directly (each its own top-level instance, never nested inside another
// -- this project's documented nested-ScrollReveal bug). The carousel
// stage + its controls are handled by a dedicated effect in THIS file
// instead: `.stage` has its own `width: 100%` and is read by the
// crossfade effect above via `stageRef`, and `ScrollReveal` doesn't
// forward an external ref onto the div it renders -- wrapping `.stage` in
// it would mean either losing `stageRef` or adding an extra unstyled div
// whose default sizing could disagree with `.stage`'s own `width: 100%`
// inside this section's `justify-items: center` grid. Animating
// `stageRef.current`/`controlsRef.current` directly with the SAME shared
// tokens (`motion.duration.slow`, `motion.ease.standard`, the same `top
// 92%` trigger point) reads identically to a ScrollReveal without
// touching either element's own layout box.
export function Testimonios() {
  const [activeIndex, setActiveIndex] = useState(0);
  // WCAG 2.2.2 (Pause, Stop, Hide, Level A) requires a mechanism to pause
  // auto-updating content that starts automatically and lasts more than 5s
  // -- reduced-motion is a real, valuable accommodation but is a different
  // criterion for a different user population, not a substitute for this
  // one (final whole-branch review, finding I3). The prev/next buttons
  // don't satisfy it either: they only move `activeIndex`, which restarts
  // the timer via this effect's own dependency rather than stopping it.
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  // Scroll-in entrance for the carousel as a whole (stage + controls
  // together, one tween, one ScrollTrigger keyed off the stage). Opacity +
  // a slightly larger translateY than ScrollReveal's own default (28 vs
  // 24) -- the carousel is a taller, heavier block than a single line of
  // copy, and reads better arriving from a touch further down. Runs once
  // on mount; unrelated to the crossfade effect below, which re-fires on
  // every `activeIndex` change and only ever touches the ACTIVE
  // blockquote, never `stageRef`/`controlsRef` themselves.
  useEffect(() => {
    if (reducedMotion || !stageRef.current || !controlsRef.current) return;
    const targets = [stageRef.current, controlsRef.current];
    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 28 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: motion.duration.slow,
        stagger: 0.08,
        ease: motion.ease.standard,
        scrollTrigger: { trigger: stageRef.current, start: 'top 92%' },
      });
    }, stageRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  // Cross-fade on change. Motivated as a state transition: without it the
  // quote is replaced between two frames and the reader cannot tell
  // whether the text changed or the page jumped. Transform and opacity
  // only, and skipped entirely under reduced motion, where the swap is
  // instant and the controls are the whole experience.
  useEffect(() => {
    if (reducedMotion || !stageRef.current) return;
    const active = stageRef.current.querySelector('[aria-current="true"]');
    if (!active) return;
    const tween = gsap.fromTo(
      active,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: motion.duration.base, ease: motion.ease.standard }
    );
    return () => {
      tween.kill();
    };
  }, [activeIndex, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || isPaused) return;
    const id = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % testimonials.length);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [reducedMotion, isPaused, activeIndex]);

  function goPrev() {
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }

  function goNext() {
    setActiveIndex((i) => (i + 1) % testimonials.length);
  }

  return (
    <section aria-labelledby="testimonios-heading" className={styles.section}>
      <ScrollReveal>
        <h2 id="testimonios-heading">
          <RevealWords
            segments={[{ text: 'Lo que dicen', em: true }, { text: ' de nosotros' }]}
            emClassName={styles.emphasis}
          />
        </h2>
      </ScrollReveal>
      <div ref={stageRef} className={styles.stage}>
        {testimonials.map((t, i) => {
          const isActive = i === activeIndex;
          return (
            <blockquote
              key={t.id}
              className={isActive ? styles.quote : `${styles.quote} ${styles.visuallyHidden}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* The quote marks are part of the sentence now, hanging into
                  the left margin, rather than two oversized grey glyphs
                  floating above and below it. Real typographic quotes, not
                  ASCII. */}
              <p className={styles.quoteText}>{`\u201C${t.quote}\u201D`}</p>
              <cite className={styles.cite}>
                <span className={styles.citeName}>{t.author}</span>
                <span className={styles.citeRole}>{t.role}</span>
              </cite>
            </blockquote>
          );
        })}
      </div>
      <div ref={controlsRef} className={styles.controls}>
        <button type="button" onClick={goPrev} aria-label="Testimonio anterior" className={styles.controlButton}>
          <span aria-hidden="true">&#8592;</span>
        </button>
        <p className={styles.counter}>
          <span aria-hidden="true">
            {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
        </p>
        <button type="button" onClick={goNext} aria-label="Testimonio siguiente" className={styles.controlButton}>
          <span aria-hidden="true">&#8594;</span>
        </button>
        {/* Only rendered when auto-advance can actually run -- under
            reduced motion there is nothing to pause, and the manual
            controls above are already the entire experience. */}
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? 'Reanudar testimonios' : 'Pausar testimonios'}
            aria-pressed={isPaused}
            className={styles.pauseButton}
          >
            {isPaused ? 'Reanudar' : 'Pausar'}
          </button>
        )}
      </div>
      {/* Real trust badges: genuine Bodas.net graphics, not mockups or a
          generic stock "verified" icon. The 2025 certificate (5 stars,
          personalised with the studio's name) was frame-extracted from a
          video the client supplied; the six year badges below were cropped
          from the client's own rate-sheet PDF at full resolution. Every
          intrinsic width/height here is the real measured size of its own
          file (this codebase's "reserve a box, don't guess" convention),
          not a shared placeholder. Sized by a fixed row height rather than
          width so seven real graphics at seven slightly different native
          ratios still read as one deliberate strip instead of a ragged
          row. */}
      {/* Real, live stats from the studio's own Bodas.net profile (see
          content/site.ts for the verification note) -- not baked into an
          image like the badges below, so it stays accurate as the real
          numbers grow. Links out to the profile itself so the claim is
          independently checkable, not just asserted. */}
      {/* La nota, las opiniones y el número de parejas son ya de Cifras,
          justo debajo del hero. Aquí eran la tercera vez en la misma página
          (hero, Cifras, esta línea, y otra vez el cierre de la Guía): repetir
          una prueba no la refuerza, la gasta. Lo que queda es el enlace al
          perfil, que es lo único que esta sección aportaba y Cifras no: la vía
          para comprobarlo por su cuenta. */}
      <ScrollReveal delay={0.1}>
        <p className={styles.statLine}>
          <a href={site.bodasNetUrl} target="_blank" rel="noopener noreferrer">
            Leer todas las opiniones
            <ExternalLinkIcon className={styles.externalIcon} size={12} />
            <span className={styles.visuallyHidden}> (se abre en una pestaña nueva)</span>
          </a>
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.15}>
        <div className={styles.trustRow}>
          <Image
            src="/images/trust/bodas-net-wedding-awards-2025.webp"
            alt="Distintivo Bodas.net Wedding Awards 2025: EME Fotografía Sevilla, 5 estrellas"
            width={900}
            height={696}
            sizes="90px"
            className={styles.trustBadge}
          />
          {[
            { src: 'wedding-awards-2023.webp', w: 631, h: 700, year: '2023' },
            { src: 'wedding-awards-2022.webp', w: 631, h: 700, year: '2022' },
            { src: 'bodas-net-recomendado.webp', w: 631, h: 700, year: null },
            { src: 'wedding-awards-2025-badge.webp', w: 616, h: 700, year: '2025' },
            { src: 'wedding-awards-2021.webp', w: 621, h: 700, year: '2021' },
            { src: 'wedding-awards-2019.webp', w: 623, h: 700, year: '2019' },
          ].map((badge) => (
            <Image
              key={badge.src}
              src={`/images/trust/${badge.src}`}
              alt={
                badge.year
                  ? `Distintivo Bodas.net Wedding Awards ${badge.year}`
                  : 'Distintivo Bodas.net: recomendado por 50 opiniones'
              }
              width={badge.w}
              height={badge.h}
              sizes="70px"
              className={styles.trustBadge}
            />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
