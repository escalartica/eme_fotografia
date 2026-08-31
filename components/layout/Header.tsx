'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { site } from '@/content/site';
import { MobileMenu } from './MobileMenu';
import styles from './Header.module.css';

const LINKS = [
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <Image src="/images/logo/eme-logo.png" alt={site.brandName} width={168} height={79} priority className={styles.logo} />
      </Link>
      <nav className={styles.desktopNav} aria-label="Navegación principal">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        className={styles.menuButton}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? 'Cerrar' : 'Menú'}
      </button>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
