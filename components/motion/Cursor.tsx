'use client';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Cursor.module.css';

const LABELS: Record<string, string> = { ver: 'VER', reproducir: 'REPRODUCIR', abrir: 'ABRIR', explorar: 'EXPLORAR' };

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
  const [label, setLabel] = useState<string | null>(null);
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
      const next = target ? LABELS[target.getAttribute('data-cursor') ?? ''] ?? null : null;
      setLabel((prev) => (prev === next ? prev : next));
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

  return (
    <div ref={ref} className={styles.cursor} aria-hidden="true">
      {label && <span data-testid="cursor-label" className={styles.label}>{label}</span>}
    </div>
  );
}
