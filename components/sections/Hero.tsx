'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
import { HeroMosaic } from './HeroMosaic';
import { CinematicIntro } from '@/components/motion/CinematicIntro';
import styles from './Hero.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const INTRO_KEY = 'eme-intro-shown';

/**
 * Masthead over a mosaic. The wordmark is set at full width on the paper
 * band; immediately beneath it, edge to edge, five staggered columns of
 * real weddings (HeroMosaic) pan under the cursor, rise at different rates
 * with the scroll and cycle through their photos -- the reference is
 * vivmgmt.com's home, rebuilt in this site's own type and palette.
 */
export function Hero() {
  const [showIntro, setShowIntro] = useState(false);
  // "Ya se puede empezar a montar la portada."
  //
  // Distingue "no va a haber secuencia de apertura" de "todavía no se ha
  // decidido si la hay": las dos cosas son `showIntro === false` en el primer
  // render, y el revelado del masthead no puede dispararse detrás de una
  // pantalla opaca que está a punto de aparecer.
  //
  // Y se enciende en el momento correcto, que NO es el final de la secuencia
  // de apertura. Ésta avisa dos veces: cuando las barras empiezan a separarse
  // (`onReveal`, fotograma 1,5) y cuando la pantalla ya se ha ido del todo
  // (`onComplete`, 2,25). El masthead y el mosaico arrancan con el PRIMER
  // aviso, así que el nombre del estudio se está escribiendo mientras el
  // telón sube: una sola coreografía encadenada en lugar de secuencia, pausa
  // en blanco, y otra animación. Cuando no hay secuencia -- visita repetida
  // dentro de la misma sesión, o movimiento reducido -- los dos avisos
  // coinciden y esto es simplemente "ya".
  const [revealReady, setRevealReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const asideRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(INTRO_KEY) === 'true';
    if (alreadyShown) {
      // sessionStorage does not exist on the server. Reading it during
      // render would make the server and the client disagree about whether
      // the intro plays, and React would throw a hydration mismatch on the
      // hero of every page. After mount is the only safe moment.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevealReady(true);
      return;
    }
    if (reducedMotion) {
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
      setRevealReady(true);
      return;
    }
    setShowIntro(true);
  }, [reducedMotion]);

  // Called by CinematicIntro once its bars have opened and the screen has
  // lifted; the wordmark reveal below waits for this.
  const finishIntro = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem(INTRO_KEY, 'true');
    setRevealReady(true);
  }, []);

  // Called by CinematicIntro the moment its bars start to open, roughly 0,75s
  // before the overlay is gone. Everything on the page below it starts moving
  // now.
  const startReveal = useCallback(() => setRevealReady(true), []);

  // Masthead reveal, per character, rising inside a per-line mask.
  //
  // Motivation (not decoration): the wordmark IS the hero. Letting it
  // assemble left to right makes the studio's name the first thing the eye
  // tracks, and the mask means characters never overlap the media band
  // while they travel. Arranca con `revealReady`, es decir en el fotograma en
  // que la secuencia de apertura empieza a levantar el telón -- ni antes (el
  // rótulo se montaría detrás de una pantalla opaca y nadie lo vería) ni
  // después (habría medio segundo de papel quieto entre las dos cosas).
  //
  // Split happens after `document.fonts.ready`: splitting before the Didone
  // has loaded measures fallback metrics and the lines re-wrap underneath
  // the finished split, leaving characters stranded mid-air.
  useEffect(() => {
    if (reducedMotion || !revealReady) return;
    const word = wordmarkRef.current;
    const aside = asideRef.current;
    if (!word) return;

    let split: SplitText | null = null;
    let ctx: gsap.Context | null = null;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !word) return;
      ctx = gsap.context(() => {
        // aria: 'none' -- the split must not put aria-label on a <span>
        // (prohibited on a generic); the h1's name comes from the sr-only copy.
        split = SplitText.create(word, { type: 'chars,lines', mask: 'lines', aria: 'none' });
        // EL PRESUPUESTO DE LA COREOGRAFÍA ES 1,2 s DE PUNTA A PUNTA, y estos
        // números salen de repartirlo, no de gustos:
        //   letras   0,00 -> 1,15  (0,85 s cada una, escalón de 0,014)
        //   descriptor 0,30 -> 0,75
        //   esquinas 0,48 -> 1,11  (Hero.module.css)
        //   mosaico  0,16 -> 1,16  (HeroMosaic)
        // El escalón bajó de 0,022 a 0,014 porque el rótulo tiene 22 signos:
        // a 0,022 la última letra ARRANCA en el 0,46 y no se posa hasta el
        // 1,56, y una portada que sigue montándose pasado el segundo y medio
        // se lee como una página que no ha terminado de cargar. A 0,014 la
        // cascada se sigue viendo -- 0,31 s entre la primera letra y la
        // última -- y cierra dentro del presupuesto.
        gsap.from(split.chars, {
          yPercent: 115,
          duration: 0.85,
          stagger: 0.014,
          ease: motion.ease.standard,
        });
        if (aside) {
          gsap.from(aside, {
            opacity: 0,
            y: 16,
            duration: 0.45,
            delay: 0.3,
            ease: motion.ease.standard,
          });
        }
      }, heroRef);
    });

    return () => {
      cancelled = true;
      split?.revert();
      ctx?.revert();
    };
  }, [reducedMotion, revealReady]);

  return (
    <section ref={heroRef} className={styles.hero} data-hero-fullbleed>
      {showIntro && <CinematicIntro onComplete={finishIntro} onReveal={startReveal} />}

      <div className={styles.masthead}>
        {/* The service-area statement sits inside the H1 so it carries
            heading weight for search, but it is set at label scale: the
            wordmark is the only thing at display size. It is a <span>
            because <p> is not valid phrasing content inside <h1>. */}
        <h1 className={styles.heading}>
          <span className="sr-only">EME Fotografía {site.legalCity}: fotógrafo y vídeo de bodas en Sevilla y Andalucía</span>
          <span ref={wordmarkRef} className={styles.wordmark} aria-hidden="true">
            EME Fotografía {site.legalCity}
          </span>
        </h1>
        {/* One line only, and it is the studio's own descriptor rather
            than a sentence: bellephoto.com.au's masthead band carries the
            wordmark and nothing else, and the positioning statement gets
            its own centred section immediately below. */}
        <p ref={asideRef} className={styles.aside}>
          <span className={styles.asideText}>
            Fotografía y vídeo de bodas en {site.legalCity}
          </span>
        </p>
        {/* Four corner notes around the masthead (Agentura's hero sets
            its claims in the corners of the frame). Real facts only. */}
        <ul className={styles.corners} aria-label="En pocas palabras">
          {/* El álbum salió de aquí cuando el estudio aclaró que depende del
              pack: una esquina del masthead es una promesa demasiado visible
              para algo que no va en todos los reportajes. */}
          <li className={`${styles.corner} ${styles.cornerTL}`}>Reportaje fotográfico y película.</li>
          <li className={`${styles.corner} ${styles.cornerTR}`}>Sevilla y toda Andalucía.</li>
          {/* Esta esquina daba "+125 parejas", la misma cifra que Cifras
              imprime a media pantalla de aquí. El argumento de Cifras es que
              "el hero afirma y esto es el recibo": se anula solo si el hero ya
              enseñó el recibo. Queda la trayectoria, que no se dice en ningún
              otro sitio de la home. */}
          <li className={`${styles.corner} ${styles.cornerBL}`}>Quince años detrás de la cámara.</li>
          <li className={`${styles.corner} ${styles.cornerBR}`}>Wedding Awards 2025 · Bodas.net</li>
        </ul>
      </div>

      <div className={styles.media}>
        {/* El mosaico abre su cortina con el mismo aviso que el masthead, no
            cuando la secuencia ya ha terminado: la fotografía y el nombre del
            estudio llegan juntos. */}
        <HeroMosaic play={revealReady} />
      </div>
    </section>
  );
}
