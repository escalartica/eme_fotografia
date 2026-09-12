'use client';
import { useEffect, useRef, useState } from 'react';
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

const REDES = [
  { href: site.instagramUrl, label: 'Instagram' },
  { href: site.tiktokUrl, label: 'TikTok' },
  { href: site.facebookUrl, label: 'Facebook' },
];

/**
 * Lo que tarda el panel en irse, en milisegundos, y por qué ese número.
 *
 * El cierre es DOS cosas a la vez: las cinco filas caen escalonadas desde la
 * última (0,22 s de tween + 4 × 0,03 s de retardo = 0,34 s) y el telón se
 * desvanece con la transición CSS de `.overlay` (--duration-fast, 0,3 s).
 * Desmontar antes de eso corta la animación a media altura --que es
 * exactamente el defecto que había: `if (!isOpen) return null` hacía
 * desaparecer el menú entero en un fotograma-- y desmontar mucho después deja
 * un panel invisible encima de la página comiéndose los toques. 340 ms es el
 * más largo de los dos caminos.
 */
const SALIDA_MS = 340;

function Flecha({ className }: { className?: string }) {
  // Dibujada, no tipografiada, por lo mismo que la insignia giratoria del
  // CTA: los caracteres de flecha de Unicode no están en la fuente de texto
  // del sistema en iOS y el teléfono los sustituye por el emoji a color.
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h13" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function MobileMenu({
  isOpen,
  onClose,
  toggleRef,
  currentPath,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** The header's own open/close button, which sits outside this panel. */
  toggleRef?: React.RefObject<HTMLElement | null>;
  /**
   * La ruta actual, que llega desde la cabecera ya calculada. No se lee aquí
   * con `usePathname` a propósito: este panel se monta también en pruebas que
   * no levantan el enrutador, y el gancho devuelve `null` fuera de su
   * contexto. La cabecera ya lo tiene para marcar su propia navegación de
   * escritorio, así que se pasa en vez de pedirlo dos veces.
   */
  currentPath?: string | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // EL PANEL SOBREVIVE AL CIERRE, que es toda la diferencia con la versión
  // anterior. `montado` es lo que decide si hay DOM; `isOpen` sigue siendo lo
  // que decide si el menú está abierto de cara al usuario y al foco. Entre
  // los dos hay SALIDA_MS de animación de salida, con el panel ya inerte al
  // ratón y anunciado como oculto.
  const [montado, setMontado] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [anterior, setAnterior] = useState(isOpen);

  // AJUSTE DURANTE EL RENDERIZADO, no dentro de un efecto. Es el patrón que
  // React documenta para el estado que se deriva de una prop
  // («adjusting state when a prop changes»): se compara con el valor anterior
  // y se corrige en el acto, antes de pintar. Metido en un `useEffect` --que
  // fue la primera versión-- son dos pasadas de renderizado por cada apertura
  // y el propio `react-hooks/set-state-in-effect` lo rechaza; peor todavía,
  // el primer fotograma del panel se pintaría con el estado equivocado.
  // El valor anterior se guarda en estado y no en una `ref` porque una `ref`
  // no se puede leer ni escribir durante el renderizado: es justo el caso que
  // `react-hooks/refs` señala, y el ejemplo de la documentación de React usa
  // estado.
  if (anterior !== isOpen) {
    setAnterior(isOpen);
    if (isOpen) {
      setMontado(true);
      setClosing(false);
    } else if (montado) {
      // Con movimiento reducido no hay salida que esperar: fuera en el acto.
      if (reducedMotion) setMontado(false);
      else setClosing(true);
    }
  }

  // Y el desmontaje, cuando la animación de salida ha terminado. El
  // `setTimeout` no es una cuenta atrás decorativa: es lo que mantiene el
  // panel en el DOM mientras se va.
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setMontado(false);
      setClosing(false);
    }, SALIDA_MS);
    return () => clearTimeout(t);
  }, [closing]);

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
  // Atado a `montado`, NO a `isOpen`: el candado tiene que aguantar puesto los
  // SALIDA_MS que el telón sigue en pantalla, o la página de debajo recupera
  // el scroll mientras el menú todavía se está yendo y salta.
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
    if (!montado) return;
    const previous = document.body.style.overflowY;
    document.body.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = previous;
    };
  }, [montado]);

  // Staggered entry. Motivation: the overlay replaces the whole page, so
  // the sequence tells the reader the list is the new content and gives
  // the eye an order to read it in. transform + opacity only.
  useEffect(() => {
    if (!isOpen || reducedMotion || !panelRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
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
      // El pie entra el último y sin desplazamiento: es el remate de la
      // secuencia, no otra fila. Empieza cuando el escalonado de las filas ya
      // va por la mitad, para que la entrada se lea como un solo gesto.
      tl.fromTo(
        `.${styles.foot}`,
        { opacity: 0 },
        { opacity: 1, duration: motion.duration.fast, ease: motion.ease.enter, clearProps: 'opacity' },
        '-=0.35'
      );
    }, panelRef);
    return () => ctx.revert();
  }, [isOpen, reducedMotion]);

  // Salida. Las filas caen EMPEZANDO POR LA ÚLTIMA (`from: 'end'`), que es el
  // orden inverso al de la entrada: el menú se recoge por donde se desplegó.
  // Más corto que la entrada a propósito -- cerrar es un trámite, y una
  // salida tan larga como la apertura se siente lenta.
  useEffect(() => {
    if (!closing || reducedMotion || !panelRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(`.${styles.row}`, {
        yPercent: 60,
        opacity: 0,
        duration: 0.22,
        ease: motion.ease.exit,
        stagger: { each: 0.03, from: 'end' },
      });
    }, panelRef);
    return () => ctx.revert();
  }, [closing, reducedMotion]);

  if (!montado) return null;

  const esActual = (href: string) =>
    currentPath === href || (href !== '/' && (currentPath?.startsWith(`${href}/`) ?? false));

  return (
    <div
      className={`${styles.overlay}${closing ? ` ${styles.closing}` : ''}`}
      ref={panelRef}
      /* It covers the page and traps Tab, so it has to say what it is.
         Without role="dialog" + aria-modal a screen-reader user can still
         browse the page underneath, which is neither visible nor
         reachable by keyboard. */
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      /* Mientras se va ya no es un diálogo con el que se pueda hacer nada:
         se saca del árbol de accesibilidad y deja de recibir toques, para
         que un dedo rápido no abra un enlace de un panel que ya está medio
         transparente. */
      aria-hidden={closing || undefined}
    >
      <nav aria-label="Menú principal" className={styles.nav}>
        <ol className={styles.list}>
          {LINKS.map((link, i) => {
            const actual = esActual(link.href);
            return (
              <li key={link.href} className={styles.item}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`${styles.row}${actual ? ` ${styles.current}` : ''}`}
                  aria-current={actual ? 'page' : undefined}
                  tabIndex={closing ? -1 : undefined}
                >
                  <span className={styles.index} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.label}>{link.label}</span>
                  {actual ? (
                    <span className={styles.here}>
                      <span className={styles.dot} aria-hidden="true" />
                      <span className="sr-only">(estás aquí)</span>
                    </span>
                  ) : (
                    <Flecha className={styles.arrow} />
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className={styles.foot}>
        <div className={styles.contacto}>
          <a href={`mailto:${site.email}`} className={styles.contactoLink}>
            {site.email}
          </a>
          <a href={`tel:+${site.whatsappNumber}`} className={styles.contactoLink}>
            {site.phoneDisplay}
          </a>
        </div>
        <ul className={styles.redes}>
          {REDES.map((red) => (
            <li key={red.label}>
              <a href={red.href} className={styles.footLink} target="_blank" rel="noreferrer">
                {red.label}
                {/* Same "opens in a new tab" hint Footer.tsx's own social links
                    give (WCAG 3.2.5) -- this link was missing it. */}
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
