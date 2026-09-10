'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './TeamList.module.css';

export interface TeamMember {
  name: string;
  role: string;
  portrait: string;
  /** Optional external profile. */
  href?: string;
}

/**
 * The team as an index (Lundani's "Our Team" list): number, name, role,
 * one hairline per person. On desktop the portrait of whoever is under
 * the pointer floats beside the cursor and follows it with a soft lag;
 * on touch screens the portrait sits inline at the start of the row.
 */
export function TeamList({ members }: { members: TeamMember[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = floatRef.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: reducedMotion ? 0 : 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: reducedMotion ? 0 : 0.55, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX + 24);
      yTo(e.clientY - 120);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion]);

  useEffect(() => {
    const el = floatRef.current;
    if (!el) return;
    gsap.to(el, {
      opacity: hovered === null ? 0 : 1,
      scale: hovered === null ? 0.9 : 1,
      rotate: hovered === null ? -4 : 0,
      duration: reducedMotion ? 0 : 0.4,
      ease: 'power3.out',
      overwrite: true,
    });
  }, [hovered, reducedMotion]);

  return (
    <div className={styles.wrap}>
      <ol className={styles.list} onMouseLeave={() => setHovered(null)}>
        {members.map((m, i) => {
          const inner = (
            <>
              <span className={styles.thumb} aria-hidden="true">
                <Image src={m.portrait} alt="" fill sizes="80px" className={styles.thumbImage} />
              </span>
              <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.name}>{m.name}</span>
              <span className={styles.role}>{m.role}</span>
            </>
          );
          return (
            <li key={m.name} className={styles.row} data-hovered={hovered === i || undefined} onMouseEnter={() => setHovered(i)}>
              {m.href ? (
                <a href={m.href} target="_blank" rel="noopener noreferrer" className={styles.rowInner} onFocus={() => setHovered(i)} onBlur={() => setHovered(null)}>
                  {inner}
                  <span className="sr-only"> (Instagram, se abre en una pestaña nueva)</span>
                </a>
              ) : (
                <div className={styles.rowInner}>{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
      <div ref={floatRef} className={styles.float} aria-hidden="true">
        {members.map((m, i) => (
          <span key={m.name} className={styles.floatLayer} style={{ opacity: hovered === i ? 1 : 0 }}>
            <Image src={m.portrait} alt="" fill sizes="220px" className={styles.floatImage} />
          </span>
        ))}
      </div>
    </div>
  );
}
