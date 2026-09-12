'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Service } from '@/content/types';
import { RevealWords } from '@/components/motion/RevealWords';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { focusOf } from '@/lib/focal';
import styles from './ServicioPanel.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * One service as a full-screen card (Agentura's "Service 01/02/03"): a
 * full-bleed photograph or looping clip behind a single horizontal strip
 * of paper that carries the number, the promise, the label and the name.
 * Used inside StackedSections, so each panel pins and the next slides over
 * it. The background drifts slower than the page while the panel is on
 * screen.
 */
export function ServicioPanel({ service, index }: { service: Service; index: number }) {
  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  // The clip only downloads and plays while the panel is near the
  // viewport (it is a 17 MB trailer; autoplaying it off-screen would cost
  // every visitor the bytes for nothing).
  useEffect(() => {
    const v = videoRef.current;
    const root = rootRef.current;
    if (!v || !root) return;
    v.muted = true;
    if (reducedMotion) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload === 'none') v.preload = 'auto';
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: '40% 0px' }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !rootRef.current || !mediaRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mediaRef.current,
        // +-2.5%, not +-5%: the layer is scaled 1.06, which is 3% of
        // overscan on each edge. A 5% travel walks further than the
        // overscan covers and can expose a sliver of the panel behind the
        // photograph at the end of the scroll.
        { yPercent: 2.5, scale: 1.06 },
        {
          yPercent: -2.5,
          scale: 1.06,
          ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  const number = String(index + 1).padStart(2, '0');

  return (
    <section ref={rootRef} className={styles.panel} aria-labelledby={`servicio-${service.slug}-heading`}>
      <div ref={mediaRef} className={styles.media} aria-hidden="true">
        {service.previewVideo ? (
          <video
            ref={videoRef}
            className={styles.bg}
            src={service.previewVideo.src}
            poster={service.previewVideo.poster}
            muted
            loop
            playsInline
            preload="none"
          />
        ) : (
          (service.panelImage ?? service.previewImage) && (
            <Image
              src={(service.panelImage ?? service.previewImage) as string}
              alt=""
              fill
              sizes="100vw"
              className={styles.bg}
              style={focusOf(service.panelImage ?? service.previewImage)}
              /* SIN `priority`. La primera franja de servicio no está arriba:
                 por encima quedan el hero, el manifiesto, la marquesina y el
                 carrete -- cuatro pantallas largas. Marcarla prioritaria no
                 la adelantaba, le quitaba ancho de banda a la fotografía del
                 hero, que es la que decide el LCP de la portada. */
            />
          )
        )}
        <div className={styles.scrim} />
      </div>

      {/* LA FRANJA SE MONTA SOLA. Cada rótulo sube desde detrás de su propia
          ventana (`.mask`), escalonado, y termina de posarse justo cuando el
          panel se ancla. Antes la fotografía entraba en movimiento y toda la
          franja aparecía encima ya puesta, que es lo que hacía que la tarjeta
          se leyera como una plantilla con una foto detrás en vez de como una
          copia con su pie. Todo el gesto es CSS guiado por el scroll y con la
          doble puerta de siempre -- ver ServicioPanel.module.css. */}
      <div className={styles.strip}>
        <div className={styles.left}>
          <span className={styles.mask}>
            <span className={styles.number}>{number}</span>
          </span>
          {/* La ventana es un <div> y no un <span> porque lo que envuelve es
              un <p>, y un párrafo dentro de contenido de frase no es HTML
              válido. */}
          <div className={styles.mask}>
            <p className={styles.promise}>{service.tagline}</p>
          </div>
        </div>
        <div className={styles.right}>
          <span className={styles.mask}>
            <span className={styles.label}>{index === 0 ? 'Fotografía' : 'Vídeo'} · Bodas</span>
          </span>
          {/* El nombre del servicio, palabra a palabra, con el mismo revelado
              del manifiesto y del cierre (components/motion/RevealWords). Es
              el segundo tipo más grande de la home y era el único enunciado
              de la página que llegaba ya montado: el panel entraba con toda
              su fotografía en movimiento y el titular, quieto encima.
              Aquí el tramo de entrada del titular termina justo cuando el
              panel se ancla, así que las palabras acaban de montarse en el
              mismo momento en que la tarjeta se detiene. Ese encaje depende
              de que ningún antepasado sea un contenedor de scroll -- ver la
              nota sobre `overflow: clip` en ServicioPanel.module.css y en
              StackedSections.module.css. */}
          <h2 id={`servicio-${service.slug}-heading`} className={styles.name}>
            <RevealWords segments={[{ text: service.name }]} />
          </h2>
          {/* WCAG 2.5.3: el nombre accesible es exactamente lo que se lee en
              pantalla. Antes ponía "Ver servicio" con un añadido oculto para
              distinguir los dos paneles; ahora cada uno lleva su etiqueta
              propia ("Ver reportaje fotográfico" / "Ver película de boda"),
              que los distingue sin texto invisible y además dice a dónde va. */}
          <Link href={service.route} className={styles.arrow}>
            {service.panelCtaLabel}
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
