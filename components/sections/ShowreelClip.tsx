'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './ShowreelClip.module.css';

/**
 * A simple, self-contained looping background clip -- not a gallery item
 * (no lightbox, no click-to-expand, unlike VideoPreview.tsx), for a single
 * supporting B-roll moment on a page. Mirrors Hero.tsx's own autoplay
 * wiring (imperative `muted = true` before `.play()`, since the JSX
 * `muted` prop alone is unreliable for autoplay purposes) and its
 * reduced-motion gate: under `prefers-reduced-motion`, `.play()` is never
 * called and the poster frame is the entire, fully-static experience.
 */
export function ShowreelClip({ src, poster, alt, fill = false }: { src: string; poster: string; alt: string; fill?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !videoRef.current) return;
    const el = videoRef.current;
    el.muted = true;
    // `play()` returns a Promise in every current browser, but not in every
    // environment: jsdom returns undefined, and so did Safari before 10.
    // Calling .catch() on undefined threw at mount, which took down the
    // whole /servicios page the moment a service gained a preview video.
    void el.play()?.catch(() => {});
  }, [reducedMotion]);

  return (
    <div className={`${styles.wrap} ${fill ? styles.fill : ''}`}>
      <video ref={videoRef} src={src} poster={poster} muted loop playsInline preload="none" aria-label={alt} className={styles.video} />
    </div>
  );
}
