'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { createFocusTrap } from 'focus-trap';
import styles from './MobileMenu.module.css';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Trapping Tab navigation to the open panel — without this, a keyboard
  // user could previously Tab straight out of the full-screen overlay into
  // page content hidden behind it (only the initial-focus + Escape-to-close
  // below were implemented, no actual trap). Mirrors Lightbox.tsx's
  // established use of the same already-installed `focus-trap` package;
  // `escapeDeactivates: false` because Escape is handled by this
  // component's own keydown listener below (calling `onClose`, which also
  // unmounts the panel and lets focus-trap's own deactivate-on-unmount
  // return focus to the header's toggle button).
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const trap = createFocusTrap(panelRef.current, {
      escapeDeactivates: false,
      clickOutsideDeactivates: false,
      fallbackFocus: () => panelRef.current!,
      delayInitialFocus: false,
      delayReturnFocus: false,
    });
    trap.activate();
    return () => {
      trap.deactivate();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} ref={panelRef}>
      <nav aria-label="Menú principal">
        <ul className={styles.list}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={onClose}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
