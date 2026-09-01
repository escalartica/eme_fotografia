'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { MobileMenu } from './MobileMenu';
import styles from './Header.module.css';

const LINKS = [
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

// Below this scroll offset the header always stays visible, so it never
// flickers hidden/shown from the tiny scroll deltas that happen right at
// the top of the page.
const HIDE_THRESHOLD = 80;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Never hide the header while the mobile menu is open — resetting here
    // and not attaching a scroll listener below covers both "already open"
    // and "opened while scrolled down".
    if (menuOpen) {
      setHidden(false);
      return;
    }

    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      if (currentY <= HIDE_THRESHOLD) {
        setHidden(false);
      } else if (currentY > lastY) {
        setHidden(true);
      } else if (currentY < lastY) {
        setHidden(false);
      }
      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  return (
    <header
      className={`${styles.header}${reducedMotion ? '' : ` ${styles.animated}`}`}
      data-hidden={hidden ? 'true' : 'false'}
    >
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
