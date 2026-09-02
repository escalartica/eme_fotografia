'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Manifiesto.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const HEADING_TEXT = 'No contamos bodas. Contamos historias con fecha.';

export function Manifiesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const maskedRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  // The plan's one curated advanced scroll moment: as the section scrolls
  // into view, a masked-photo duplicate of the heading crossfades in over
  // the always-present solid-ink heading, reusing the same real drone
  // footage poster as the Hero (`real-boda-01-hero-drone.webp`) as a
  // recurring visual motif. Animates `opacity` only (background-clip: text is a
  // static CSS property on the element, not an animated one). Gated behind
  // reduced motion exactly like Hero.tsx's parallax effect: no ScrollTrigger
  // is ever created when reducedMotion is true, so the masked layer simply
  // never appears and the solid-ink heading is the entire experience.
  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !maskedRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(maskedRef.current, {
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'top 20%',
          scrub: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="manifiesto-heading">
      <span className={styles.chapterNumber} aria-hidden="true">
        01
      </span>
      <div className={styles.headingWrap}>
        <h2 id="manifiesto-heading" className={styles.headingBase}>
          {HEADING_TEXT}
        </h2>
        <span
          ref={maskedRef}
          className={styles.headingMasked}
          aria-hidden="true"
          data-testid="manifiesto-heading-masked"
        >
          {HEADING_TEXT}
        </span>
      </div>
      <p>
        Cada pareja llega con su propio ritmo, su propia luz, su propia gente alrededor.
        Nuestro trabajo es no interponernos: observar de cerca, con la mirada de un
        editorial de moda, y entregar algo que se sienta tan real dentro de diez años
        como el día que pasó.
      </p>
    </section>
  );
}
