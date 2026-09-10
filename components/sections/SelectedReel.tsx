'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resolveFeaturedFrames } from '@/content/featured';
import { projects } from '@/content/projects';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { focusOf } from '@/lib/focal';
import styles from './SelectedReel.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Ten beats, one wedding each -- none of them repeated from the hero mosaic.
const frames = resolveFeaturedFrames();

/**
 * Selected work as a single vertical reel (Agentura's "case study"
 * section): one centred column of frames -- portrait, landscape, square,
 * alternating -- while two slim text columns stay pinned at the sides.
 * Every frame settles in from a slight zoom and blur as it reaches the
 * viewport, drifts a little slower than the page (parallax), and lifts on
 * hover. Each is a link to its wedding.
 */
export function SelectedReel() {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !rootRef.current) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(`.${styles.frame}`);
      items.forEach((item, i) => {
        const media = item.querySelector(`.${styles.media}`);
        // No blur. A 10px blur on a full-bleed photograph is a compositing
        // pass over a large surface, every frame, for an effect that reads
        // as the image having failed to load rather than as craft. The
        // scale settle alone is the entrance.
        gsap.fromTo(
          item,
          { opacity: 0, scale: 0.94 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 88%', once: true },
          }
        );
        // Gentle drift, always starting with the layer shifted down so the
        // top of the frame (the faces) is what enters first; the amount
        // alternates so neighbouring frames still separate as they pass.
        gsap.fromTo(
          media,
          { yPercent: i % 2 ? 2.5 : 1.5 },
          {
            yPercent: i % 2 ? -2.5 : -1.5,
            ease: 'none',
            scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={rootRef} className={styles.section} aria-labelledby="selected-work-heading">
      <div className={styles.side}>
        <div className={styles.sideInner}>
          <p className={styles.eyebrow}>Trabajos seleccionados</p>
          {/* "Una colección de días irrepetibles" no decía nada que no
              dijera cualquier web de bodas, y además repetía la idea que ya
              abre /sobre-nosotros ("Un concierto no se repite. Vuestra boda
              tampoco"). Esto cuenta lo que se ve debajo: una foto por boda y
              diez bodas que no se parecen (content/featured.ts). */}
          <h2 id="selected-work-heading" className={styles.statement}>
            {frames.length} bodas, <em>ninguna igual.</em>
          </h2>
          <Link href="/trabajos" className={styles.arrow}>
            Ver todos los reportajes
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <ol className={styles.reel}>
        {frames.map((frame, i) => {
          // Portrait sources stay portrait; landscape ones alternate between
          // a 4:3 frame and a square crop so the column keeps changing shape.
          const shape = frame.width > frame.height ? (i % 3 === 2 ? 'square' : 'landscape') : 'portrait';
          return (
            <li key={frame.src} className={`${styles.frame} ${styles[shape]}`}>
              <Link href={`/trabajos/${frame.project.slug}`} className={styles.link}>
                <span className={styles.clip}>
                  <span className={styles.media}>
                    <Image
                      src={frame.src}
                      alt={frame.alt}
                      fill
                      sizes="(max-width: 900px) 86vw, 34vw"
                      className={styles.image}
                      style={focusOf(frame.src, frame.focus)}
                    />
                  </span>
                </span>
                <span className={styles.caption}>
                  <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.title}>{frame.project.title}</span>
                  <span className={styles.meta}>
                    {frame.project.location}, {frame.project.year}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className={`${styles.side} ${styles.sideRight}`} aria-hidden="true">
        <div className={styles.sideInner}>
          {/* La línea anterior ("Fotografía que habla antes de que la
              leas") tuteaba en medio de una web escrita en vosotros y no
              afirmaba nada. Esta cuenta lo que hay al otro lado del enlace,
              con la cifra calculada y no escrita a mano. */}
          <p className={styles.note}>Hay {projects.length - frames.length} bodas más en Trabajos.</p>
          <p className={`${styles.note} ${styles.noteBottom}`}>
            Primero la imagen. Siempre la historia. Nada hecho sin una razón.
          </p>
        </div>
      </div>
    </section>
  );
}
