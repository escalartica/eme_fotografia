'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { createFocusTrap } from 'focus-trap';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
import { site } from '@/content/site';
import styles from './MobileMenu.module.css';

// Numbered index, the device danieleandmarilia.com uses for its overlay
// (01 HOME / 02 PORTFOLIO / ...). The numeral is page furniture, not
// content, so it is aria-hidden and the link text stays the whole
// accessible name.
const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'Equipo' },
  { href: '/contacto', label: 'Contacto' },
];

export function MobileMenu({
  isOpen,
  onClose,
  toggleRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** The header's own open/close button, which sits outside this panel. */
  toggleRef?: React.RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Trap Tab inside the open panel so a keyboard user cannot walk into the
  // page content hidden behind it. `escapeDeactivates: false` because
  // Escape is handled below, which also unmounts the panel and lets
  // focus-trap return focus to the header toggle.
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const trap = createFocusTrap(panelRef.current, {
      escapeDeactivates: false,
      clickOutsideDeactivates: false,
      // Without this, focus-trap's own document-level click listener
      // (capture phase, `clickOutsideDeactivates: false`) swallows clicks
      // on the toggle button too, since it lives outside this panel --
      // the button's aria-label would flip to "Cerrar menu" but clicking
      // it again did nothing, because the click never reached React's
      // handler at all.
      allowOutsideClick: (e) => toggleRef?.current?.contains(e.target as Node) ?? false,
      fallbackFocus: () => panelRef.current!,
      delayInitialFocus: false,
      delayReturnFocus: false,
    });
    trap.activate();
    return () => {
      trap.deactivate();
    };
  }, [isOpen, toggleRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock the page behind the overlay. Without this the panel is fixed but
  // the document keeps scrolling under it on touch.
  //
  // SÓLO EL EJE VERTICAL. `overflow: hidden` a secas escribe los DOS ejes, y
  // el horizontal del `body` no es libre: la hoja global le pone
  // `overflow-x: clip`, que es de lo que dependen todas las secciones a
  // sangre del sitio -- recorta sin crear contenedor de scroll, y por eso no
  // rompe la cabecera fija ni las tres pilas ancladas. Escribiendo `overflow`
  // entero, mientras el menú estaba abierto el `body` pasaba a ser contenedor
  // de scroll en los dos ejes: cualquier banda a sangre que se pasara unos
  // píxeles --lo hacen, por el ancho de la barra de scroll clásica-- sacaba
  // una barra horizontal por detrás del panel.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflowY;
    document.body.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = previous;
    };
  }, [isOpen]);

  // Staggered entry. Motivation: the overlay replaces the whole page, so
  // the sequence tells the reader the list is the new content and gives
  // the eye an order to read it in. transform + opacity only.
  useEffect(() => {
    if (!isOpen || reducedMotion || !panelRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.row}`,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: motion.duration.base,
          stagger: 0.06,
          ease: motion.ease.standard,
          // Libera el `transform`/`opacity` en linea al terminar. Sin esto
          // cada fila se quedaba con `transform: translate(0%, 0%)` puesto
          // a mano por GSAP -- una capa promovida por fila para siempre, y
          // un estilo en linea que ganaba a cualquier regla CSS de estado:
          // es la razon por la que .row:active (MobileMenu.module.css) no
          // habria llegado nunca a verse.
          clearProps: 'transform,opacity',
        }
      );
    }, panelRef);
    return () => ctx.revert();
  }, [isOpen, reducedMotion]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      ref={panelRef}
      /* It covers the page and traps Tab, so it has to say what it is.
         Without role="dialog" + aria-modal a screen-reader user can still
         browse the page underneath, which is neither visible nor
         reachable by keyboard. */
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      <nav aria-label="Menú principal" className={styles.nav}>
        <ol className={styles.list}>
          {LINKS.map((link, i) => (
            <li key={link.href} className={styles.item}>
              <Link href={link.href} onClick={onClose} className={styles.row}>
                <span className={styles.index} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.label}>{link.label}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className={styles.foot}>
        <a href={`mailto:${site.email}`} className={styles.footLink}>
          {site.email}
        </a>
        <a href={site.instagramUrl} className={styles.footLink} target="_blank" rel="noreferrer">
          Instagram
          {/* Same "opens in a new tab" hint Footer.tsx's own social links
              give (WCAG 3.2.5) -- this link was missing it. */}
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
        <a href={site.tiktokUrl} className={styles.footLink} target="_blank" rel="noreferrer">
          TikTok
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
        <a href={site.facebookUrl} className={styles.footLink} target="_blank" rel="noreferrer">
          Facebook
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </div>
  );
}
