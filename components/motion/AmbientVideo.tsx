'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './AmbientVideo.module.css';

/**
 * UN VÍDEO QUE SE LIMITA A ESTAR AHÍ.
 * ---------------------------------------------------------------------
 * Para los sitios donde el vídeo es la ILUSTRACIÓN de otra cosa -- la
 * tarjeta de un servicio, por ejemplo -- y no la pieza que se viene a ver.
 * Se reproduce en bucle, sin sonido y sin mandos, y no captura ni el ratón
 * ni el tabulador: lo que se pulsa es el enlace que lo envuelve.
 *
 * Por qué no `VideoPreview`: aquel trae su propio botón de reproducir y su
 * propio `onClick` para abrir el visor. Metido dentro de un enlace, eso son
 * dos objetivos pulsables uno encima del otro y un botón anidado en un
 * enlace, que no es marcado válido.
 *
 * LAS TRES REGLAS:
 * 1. Solo se mueve cuando se ve. Un `IntersectionObserver` lo arranca al
 *    entrar en pantalla y lo para al salir: un bucle reproduciéndose fuera
 *    de cuadro gasta batería a cambio de nada.
 * 2. Con `prefers-reduced-motion` no se reproduce nunca. Se queda en su
 *    póster, que es un fotograma del propio vídeo -- o sea, la misma imagen
 *    que habría puesto ahí un diseñador, no un hueco.
 * 3. `muted` se pone A MANO además de en el JSX. El atributo de React solo
 *    no basta para que el navegador permita la reproducción automática (el
 *    mismo arreglo que ya lleva el vídeo de la portada).
 */
export function AmbientVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  /** Clase del módulo que le da forma en su sitio (proporción, recorte). */
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion) {
      el.pause();
      return;
    }
    el.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      // Decorativo: el enlace que lo envuelve ya tiene su nombre accesible,
      // y el vídeo no aporta información que no esté escrita al lado.
      aria-hidden="true"
      tabIndex={-1}
      className={`${styles.video}${className ? ` ${className}` : ''}`}
    />
  );
}
