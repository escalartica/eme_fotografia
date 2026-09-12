'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { createFocusTrap } from 'focus-trap';
import { gsap } from 'gsap';
import { site } from '@/content/site';
import styles from './CinematicIntro.module.css';

/**
 * Opening title sequence, first visit of a session only (Hero decides).
 *
 * A letterboxed screen: two real frames cut one after the other, each
 * drifting slowly (a Ken Burns push) under a slate line, then the mark
 * rises out of the dark and the bars open -- top bar up, bottom bar down
 * -- to hand the eye to the masthead underneath. A "Saltar" button and
 * Escape both jump to the reveal. Never shown under
 * prefers-reduced-motion (Hero short-circuits).
 *
 * TIMING IS A BUDGET, NOT TASTE. This sequence used to run 4.6s with the
 * bars opening at 3.7s, and Hero.tsx gates the masthead reveal behind it,
 * so every first-time visitor waited past four seconds before the site
 * said anything. That is roughly double a "poor" Largest Contentful Paint
 * and it is self-inflicted: a title sequence that outstays the patience
 * of the person it is introducing costs more visitors than it impresses.
 * It now runs 2.2s with the bars opening at 1.5s -- long enough to read as
 * deliberate, short enough that nobody decides to leave during it.
 *
 * It is also a modal: it covers the whole page, so it takes focus, marks
 * the page behind it inert, and announces itself. Previously it was
 * role="presentation" over live, tabbable content nobody could see.
 */
/**
 * DOS FOTOGRAFÍAS APAISADAS, Y GRANDES. Antes eran dos portadas verticales de
 * 1333x2000: `object-fit: cover` a pantalla completa se queda con una franja
 * central de unos 900 px de ancho y la estira a todo lo ancho del monitor, así
 * que lo primero que veía un visitante nuevo era la única imagen del sitio
 * ampliada casi al triple. Estas dos son 2560x1707 reexportadas del original
 * de cámara, y en apaisado el recorte apenas quita nada.
 *
 * NINGUNA DE LAS DOS BODAS APARECE DEBAJO, y esta vez de verdad. La primera
 * que hubo aquí era un blanco y negro de la novia de espaldas junto a un
 * coche, que no abre nada. Las que la sustituyeron salían en el mosaico que
 * aparece justo al levantarse el telón. Y la que había en el segundo hueco
 * hasta ahora --la novia sobre el puente con la Torre del Oro-- seguía
 * teniendo medio problema: no era el mismo fichero que el mosaico, pero sí la
 * misma boda que su segunda columna, así que la pareja salía dos veces en
 * tres segundos. Ni Francisco Manuel ni Soledad y Alejandro están en el
 * mosaico (content/mosaic.ts) ni en el carrete (content/featured.ts).
 *
 * Y EL SEGUNDO PLANO YA NO ES UN PAISAJE, ES UN MOMENTO. La foto del puente
 * era correcta y no pasaba nada en ella: cielo plano, la novia pequeña y la
 * Torre del Oro en la bruma, o sea una postal de Sevilla usada como fondo.
 * Una secuencia de apertura de dos segundos y medio no puede gastar la mitad
 * en una postal. La que la sustituye es la salida de la iglesia bajo la
 * lluvia de arroz, con los invitados cerrando el encuadre por los dos lados:
 * es la fotografía con más movimiento del archivo publicado.
 *
 * Y LAS DOS JUNTAS CUENTAN ALGO. «La llegada» y «La salida» son el principio
 * y el final del mismo día, que es exactamente lo que este estudio dice que
 * hace. Los rótulos ya no nombran un sitio: nombran dos momentos, como los
 * intertítulos de una película.
 */
const FRAMES = [
  { src: '/images/trabajos/maria-y-francisco-manuel/llegada.webp', slate: 'La llegada' },
  { src: '/images/trabajos/soledad-y-alejandro/09.webp', slate: 'La salida' },
];

