'use client';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Cursor.module.css';

/**
 * Qué enseña el puntero sobre cada cosa.
 *
 * «Reproducir» era la única que se escribía pudiendo dibujarse. Un disco negro
 * con la palabra REPRODUCIR en versalitas, plantado encima de una fotografía de
 * boda y a la vez que el botón blanco que decía lo mismo en el centro del
 * cuadro, es el mismo mensaje dos veces y tapando el trabajo. El triángulo lo
 * dice igual, no tiene idioma y ocupa una cuarta parte.
 *
 * Las otras tres siguen con palabra porque no tienen símbolo que se entienda
 * sin aprenderlo: «ver», «abrir» y «explorar» no son operaciones de un
 * reproductor, son intenciones.
 */
const PISTAS: Record<string, { texto?: string; glifo?: 'play' }> = {
  ver: { texto: 'VER' },
  reproducir: { glifo: 'play' },
  abrir: { texto: 'ABRIR' },
  explorar: { texto: 'EXPLORAR' },
};

/**
 * The label that follows the pointer over a photograph.
 *
 * The position is written straight to the element's own transform inside a
 * single rAF, never through React state. It used to call setState on every
 * `mousemove`, which re-rendered this component's tree on every pointer
 * event on every page of the site -- the classic INP killer, and for a
 * purely decorative label. Only the LABEL is state now, because it changes
 * a handful of times per session rather than 60 times a second.
 *
 * Never replaces the system cursor (nothing here sets `cursor: none`), so
 * the pointer a visitor relies on is always the one their OS drew.
 */
export function Cursor() {
  // A real pointer, read as external state rather than assumed-false and
  // then corrected from an effect on the first paint.
  const enabled = useMediaQuery('(pointer: fine)');
  const [pista, setPista] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion) return;
    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      if (ref.current) ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      // Coalesce to one write per frame: several mousemove events can fire
      // between two paints and only the last position is ever visible.
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-cursor]');
      const clave = target?.getAttribute('data-cursor') ?? '';
      const next = clave in PISTAS ? clave : null;
      setPista((prev) => (prev === next ? prev : next));
    };

    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over, { passive: true });
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, reducedMotion]);

  // A pointer-following decoration is exactly the kind of motion someone
  // who asked for less of it does not want.
  if (!enabled || reducedMotion) return null;

  const actual = pista ? PISTAS[pista] : null;

  return (
    <div ref={ref} className={styles.cursor} aria-hidden="true">
      {actual && (
        <span
          data-testid="cursor-label"
          className={`${styles.label} ${actual.glifo ? styles.disco : ''}`}
        >
          {actual.glifo === 'play' ? (
            <svg viewBox="0 0 24 24" className={styles.play} aria-hidden="true">
              <path d="M9 6.5v11l9-5.5z" />
            </svg>
          ) : (
            actual.texto
          )}
        </span>
      )}
    </div>
  );
}
