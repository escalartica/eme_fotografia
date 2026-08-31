'use client';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Confianza.module.css';

function useCountUp(target: number, active: boolean, reducedMotion: boolean, durationMs = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reducedMotion) {
      // No count-up under reduced motion — jump straight to the final value,
      // mirroring the "no flash-screen intro, straight to content" pattern
      // used for Hero's reduced-motion path.
      setValue(target);
      return;
    }
    if (!active) return;
    const steps = 30;
    const stepMs = durationMs / steps;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setValue(Math.round((current / steps) * target));
      if (current >= steps) clearInterval(id);
    }, stepMs);
    return () => clearInterval(id);
  }, [target, active, reducedMotion, durationMs]);
  return value;
}

export function Confianza() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || visible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.4 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [reducedMotion, visible]);

  const fb = useCountUp(site.facebookLikes, visible, reducedMotion);
  const ig = useCountUp(site.instagramFollowers, visible, reducedMotion);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Confianza de la comunidad">
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
