'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import type { ProjectMedia } from '@/content/types';
import styles from './VideoPreview.module.css';

export function VideoPreview({ media, onOpenFull }: { media: ProjectMedia; onOpenFull: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !videoRef.current) return;
    const el = videoRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div className={styles.wrapper} data-cursor="reproducir" onClick={onOpenFull}>
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
      <button
        type="button"
        className={styles.playButton}
        onClick={(e) => {
          e.stopPropagation();
          onOpenFull();
        }}
        aria-label="Reproducir vídeo"
      >
        Reproducir
      </button>
    </div>
  );
}
