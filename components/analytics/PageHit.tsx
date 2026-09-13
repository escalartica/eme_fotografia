'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Sends one anonymous beacon per page view to /api/hit. Cookie-less by
 * design (see lib/analytics-store.ts), so it needs no consent and runs
 * regardless of the cookie banner. Honours Global Privacy Control.
 */

/**
 * LA MARCA PARA NO CONTARSE A UNO MISMO.
 *
 * El estudio entra en su propia web todos los días -- a enseñarla, a revisar
 * una ficha, a copiar un enlace -- y hasta ahora cada una de esas visitas
 * engordaba sus propias estadísticas. Con dos o tres visitas reales al día,
 * eso no es ruido: es la mitad de la tabla, y es la tabla con la que se va a
 * decidir cuánto se gasta en anuncios.
 *
 * Se activa abriendo la web con `?sinestadisticas=1` y se quita con
 * `?sinestadisticas=0`. Queda en `localStorage` de ESE navegador, así que hay
 * que hacerlo una vez en cada aparato; a cambio no hace falta ninguna cookie,
 * ninguna cuenta ni nada en el servidor, y no cambia en nada lo que se
 * guarda de los visitantes de verdad.
 */
const MARCA = 'eme-sin-estadisticas';
const PARAMETRO = 'sinestadisticas';

/** Devuelve true si en este navegador se ha pedido no contar las visitas. */
function excluido(searchParams: URLSearchParams | null): boolean {
  try {
    const orden = searchParams?.get(PARAMETRO);
    if (orden === '1') localStorage.setItem(MARCA, '1');
    if (orden === '0') localStorage.removeItem(MARCA);
    return localStorage.getItem(MARCA) === '1';
  } catch {
    // Navegación privada, almacenamiento bloqueado: no es motivo para dejar
    // de contar a un visitante real.
    return false;
  }
}

export function PageHit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.globalPrivacyControl) return;
    if (excluido(searchParams)) return;

    const utm = ['utm_source', 'utm_medium', 'utm_campaign']
      .map((k) => searchParams?.get(k))
      .filter(Boolean)
      .join(' / ');

    const payload = JSON.stringify({
      p: pathname,
      r: document.referrer || undefined,
      w: window.innerWidth,
      ...(utm ? { u: utm } : {}),
    });

    // sendBeacon survives navigation; fetch keepalive is the fallback.
    if (!navigator.sendBeacon?.('/api/hit', new Blob([payload], { type: 'application/json' }))) {
      fetch('/api/hit', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
    }
  }, [pathname, searchParams]);

  return null;
}
