'use client';
import { useEffect, useState } from 'react';
import { useLenis } from '@/lib/hooks/useLenis';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './BackToTop.module.css';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

/**
 * Volver al principio de la página.
 *
 * Este sitio es largo a propósito: la home encadena varias secciones a
 * pantalla completa y una ficha de boda publica el reportaje entero, veinte o
 * veinticinco fotos. Al final de cualquiera de las dos, el único camino de
 * vuelta al menú era arrastrar el dedo hacia arriba durante varios segundos.
 *
 * Aparece solo cuando hay recorrido de vuelta (dos pantallas), para no ocupar
 * una esquina desde el primer momento, y se apila encima del botón de
 * WhatsApp en lugar de disputarle el sitio.
 */
const REVEAL_AFTER_SCREENS = 2;

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * REVEAL_AFTER_SCREENS);
    };
    onScroll();
    // `passive`: este manejador no llama a preventDefault, y decírselo al
    // navegador le permite pintar el scroll sin esperar a que termine.
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    // Por Lenis cuando está activo, para que el viaje de vuelta tenga la misma
    // inercia que el resto del sitio y no dos movimientos distintos.
    if (lenis && !reducedMotion) {
      lenis.scrollTo(0);
      return;
    }
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toTop}
      // `hidden` en lugar de desmontar: así el botón conserva su transición de
      // entrada y no salta al aparecer. Cuando está oculto no es enfocable.
      hidden={!visible}
      aria-label="Volver al principio de la página"
    >
      <ArrowGlyph dir="up" className={styles.arrow} />
    </button>
  );
}
