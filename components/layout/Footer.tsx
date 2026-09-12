'use client';
import Link from 'next/link';
import Image from 'next/image';
import { site } from '@/content/site';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { useLenis } from '@/lib/hooks/useLenis';
import { InstagramIcon, FacebookIcon, TikTokIcon } from '@/components/ui/Icon';
import styles from './Footer.module.css';

// El pie ya no repite el menú. Tenía las mismas seis entradas que la
// cabecera —que es fija y sigue visible cuando el lector llega aquí—, así
// que era la misma navegación dos veces en la misma pantalla. Las dos
// páginas hijas de servicios, que son las únicas que no están en el menú
// de arriba, se enlazan desde el índice /servicios (app/(site)/servicios/
// page.tsx) y desde la guía de la home (components/sections/
// GuiaBodasSevilla.tsx), así que no se quedan sin enlace interno.

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
      {/* Una sola barra de servicio, callada, encima de la marca: el correo
          a la izquierda y las tres redes a la derecha. El correo va en palo
          seco y a tamaño de nota, no a tamaño de titular: quien lo busca lo
          encuentra, y quien no, no se lo tropieza. */}
      <div className={styles.top}>
        <a className={styles.email} href={`mailto:${site.email}`}>{site.email}</a>
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
        {/* El logotipo de verdad, no el nombre compuesto en tipografía. Es el
            mismo remate que abre la web en la cabecera, y cerrar con la marca
            en vez de con su transcripción es lo que hace que la visita se lea
            como un arco. Decorativo: el nombre ya lo llevan el <title> de la
            página, el logotipo de la cabecera con su nombre accesible y la
            línea de copyright de aquí abajo. */}
        <Image
          src="/images/logo/eme-mark-light.png"
          alt=""
          aria-hidden="true"
          width={967}
          height={317}
          sizes="(max-width: 899px) 40vw, (max-width: 1000px) 34vw, 336px"
          className={styles.mark}
        />
      </ScrollReveal>

      <div className={styles.bottom}>
        <span className={styles.copy}>
          {/* LA LÍNEA DE CRÉDITO, TAL Y COMO LA PIDIÓ EL ESTUDIO, con el año
              calculado y no escrito: un «2026» a mano envejece solo y en una
              web de bodas se nota, porque la mitad de quien entra viene a
              contratar para el año que viene.
              Y una sola línea de copyright, no dos: aquí ponía «· Fotógrafo y
              vídeo de bodas en Sevilla y toda Andalucía. Todos los derechos
              reservados», que decía lo mismo que ésta y además repetía el
              lema que ya está en la cabecera de cada página. */}
          {/* `lang="en"` en los dos tramos en inglés: la página está en
              castellano, así que sin él un lector de pantalla lee «All rights
              reserved» con fonética española. El estudio pidió la cadena
              literal, y marcarla es la forma de respetarla sin que se oiga
              mal.
              Los espacios van escritos con {' '}: JSX se come el espacio que
              hay al final de una línea de texto antes de un elemento. */}
          © {new Date().getFullYear()} Eme Fotografía.{' '}
          <span lang="en">All rights reserved.</span>{' '}
          <span className={styles.separador} aria-hidden="true">|</span>{' '}
          <span lang="en">Designed &amp; Developed by</span> Escalârtica.
          {/* AQUÍ FUE EL LOGOTIPO DE ESCALÂRTICA, y lo quitó quien lo pidió:
              «no hace falta el logo de escalartica porque descuadra todo».
              Y descuadraba: a la altura de esta línea --un antetítulo-- una
              marca de 129x71 se queda en unos once píxeles de alto, que no es
              una firma sino una mancha, y con la línea partida en dos
              renglones en un teléfono caía en el sitio que le tocara. El
              crédito escrito hace el mismo trabajo y no compite con la marca
              del estudio, que es lo único que debería pesar en este pie. */}
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
