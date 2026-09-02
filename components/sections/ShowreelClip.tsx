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
export function ShowreelClip({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !videoRef.current) return;
    const el = videoRef.current;
    el.muted = true;
    el.play().catch(() => {});
  }, [reducedMotion]);

  return (
    <div className={styles.wrap}>
      <video ref={videoRef} src={src} poster={poster} muted loop playsInline preload="none" aria-label={alt} className={styles.video} />
    </div>
  );
}
