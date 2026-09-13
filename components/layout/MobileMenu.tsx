'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { createFocusTrap } from 'focus-trap';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
import { site } from '@/content/site';
import { ATRIBUTO_CAPA } from '@/lib/hooks/useCapaCompleta';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';
import { CloseIcon } from '@/components/ui/Icon';
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

/** Lo que hay que arrastrar hacia abajo para que el panel se cierre. */
const UMBRAL_CIERRE = 60;


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

  /**
   * CERRAR TIRANDO HACIA ABAJO, como se cierra cualquier hoja en un móvil.
   *
   * Sólo cuando el panel ya está arriba del todo (`scrollTop <= 0`): si no,
   * el mismo gesto es el que sirve para subir por la lista, y el menú se
   * cerraría cada vez que alguien quisiera volver al principio.
   *
   * El umbral son 60 px para que un roce no lo cierre. Y `wheel` además del
   * tacto, que en un portátil con trackpad el gesto es el mismo.
   */
  useEffect(() => {
    if (!montado || closing) return;
    const panel = panelRef.current;
    if (!panel) return;

    let empezoEn: number | null = null;

    const alEmpezar = (e: TouchEvent) => {
      empezoEn = panel.scrollTop <= 0 ? e.touches[0].clientY : null;
    };
    const alMover = (e: TouchEvent) => {
      if (empezoEn === null) return;
      if (e.touches[0].clientY - empezoEn > UMBRAL_CIERRE) {
        empezoEn = null;
        onClose();
      }
    };
    const alSoltar = () => {
      empezoEn = null;
    };
    const alRodar = (e: WheelEvent) => {
      if (panel.scrollTop <= 0 && e.deltaY < -UMBRAL_CIERRE) onClose();
    };

    panel.addEventListener('touchstart', alEmpezar, { passive: true });
    panel.addEventListener('touchmove', alMover, { passive: true });
    panel.addEventListener('touchend', alSoltar, { passive: true });
    panel.addEventListener('wheel', alRodar, { passive: true });
    return () => {
      panel.removeEventListener('touchstart', alEmpezar);
      panel.removeEventListener('touchmove', alMover);
      panel.removeEventListener('touchend', alSoltar);
      panel.removeEventListener('wheel', alRodar);
    };
  }, [montado, closing, onClose]);

  // AVISA AL RESTO DEL SITIO DE QUE HAY UNA CAPA A PANTALLA COMPLETA.
  // Lo leen el botón de WhatsApp, el de volver arriba y el aviso de cookies
  // (lib/hooks/useCapaCompleta.ts) para apartarse: los tres flotan por encima
  // de todo y sin esto se pintaban por delante de la navegación.
  //
  // Un atributo en el documento y no un contexto de React porque quien tapa y
  // quien se aparta viven en ramas distintas del árbol y no se conocen.
  useEffect(() => {
    if (!montado) return;
    document.body.setAttribute(ATRIBUTO_CAPA, 'menu');
    return () => document.body.removeAttribute(ATRIBUTO_CAPA);
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

  // EL PANEL SE CUELGA DEL <body>, NO DE LA CABECERA, y es la diferencia
  // entre que funcione y que no.
  //
  // Vive dentro de <header> en el marcado, y la cabecera se vuelve un cristal
  // esmerilado en cuanto se baja un poco: `backdrop-filter: blur(12px)`
  // (Header.module.css, `[data-scrolled='true']`). Un `backdrop-filter` crea
  // BLOQUE CONTENEDOR para los descendientes `position: fixed` -- igual que
  // `filter` o `transform` --, así que el `inset: 0` de este panel dejaba de
  // medirse contra la ventana y pasaba a medirse contra la barra. Resultado
  // en un teléfono: abrir el menú con la página bajada encogía la capa entera
  // al alto de la cabecera, con las cinco filas y el pie amontonados dentro y
  // la página asomando debajo. Desde arriba del todo abría bien, porque ahí
  // la barra todavía no tiene cristal: por eso tardó en aparecer.
  //
  // `createPortal` lo saca de esa jaula. No cambia nada del árbol de React
  // --props, estado, contexto y eventos siguen viniendo de la cabecera-- y
  // sólo cambia dónde se pinta, que es justo el problema.
  return createPortal(
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
      /* Mientras se va ya no es un diálogo con el que se pueda hacer nada.
         `inert` y no `aria-hidden`, que fue la primera versión y estaba mal:
         `aria-hidden` saca el contenedor del árbol de accesibilidad pero dentro
         se quedan NUEVE enlaces enfocables (las cinco filas más el correo, el
         teléfono y las tres redes del pie), y eso es la infracción clásica
         «aria-hidden no puede contener elementos enfocables». Y no era teórica:
         el foco vuelve al botón de la cabecera, que está ANTES del panel en el
         documento, así que un tabulador dentro de esos 340 ms metía a quien
         navega con teclado en una región anunciada como oculta y ya sorda al
         puntero.
         `inert` hace las tres cosas de golpe --árbol de accesibilidad, orden de
         tabulación y eventos de puntero-- y deja de haber dos listas que
         mantener a la vez.
         Y ojo con el alcance: el aviso de cookies vigila `body > [inert]` para
         esconderse cuando algo tapa la página (components/consent/
         CookieConsent.tsx). Este panel vive dentro del <header>, no colgando
         del <body>, así que ese selector no lo ve y el aviso no parpadea cada
         vez que se cierra el menú. */
      inert={closing || undefined}
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
                    <ArrowGlyph dir="right" className={styles.arrow} />
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

      {/* LA X VA DENTRO DEL PANEL, Y LA ÚLTIMA DEL MARCADO.

          Dentro, porque el botón de la cabecera dejó de servir cuando el
          panel pasó a colgar del <body>: la cabecera crea su propio contexto
          de apilamiento con z-index 50, así que su botón --por mucho 101 que
          se le ponga-- queda por debajo de este telón. El menú se abría y ya
          no había manera de cerrarlo salvo con el botón atrás del navegador.

          La última del marcado, y arriba del todo con `order: -1`, porque
          `focus-trap` da la vuelta al llegar al FINAL de la lista: con la X
          de primer elemento enfocable, esa vuelta acababa en el cuerpo del
          documento en vez de dentro del panel. Así la primera parada del
          tabulador sigue siendo «Inicio», como siempre. */}
      <button type="button" className={styles.cerrar} onClick={onClose}>
        <CloseIcon size={14} />
        Cerrar
      </button>
    </div>,
    document.body
  );
}
