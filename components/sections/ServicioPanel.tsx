'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Service } from '@/content/types';
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
  const shortName = service.name.replace(/^Fotografía de /i, '');

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
              priority={index === 0}
            />
          )
        )}
        <div className={styles.scrim} />
      </div>

      <div className={styles.strip}>
        <div className={styles.left}>
          <span className={styles.number}>{number}</span>
          <p className={styles.promise}>{service.tagline}</p>
        </div>
        <div className={styles.right}>
          <span className={styles.label}>{index === 0 ? 'Fotografía' : 'Vídeo'} · Bodas</span>
          <h2 id={`servicio-${service.slug}-heading`} className={styles.name}>
            {service.name}
          </h2>
          {/* WCAG 2.5.3 (el nombre contiene la etiqueta). El aria-label decía
              "Ver el servicio de vídeo de boda" mientras en pantalla ponía
              "Ver servicio": quien maneja el sitio por voz dicta lo que LEE,
              y "pulsa Ver servicio" no casaba con ningún nombre accesible.
              El desambiguador (hay dos paneles idénticos en la home) va ahora
              en el propio texto del enlace, oculto solo a la vista, así que el
              nombre accesible empieza literalmente por lo que se ve. */}
          <Link href={service.route} className={styles.arrow}>
            Ver servicio
            <span className="sr-only"> de {shortName.toLowerCase()}</span>
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
