'use client';
import { useEffect, useState } from 'react';
import { useLenis } from '@/lib/hooks/useLenis';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { useAvisoDeCookies, useCapaCompleta } from '@/lib/hooks/useCapaCompleta';
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

/**
 * El bloque legal del pie, que lleva su propio «Volver arriba» escrito.
 * Footer.tsx pone este atributo justo ahí.
 */
const BLOQUE_LEGAL = '[data-pie-legal]';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [sobreElPie, setSobreElPie] = useState(false);
  // Igual que el de WhatsApp: fuera mientras haya una capa a pantalla completa.
  // Lo mismo que el de WhatsApp, y además con el aviso de cookies puesto.
  const hayCapa = useCapaCompleta();
  const avisoPuesto = useAvisoDeCookies();
  const tapado = hayCapa || avisoPuesto;
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

  // SE APARTA AL LLEGAR AL PIE, y no es cortesía: estos dos botones están
  // fijos a `right: var(--gutter)`, que es exactamente el borde derecho del
  // contenido, y `bottom` los deja en el último palmo de la ventana. Al final
  // del scroll ese rincón ya no está vacío: ahí abajo está el bloque legal, y
  // este botón se sentaba encima de las últimas letras de su propio «Volver
  // arriba» y de la cifra de seguidores. Medido en producción a 1440: el
  // rótulo del pie ocupa de 1239 a 1378 y este botón, de 1334 a 1378.
  //
  // Y de paso quita una duplicación: con el pie a la vista había DOS «volver
  // arriba» en pantalla a la vez, uno encima del otro.
  useEffect(() => {
    const bloque = document.querySelector(BLOQUE_LEGAL);
    if (!bloque) return;
    const observador = new IntersectionObserver(
      ([entrada]) => setSobreElPie(entrada.isIntersecting),
      // Un pelo de margen para que se retire ANTES de tocarlo, no justo
      // cuando ya está encima.
      { rootMargin: '0px 0px 24px 0px' }
    );
    observador.observe(bloque);
    return () => observador.disconnect();
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
      hidden={!visible || sobreElPie || tapado}
      aria-label="Volver al principio de la página"
    >
      <ArrowGlyph dir="up" className={styles.arrow} />
    </button>
  );
}