export function CinematicIntro({ onComplete, onReveal }: { onComplete: () => void; onReveal?: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const doneRef = useRef(false);
  const revealedRef = useRef(false);
  // La secuencia dura lo mismo pero AVISA ANTES. `onReveal` se dispara en el
  // instante en que las barras empiezan a abrirse, no cuando la pantalla ya
  // se ha ido: el masthead de detrás empieza a montarse mientras el telón
  // sube, así que las dos animaciones se encadenan en vez de ir una detrás de
  // otra con una pausa en medio. Sin esto, un visitante nuevo veía 2,2 s de
  // secuencia, luego papel quieto, y sólo entonces el nombre del estudio
  // escribiéndose: tres tiempos donde tiene que haber uno.
  // El aviso tiene que llegar UNA sola vez: una timeline de GSAP puede pasar
  // por el mismo punto más de una vez (el botón "Saltar" rebobina el
  // playhead), y `finish` lo repite como red de seguridad. De eso se encarga
  // `revealedRef`.

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      // Red de seguridad: si por lo que sea la llamada del fotograma 1,5 no
      // llegó, el aviso sale igualmente aquí. `reveal` es idempotente.
      reveal();
      onComplete();
    };

    const reveal = () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      onReveal?.();
    };

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: finish });
    tlRef.current = tl;
    const frames = q<HTMLElement>(`.${styles.frame}`);
    const slates = q<HTMLElement>(`.${styles.slate}`);

    tl.set(frames, { opacity: 0, scale: 1.12 })
      .set(q(`.${styles.mark}`), { opacity: 0, y: 24, filter: 'blur(12px)' })
      .set(q(`.${styles.line}`), { opacity: 0, letterSpacing: '0.6em' })
      // Progress line runs for the whole sequence.
      .fromTo(q(`.${styles.progress}`), { scaleX: 0 }, { scaleX: 1, duration: 1.45, ease: 'none' }, 0);

    frames.forEach((frame, i) => {
      const at = 0.08 + i * 0.55;
      tl.to(frame, { opacity: 1, duration: 0.2, ease: 'power1.out' }, at)
        .to(frame, { scale: 1.03, duration: 0.75, ease: 'none' }, at)
        .fromTo(slates[i], { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.24 }, at + 0.04)
        .to(slates[i], { opacity: 0, duration: 0.16 }, at + 0.44);
      if (i < frames.length - 1) tl.to(frame, { opacity: 0, duration: 0.18, ease: 'power1.in' }, at + 0.48);
    });

    tl.to(frames[frames.length - 1], { opacity: 0.16, duration: 0.4 }, 1.05)
      .to(q(`.${styles.mark}`), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, 1.05)
      .to(q(`.${styles.line}`), { opacity: 1, letterSpacing: '0.32em', duration: 0.5 }, 1.18)
      // The bars open and the screen lifts.
      .to(q(`.${styles.barTop}`), { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, 1.5)
      .to(q(`.${styles.barBottom}`), { yPercent: 100, duration: 0.6, ease: 'expo.inOut' }, 1.5)
      .to(q(`.${styles.stage}`), { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, 1.55)
      .to(q(`.${styles.skip}`), { opacity: 0, duration: 0.25 }, 1.5)
      // En el mismo fotograma en que las barras se separan, no después.
      .call(reveal, [], 1.5);

    const skip = () => {
      if (doneRef.current) return;
      // Jump to the opening of the bars, keep the last beat so it never pops.
      tl.play(Math.max(tl.time(), 1.45));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', onKey);
    const skipButton = root.querySelector<HTMLButtonElement>(`.${styles.skip}`);
    skipButton?.addEventListener('click', skip);

    // While this covers the page, the page is not there: `inert` saca del
    // orden de tabulación y del árbol de accesibilidad lo que hay detrás,
    // para que nadie esté tabulando por una cabecera y un menú que no ve.
    //
    // EL FILTRO ESTABA AL REVÉS. Era `!root.contains(el)`, que excluye a los
    // DESCENDIENTES de este overlay, no a sus ANTEPASADOS -- y este overlay
    // vive dentro de <main> (Hero lo renderiza). Así que <main> entraba en la
    // lista y recibía `inert`, e `inert` alcanza a todo el subárbol: el
    // propio overlay quedaba inerte y con él su botón "Saltar", que dejaba de
    // poder pulsarse y de poder enfocarse. La secuencia solo se podía saltar
    // con Escape, y quien no lo sabe se comía los 2,2 s enteros con un botón
    // en pantalla que no hacía nada (WCAG 2.1.1). En jsdom no se nota porque
    // no implementa `inert`, por eso el test pasaba.
    //
    // `el.contains(root)` es cierto también cuando el = root, así que una
    // sola condición deja fuera tanto el overlay como sus antepasados.
    const siblings = Array.from(document.body.children).filter((el) => !el.contains(root));
    siblings.forEach((el) => el.setAttribute('inert', ''));

    // Y lo que <main> ya no puede inertizar lo cubre una trampa de foco, la
    // misma primitiva que MobileMenu y Lightbox: el Tab se queda dentro del
    // overlay en vez de irse al masthead que hay detrás, y al desactivarse
    // devuelve el foco a donde estaba (aquí, además, es quien lleva el foco
    // inicial al botón "Saltar"). `escapeDeactivates: false` porque Escape ya
    // lo maneja `onKey` de arriba, que es lo que salta la secuencia.
    const trap = createFocusTrap(root, {
      escapeDeactivates: false,
      clickOutsideDeactivates: false,
      initialFocus: () => skipButton ?? root,
      fallbackFocus: () => root,
      delayInitialFocus: false,
      delayReturnFocus: false,
    });
    trap.activate();

    return () => {
      window.removeEventListener('keydown', onKey);
      trap.deactivate();
      siblings.forEach((el) => el.removeAttribute('inert'));
      tl.kill();
    };
    // `onComplete` y `onReveal` llegan de Hero como `useCallback` sin
    // dependencias, así que son estables y este efecto no se remonta ni
    // rehace la timeline en cada render.
  }, [onComplete, onReveal]);

  return (
    <div
      ref={rootRef}
      data-testid="intro-sequence"
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-label="Secuencia de apertura. Pulsa Escape para saltarla."
    >
      <div className={styles.stage}>
        {FRAMES.map((f, i) => (
          <div key={f.src} className={styles.frame} aria-hidden="true">
            {/* 100vw, no "1440px": el marco es `inset: 0` sobre una pantalla
                completa, así que su ancho ES el del navegador. Declarar 1440
                le hacía pedir esa medida en un monitor de 1900 y quedarse
                corto justo donde más se nota. */}
            <Image src={f.src} alt="" fill sizes="100vw" priority={i === 0} className={styles.image} />
          </div>
        ))}
        <div className={styles.slates} aria-hidden="true">
          {FRAMES.map((f, i) => (
            <span key={f.src} className={styles.slate}>
              <span className={styles.slateIndex}>{String(i + 1).padStart(2, '0')}</span>
              {f.slate}
            </span>
          ))}
        </div>
        <div className={styles.center} aria-hidden="true">
          <span className={styles.mark}>eme</span>
          <span className={styles.line}>Fotografía y vídeo de bodas · {site.legalCity}</span>
        </div>
        <span className={styles.progress} aria-hidden="true" />
        <button type="button" className={styles.skip}>
          Saltar<span className="sr-only"> la secuencia de apertura</span>
        </button>
      </div>
      <div className={`${styles.bar} ${styles.barTop}`} aria-hidden="true" />
      <div className={`${styles.bar} ${styles.barBottom}`} aria-hidden="true" />
    </div>
  );
}
