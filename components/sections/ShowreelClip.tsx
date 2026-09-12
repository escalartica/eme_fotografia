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
    const arranca = () => void el.play()?.catch(() => {});

    // EL VÍDEO NO EMPIEZA HASTA QUE SE VE. Sin esto, `preload="none"` no
    // sirve de nada: llamar a `play()` al montar obliga al navegador a
    // descargar el clip entero aunque esté tres pantallas más abajo, y en
    // /servicios/video-de-boda eso son 18 MB que salen antes que nada de lo
    // que el visitante está mirando. Mismo patrón que AmbientVideo.
    if (typeof IntersectionObserver !== 'function') {
      arranca();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) arranca();
        else el.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div className={`${styles.wrap} ${fill ? styles.fill : ''}`}>
      <video ref={videoRef} src={src} poster={poster} muted loop playsInline preload="none" aria-label={alt} className={styles.video} />
    </div>
  );
}
