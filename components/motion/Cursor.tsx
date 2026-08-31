'use client';
import { useEffect, useState } from 'react';
import styles from './Cursor.module.css';

const LABELS: Record<string, string> = { ver: 'VER', reproducir: 'REPRODUCIR', arrastrar: 'ARRASTRAR' };

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-cursor]');
      setLabel(target ? LABELS[target.getAttribute('data-cursor') ?? ''] ?? null : null);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={styles.cursor} style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} aria-hidden="true">
      {label && <span data-testid="cursor-label" className={styles.label}>{label}</span>}
    </div>
  );
}
