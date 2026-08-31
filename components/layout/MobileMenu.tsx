'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    panelRef.current?.querySelector('a')?.focus();
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
