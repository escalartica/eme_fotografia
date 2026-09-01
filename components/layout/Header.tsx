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

  // Current-section indicator: a single label, not a link list — matches on
  // the route itself or any nested path beneath it (e.g. a project detail
  // page at /trabajos/boda-real-01 still reads "Trabajos"). Home has no
  // entry in LINKS, so it correctly resolves to no label. usePathname() can
  // return null outside a router context (e.g. RootLayout's own test, which
  // renders without mocking next/navigation) — guard against that.
  const sectionLabel = pathname
    ? LINKS.find((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))?.label
    : undefined;

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
    let rafId: number | null = null;

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
      rafId = null;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      // Cancel any in-flight frame from a scroll event that fired just before
      // the menu opened — without this, a stale `update()` bound to the
      // pre-menu-open closure can call setHidden(true) right after this
      // effect's own setHidden(false), defeating "never hide while the menu
      // is open" on mobile momentum-scroll.
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [menuOpen]);

  return (
    <header
      className={`${styles.header}${reducedMotion ? '' : ` ${styles.animated}`}`}
      data-hidden={hidden ? 'true' : 'false'}
    >
      <Link href="/" className={styles.brand}>
        <Image src="/images/logo/eme-logo.png" alt={site.brandName} width={168} height={79} priority className={styles.logo} />
      </Link>
      <div className={styles.controls}>
        {sectionLabel && <span className={styles.sectionLabel}>{sectionLabel}</span>}
        <button
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? 'Cerrar' : 'Menú'}
        </button>
      </div>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
