'use client';
import { useId } from 'react';
import Link from 'next/link';
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
export function CtaContacto() {
  const pathId = useId();
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <h2 id="cta-heading">¿Celebras algo importante?</h2>
      <p>Cuéntanos tu fecha y hagamos que se recuerde.</p>
      <Link href="/contacto" data-cursor="abrir" className={styles.badge} aria-label="Empezar un proyecto">
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
