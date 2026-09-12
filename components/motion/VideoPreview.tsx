'use client';
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import type { ProjectMedia } from '@/content/types';
import styles from './VideoPreview.module.css';

export function VideoPreview({ media, onOpenFull }: { media: ProjectMedia; onOpenFull: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !videoRef.current) return;
    const el = videoRef.current;
    // The `muted` JSX prop alone is unreliable for autoplay purposes (same
    // reasoning as Hero.tsx's identical fix) — set it imperatively so it's
    // guaranteed true before any .play() call this observer makes.
    el.muted = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      className={styles.wrapper}
      data-cursor="reproducir"
      onClick={onOpenFull}
      // C3 (docs/PATRONES-AWWWARDS.md): reserve the real aspect ratio up
      // front so the box doesn't jump once the video's own metadata loads
      // -- next/image's width/height props already do this for photos
      // elsewhere in this codebase, but a bare <video> has no equivalent
      // built-in protection. Falls back to the sibling image card's own
      // 3/2 default (SelectedWork.module.css's .imageWrap) when a media
      // item hasn't had its real dimensions measured yet.
      style={media.width && media.height ? ({ '--ar': `${media.width} / ${media.height}` } as CSSProperties) : undefined}
    >
      <video
        ref={videoRef}
        src={media.src}
        poster={media.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
      />
      {/* UN TRIÁNGULO, NO LA PALABRA. Esto era una píldora blanca maciza con
          «Reproducir» escrito, plantada en el centro exacto del cuadro: sobre
          una fotografía de boda tapa justo lo que hay que mirar, y encima
          decía lo mismo que el puntero ya estaba diciendo al lado. Dos veces
          el mismo mensaje, las dos encima del trabajo.
          Sigue siendo un botón de verdad -- con su `aria-label`, alcanzable
          con el tabulador y pulsable con el dedo --, porque el puntero
          personalizado no existe para quien navega con teclado ni en una
          pantalla táctil. Lo que cambia es que en escritorio se aparta: ver
          `.playGlyph` en el CSS. */}
      <button
        type="button"
        className={styles.playButton}
        onClick={(e) => {
          e.stopPropagation();
          onOpenFull();
        }}
        aria-label="Reproducir vídeo"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.playGlyph}>
          <path d="M9 6.5v11l9-5.5z" />
        </svg>
      </button>
    </div>
  );
}
