'use client';
import { useEffect, useState } from 'react';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Confianza.module.css';

function useCountUp(target: number, reducedMotion: boolean, durationMs = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reducedMotion) {
      // No count-up under reduced motion — jump straight to the final value,
      // mirroring the "no flash-screen intro, straight to content" pattern
      // used for Hero's reduced-motion path.
      setValue(target);
      return;
    }
    const steps = 30;
    const stepMs = durationMs / steps;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setValue(Math.round((current / steps) * target));
      if (current >= steps) clearInterval(id);
    }, stepMs);
    return () => clearInterval(id);
  }, [target, durationMs, reducedMotion]);
  return value;
}

export function Confianza() {
  const reducedMotion = useReducedMotion();
  const fb = useCountUp(site.facebookLikes, reducedMotion);
  const ig = useCountUp(site.instagramFollowers, reducedMotion);
  return (
    <section className={styles.section} aria-label="Confianza de la comunidad">
      <div>
        <span className={styles.number}>{fb}</span>
        <span>me gusta en Facebook</span>
      </div>
      <div>
        <span className={styles.number}>{ig}</span>
        <span>seguidores en Instagram</span>
      </div>
    </section>
  );
}
