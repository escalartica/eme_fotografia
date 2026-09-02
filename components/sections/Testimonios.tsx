'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { testimonials } from '@/content/testimonials';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Testimonios.module.css';

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
      <h2 id="testimonios-heading">Lo que dicen de nosotros</h2>
      <div className={styles.stage}>
        {testimonials.map((t, i) => {
          const isActive = i === activeIndex;
          return (
            <blockquote
              key={t.id}
              className={isActive ? styles.quote : `${styles.quote} ${styles.visuallyHidden}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className={styles.glyphOpen} aria-hidden="true">“</span>
              <p className={styles.quoteText}>{t.quote}</p>
              <span className={styles.glyphClose} aria-hidden="true">”</span>
              <cite className={styles.cite}>{t.author} — {t.role}</cite>
            </blockquote>
          );
        })}
      </div>
      <div className={styles.controls}>
        <button type="button" onClick={goPrev} aria-label="Testimonio anterior">
          Anterior
        </button>
        <button type="button" onClick={goNext} aria-label="Testimonio siguiente">
          Siguiente
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
          >
            {isPaused ? 'Reanudar' : 'Pausar'}
          </button>
        )}
      </div>
      {/* Real trust badge: a genuine Bodas.net Wedding Awards 2025
          certificate (5 stars), frame-extracted from a video the client
          supplied and cropped to remove pillarboxing -- not a mockup or a
          generic stock "verified" graphic. Small, real intrinsic
          dimensions (no next/image `fill`, this isn't a full-bleed
          moment), sitting quietly under the quote controls rather than
          competing with them for attention. */}
      <Image
        src="/images/trust/bodas-net-wedding-awards-2025.webp"
        alt="Distintivo Bodas.net Wedding Awards 2025: EME Fotografía Sevilla, 5 estrellas"
        width={900}
        height={696}
        sizes="(max-width: 700px) 60vw, 220px"
        className={styles.trustBadge}
      />
    </section>
  );
}
