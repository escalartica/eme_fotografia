'use client';
import { useId, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './CtaContacto.module.css';

// Circular rotating-text badge, replacing the previous filled rectangular
// button (this project's own design audit named it "the worst offender" of
// the no-filled-buttons rule -- see the v3 plan's Task 11) -- adopted from
// a real reference site the client shared (danieleandmarilia.com), where
// this exact "BOOK NOW" badge is the site's only CTA and never a filled
// button either. Rotation is transform-only (a single CSS @keyframes
// rotate) and fully disabled under reduced motion, matching every other
// animation in this codebase.
// Magnetic pull, capped at this many px in any direction -- kept small and
// discreet ("magnetic interactions únicamente donde aporten" per the brief)
// so the badge visibly leans toward the cursor without ever detaching from
// its actual click position by more than a few px.
const MAGNETIC_RANGE = 14;

export function CtaContacto() {
  const pathId = useId();
  const reducedMotion = useReducedMotion();
  const badgeRef = useRef<HTMLAnchorElement>(null);
  const quickToRef = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  useEffect(() => {
    // Fine-pointer gate mirrors Hero.tsx's own cursor-reactive effect --
    // magnetic pull is a mouse-hover concept with no touch equivalent, so
    // it's skipped (not just visually inert) for touch/coarse-pointer
    // devices, same reasoning as the custom cursor itself.
    if (reducedMotion || !badgeRef.current || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    quickToRef.current = {
      x: gsap.quickTo(badgeRef.current, 'x', { duration: 0.4, ease: 'power3.out' }),
      y: gsap.quickTo(badgeRef.current, 'y', { duration: 0.4, ease: 'power3.out' }),
    };
  }, [reducedMotion]);

  function handleMouseMove(e: ReactMouseEvent<HTMLAnchorElement>) {
    if (!quickToRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    quickToRef.current.x((relX / (rect.width / 2)) * MAGNETIC_RANGE);
    quickToRef.current.y((relY / (rect.height / 2)) * MAGNETIC_RANGE);
  }

  function handleMouseLeave() {
    quickToRef.current?.x(0);
    quickToRef.current?.y(0);
  }

  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      {/* Mixed-style headline (regular + italic on one word) -- an
          editorial typographic device, not any one reference site's
          brand identity (found while researching bellephoto.com.au's
          dynamism/typography at the user's request, applied here as a
          generic technique). Needs Fraunces' real italic cut, not a
          synthesized oblique slant -- see app/layout.tsx's font config. */}
      <h2 id="cta-heading">
        ¿Celebras algo <em className={styles.emphasis}>importante</em>?
      </h2>
      <p>Cuéntanos tu fecha y hagamos que se recuerde.</p>
      <Link
        ref={badgeRef}
        href="/contacto"
        data-cursor="abrir"
        className={styles.badge}
        aria-label="Empezar un proyecto"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          viewBox="0 0 200 200"
          className={reducedMotion ? styles.badgeRing : `${styles.badgeRing} ${styles.badgeRingSpin}`}
          aria-hidden="true"
        >
          <defs>
            <path id={pathId} d="M 100,100 m -80,0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" />
          </defs>
          <text className={styles.badgeText}>
            <textPath href={`#${pathId}`}>
              EMPEZAR UN PROYECTO • EMPEZAR UN PROYECTO •{' '}
            </textPath>
          </text>
        </svg>
        <span className={styles.badgeArrow} aria-hidden="true">
          ↗
        </span>
      </Link>
    </section>
  );
}
