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
  // Distinguishes "no intro is coming" from "the intro has not been
  // decided yet" - both look identical as `showIntro === false` on the
  // first render, and the wordmark reveal must not fire behind an opaque
  // overlay that is about to appear.
  const [introResolved, setIntroResolved] = useState(false);
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
      setIntroResolved(true);
      return;
    }
    if (reducedMotion) {
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
      setIntroResolved(true);
      return;
    }
    setShowIntro(true);
  }, [reducedMotion]);

  // Called by CinematicIntro once its bars have opened and the screen has
  // lifted; the wordmark reveal below waits for this.
  const finishIntro = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem(INTRO_KEY, 'true');
    setIntroResolved(true);
  }, []);

  // Masthead reveal, per character, rising inside a per-line mask.
  //
  // Motivation (not decoration): the wordmark IS the hero. Letting it
  // assemble left to right makes the studio's name the first thing the eye
  // tracks, and the mask means characters never overlap the media band
  // while they travel. Runs only once the intro overlay has resolved, so a
  // first-time visitor never spends the animation behind an opaque screen.
  //
  // Split happens after `document.fonts.ready`: splitting before the Didone
  // has loaded measures fallback metrics and the lines re-wrap underneath
  // the finished split, leaving characters stranded mid-air.
  useEffect(() => {
    if (reducedMotion || !introResolved || showIntro) return;
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
        gsap.from(split.chars, {
          yPercent: 115,
          duration: motion.duration.slow,
          stagger: 0.022,
          ease: motion.ease.standard,
        });
        if (aside) {
          gsap.from(aside, {
            opacity: 0,
            y: 16,
            duration: motion.duration.base,
            delay: 0.35,
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
  }, [reducedMotion, introResolved, showIntro]);

  return (
    <section ref={heroRef} className={styles.hero} data-hero-fullbleed>
      {showIntro && <CinematicIntro onComplete={finishIntro} />}

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
          <li className={`${styles.corner} ${styles.cornerTL}`}>Reportaje, película y álbum impreso.</li>
          <li className={`${styles.corner} ${styles.cornerTR}`}>Sevilla y toda Andalucía.</li>
          {/* Esta esquina daba "+125 parejas", la misma cifra que Cifras
              imprime a media pantalla de aquí. El argumento de Cifras es que
              "el hero afirma y esto es el recibo": se anula solo si el hero ya
              enseñó el recibo. Y "una boda por fecha" tampoco vale: es la frase
              con la que cierra la página en CtaContacto. Queda la trayectoria,
              que no se dice en ningún otro sitio de la home. */}
          <li className={`${styles.corner} ${styles.cornerBL}`}>Quince años detrás de la cámara.</li>
          <li className={`${styles.corner} ${styles.cornerBR}`}>Wedding Awards 2025 · Bodas.net</li>
        </ul>
      </div>

      <div className={styles.media}>
        <HeroMosaic play={introResolved && !showIntro} />
      </div>
    </section>
  );
}
