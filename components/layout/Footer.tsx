'use client';
import Link from 'next/link';
import { site } from '@/content/site';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { useLenis } from '@/lib/hooks/useLenis';
import { InstagramIcon, FacebookIcon, TikTokIcon } from '@/components/ui/Icon';
import styles from './Footer.module.css';

// Same four destinations as Header's desktop nav (components/layout/Header.tsx),
// plus Contacto (Header keeps that one in `.controls` instead of `LINKS`,
// since it's styled as the standalone CTA there -- the footer has no such
// distinction, so all four sit together in one list). Kept as its own
// array rather than imported from Header: Header's LINKS is that module's
// internal implementation detail, not a shared export, and duplicating a
// four-item nav list is cheaper than adding a public API for it.
// Los dos servicios tienen página propia desde que /servicios pasó a ser un
// índice. El menú de cabecera se queda con el padre —seis entradas y un
// desplegable de dos ítems serían peor que un índice—, pero el pie es donde
// la estructura del sitio se puede enseñar entera sin costar atención, y es
// además el único enlace permanente a las dos páginas hijas.
const LINKS = [
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/servicios/fotografia-de-boda', label: 'Fotografía de boda' },
  { href: '/servicios/video-de-boda', label: 'Vídeo de boda' },
  { href: '/sobre-nosotros', label: 'Equipo' },
  { href: '/contacto', label: 'Contacto' },
];

// Intl.NumberFormat/toLocaleString depend on the runtime's ICU data, which
// isn't guaranteed present (Node built without full-icu silently returns
// the unformatted number instead of throwing) -- a fixed '.' thousands
// separator matches es-ES and needs no locale data. Migrated from the
// now-retired Confianza component (see git history) rather than shared via
// lib/, since Footer is the only remaining caller.
function formatCount(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * The closing bookend (bellephoto.com.au's own full-screen dark footer).
 * STALE-COMMENT FIX: this used to describe a sticky/negative-margin
 * "curtain" trick (footer pinned via `position: sticky` + main pulled up
 * underneath via `margin-bottom: -100dvh`) -- that was reverted in
 * styles/globals.css after re-checking the reference site directly (see
 * the CLOSING FOOTER comment there for the full story: bellephoto.com.au's
 * own footer turned out to be a plain full-viewport-height section in
 * normal flow, not a scroll trick). `footer` here is exactly that: a plain
 * `min-height: var(--footer-reveal-height)` (~100dvh) block the reader
 * scrolls onto like any other section -- the drama is the ink-black panel
 * and its full-screen size alone.
 */
export function Footer() {
  const lenis = useLenis();

  function scrollToTop() {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <footer className={`${styles.footer} nightBlock`}>
      <div className={styles.top}>
        <nav aria-label="Navegación de pie de página" className={styles.nav}>
          <ul className={styles.navList}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.navLink}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.contact}>
          <a className={styles.link} href={`mailto:${site.email}`}>{site.email}</a>
          <div className={styles.social}>
            <a className={styles.link} href={site.instagramUrl} target="_blank" rel="noreferrer" data-cursor="abrir">
              <InstagramIcon className={styles.socialIcon} size={15} />
              Instagram
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <a className={styles.link} href={site.facebookUrl} target="_blank" rel="noreferrer" data-cursor="abrir">
              <FacebookIcon className={styles.socialIcon} size={15} />
              Facebook
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <a className={styles.link} href={site.tiktokUrl} target="_blank" rel="noreferrer" data-cursor="abrir">
              <TikTokIcon className={styles.socialIcon} size={15} />
              TikTok
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </div>
        </div>
      </div>

      {/* The closing bookend: the same wordmark Hero opens the site with,
          set once more here so the visit reads as a deliberate arc
          (cream masthead -> ... -> dark closing mark), the way
          bellephoto.com.au repeats "BELLÉ PHOTO" at full width in both
          its opening masthead and its closing panel. Decorative -- the
          brand name is already conveyed by the page <title>, Header's
          logo (with its own accessible name) and the copyright line
          below, so a screen reader does not need it announced a third
          time here. */}
      <ScrollReveal className={styles.markWrap}>
        <p className={styles.mark} aria-hidden="true">
          EME Fotografía {site.legalCity}
        </p>
      </ScrollReveal>

      <div className={styles.bottom}>
        <span className={styles.copy}>
          © {new Date().getFullYear()} {site.brandName} · {site.tagline} y toda Andalucía. Todos los derechos reservados.
          <span className={styles.legal}>
            <Link href="/aviso-legal">Aviso legal</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/cookies">Cookies</Link>
          </span>
        </span>
        {/* Confianza's real numbers (verified, see content/site.ts), kept as
            a small secondary detail line -- deliberately below the
            copyright in the reading order and well under --type-label's
            surrounding weight, not a headline stat. */}
        <ul className={styles.stats}>
          <li>{formatCount(site.facebookLikes)} me gusta en Facebook</li>
          <li>{formatCount(site.instagramFollowers)} seguidores en Instagram</li>
        </ul>
        <button type="button" className={styles.backToTop} onClick={scrollToTop}>
          Volver arriba <span className={styles.arrow} aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
