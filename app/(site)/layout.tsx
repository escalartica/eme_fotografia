import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieConsent } from '@/components/consent/CookieConsent';
import { PageHit } from '@/components/analytics/PageHit';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { BackToTop } from '@/components/ui/BackToTop';
import { Suspense } from 'react';

/**
 * The public marketing site's own chrome (masthead nav + footer),
 * scoped to this route group only -- app/[slug] (private client
 * galleries) and app/admin (the studio's own management panel) sit
 * OUTSIDE (site) specifically so neither ever renders the public
 * Trabajos/Servicios/Contacto navigation around private, gated content.
 * Root layout.tsx keeps only what's genuinely global (fonts, smooth
 * scroll, the skip link, structured data).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Antes de la cabecera en el ORDEN DEL DOM, no en pantalla (el aviso
          es position: fixed abajo, así que se ve igual). Estaba después de
          <main>: para llegar a "Rechazar" con el teclado había que tabular
          por la cabecera, el menú y las decenas de enlaces de la página
          entera -- en /trabajos son diecisiete reportajes. La decisión sobre
          cookies es lo primero que la ley pide y ahora es también lo primero
          que se alcanza (WCAG 2.4.3, orden del foco). */}
      <CookieConsent />
      <Header />
      {/* tabIndex={-1} en el destino del enlace de salto. Sin él, activar
          "Saltar al contenido" mueve el ancla del navegador pero no siempre
          el foco real: el lector de pantalla sigue leyendo desde la cabecera
          y el siguiente Tab vuelve a caer en el menú, que es justo lo que el
          enlace existe para evitar (WCAG 2.4.1). Con -1 el <main> recibe el
          foco de verdad y no entra en el orden de tabulación. El anillo no se
          pinta al hacer clic porque el sitio usa :focus-visible, no :focus
          (styles/globals.css). */}
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Suspense fallback={null}>
        <PageHit />
      </Suspense>
      <Footer />
      <BackToTop />
      <WhatsAppButton />
    </>
  );
}
