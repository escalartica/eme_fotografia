'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { BrandMark } from '@/components/ui/BrandMark';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { useLenis } from '@/lib/hooks/useLenis';
import { MenuIcon, CloseIcon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Magnetic } from '@/components/motion/Magnetic';
import { MobileMenu } from './MobileMenu';
import styles from './Header.module.css';

// Primary nav, always visible at desktop. Previously these links existed
// ONLY inside the mobile overlay, reachable through a single toggle that
// was invisible on every page except the home hero (mix-blend-mode:
// difference against the paper background, which the body's own canvas
// fill does not participate in). A sighted mouse user had no navigation
// at all off the home page. Both reference studios that carry copy
// (bellephoto.com.au, danieleandmarilia.com) keep a persistent nav.
const LINKS = [
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'Equipo' },
];

const CONTACT = { href: '/contacto', label: 'Contacto' };

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // Drives the paper fill under the bar. The header no longer hides on
  // scroll-down: bellephoto.com.au keeps its nav on screen for the whole
  // page, and a bar that disappears is a bar the reader has to go looking
  // for. At the very top it sits on the hero's own paper band and needs no
  // chrome; once photography passes underneath it needs a real surface.
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();

  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  useEffect(() => {
    let ticking = false;
    let rafId: number | null = null;

    const update = () => {
      setScrolled(window.scrollY > 8);
      ticking = false;
      rafId = null;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Close the overlay on route change, so following a link from inside it
  // never leaves the menu covering the page it just navigated to.
  //
  // Adjusted during render rather than in an effect. React re-runs this
  // component immediately, before the browser paints, so the menu is never
  // shown open over the new page for a frame -- which is exactly what an
  // effect would allow, and why `react-hooks/set-state-in-effect` flags
  // the effect form. https://react.dev/learn/you-might-not-need-an-effect
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  // Pulsar el logotipo tiene que llevar SIEMPRE al principio de la home. Fuera
  // de la home lo hace la navegación; estando ya en ella, Next no vuelve a
  // montar la página y el scroll se queda donde estaba, así que el logotipo
  // parecía no responder. Se sube a mano, y por Lenis cuando está activo para
  // que el movimiento sea el mismo que el del resto del sitio.
  const goHomeTop = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return;
    event.preventDefault();
    if (lenis && !reducedMotion) {
      lenis.scrollTo(0);
      return;
    }
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <header
      className={`${styles.header}${reducedMotion ? '' : ` ${styles.animated}`}`}
      data-scrolled={scrolled ? 'true' : 'false'}
    >
      <Link
        href="/"
        className={styles.brand}
        aria-label={`${site.brandName} - inicio`}
        onClick={goHomeTop}
      >
        {/* El logotipo y su versión para fondo oscuro, en un componente:
            este patrón vivía sólo aquí, escrito a mano, y las cinco pantallas
            privadas se lo habían perdido -- en modo noche enseñaban un trazo
            de tinta sobre un fondo casi negro. Ver components/ui/BrandMark. */}
        <BrandMark alto={2.25} className={styles.marca} />
      </Link>

      <nav className={styles.desktopNav} aria-label="Navegación principal">
        <ul className={styles.navList}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.navLink}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                <span className={styles.roll}>
                  <span className={styles.rollText}>{link.label}</span>
                  <span className={styles.rollText} aria-hidden="true">{link.label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.controls}>
        {/* Se inclina hacia el puntero al acercarse, como la llamada a la
            acción del cierre de la home. Radio corto: en la barra hay un
            interruptor de tema y un botón de menú a dos dedos de distancia,
            y un radio largo haría que se moviera al ir a por ellos. */}
        <Magnetic radius={64} strength={0.22}>
          <Link
            href={CONTACT.href}
            className={styles.contactLink}
            aria-current={isActive(CONTACT.href) ? 'page' : undefined}
          >
            <span className={styles.roll}>
              <span className={styles.rollText}>{CONTACT.label}</span>
              <span className={styles.rollText} aria-hidden="true">{CONTACT.label}</span>
            </span>
          </Link>
        </Magnetic>
        <ThemeToggle />
        <button
          ref={menuButtonRef}
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={styles.menuIconStack}>
            <MenuIcon className={styles.menuGlyph} size={17} />
            <CloseIcon className={styles.closeGlyph} size={17} />
          </span>
          <span className={styles.menuButtonLabel}>{menuOpen ? 'Cerrar' : 'Menú'}</span>
        </button>
      </div>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        toggleRef={menuButtonRef}
        currentPath={pathname}
      />
    </header>
  );
}
