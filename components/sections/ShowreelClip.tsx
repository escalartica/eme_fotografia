'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
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
 *
 * Y LLEVA UN BOTÓN PARA PARARLO, que es un requisito y no un adorno. WCAG
 * 2.2.2 (nivel A) pide un mecanismo para pausar cualquier cosa que se mueva
 * sola, dure más de cinco segundos y conviva con otro contenido. Estos clips
 * duran doce y veinticuatro segundos y viven en mitad de una página que se
 * está leyendo. `prefers-reduced-motion` no cubre ese criterio: lo tiene
 * puesto muy poca gente, y lo que se pide es un control en la página. El
 * botón sigue estando con `prefers-reduced-motion`, ahora para lo contrario:
 * es la única manera de ver el vídeo si uno quiere verlo.
 */
export function ShowreelClip({ src, poster, alt, fill = false }: { src: string; poster: string; alt: string; fill?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [enMarcha, setEnMarcha] = useState(false);
  /**
   * Si la persona lo para a mano, el observador NO puede volver a ponerlo en
   * marcha al pasar por delante otra vez. Un botón de pausa que se deshace
   * solo al hacer scroll no es un mecanismo para pausar: es una broma.
   */
  const paradoAMano = useRef(false);

  const arranca = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    // `play()` returns a Promise in every current browser, but not in every
    // environment: jsdom returns undefined, and so did Safari before 10.
    // Calling .catch() on undefined threw at mount, which took down the
    // whole /servicios page the moment a service gained a preview video.
    void el.play()?.catch(() => {});
  }, []);

  /**
   * El icono y la etiqueta salen de lo que hace el vídeo, no de lo que
   * nosotros creemos que hace: si el navegador lo para por su cuenta -- otra
   * pestaña, batería baja, el sistema operativo -- el botón tiene que decir
   * «Reproducir» y no seguir diciendo «Pausar».
   */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const alArrancar = () => setEnMarcha(true);
    const alParar = () => setEnMarcha(false);
    el.addEventListener('play', alArrancar);
    el.addEventListener('pause', alParar);
    return () => {
      el.removeEventListener('play', alArrancar);
      el.removeEventListener('pause', alParar);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || !videoRef.current) return;
    const el = videoRef.current;

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
        if (entry.isIntersecting) {
          if (!paradoAMano.current) arranca();
        } else {
          el.pause();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, arranca]);

  const alternar = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      paradoAMano.current = false;
      arranca();
    } else {
      paradoAMano.current = true;
      el.pause();
    }
  }, [arranca]);

  return (
    <div className={`${styles.wrap} ${fill ? styles.fill : ''}`}>
      <video ref={videoRef} src={src} poster={poster} muted loop playsInline preload="none" aria-label={alt} className={styles.video} />
      <button type="button" className={styles.control} onClick={alternar} aria-label={enMarcha ? 'Pausar el vídeo' : 'Reproducir el vídeo'}>
        {/* Dibujados y no escritos, como el resto de los iconos del sitio: un
            carácter de pausa o de reproducción sale como emoji a color en un
            iPhone, porque no está en ninguna de las dos tipografías. */}
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {enMarcha ? (
            <>
              <rect x="8" y="6" width="3" height="12" rx="0.6" />
              <rect x="13" y="6" width="3" height="12" rx="0.6" />
            </>
          ) : (
            <path d="M9 6.5v11l9-5.5z" />
          )}
        </svg>
      </button>
    </div>
  );
}
