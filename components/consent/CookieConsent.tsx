'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import styles from './CookieConsent.module.css';
import { useCapaCompleta } from '@/lib/hooks/useCapaCompleta';

export type Consent = 'accepted' | 'rejected';
const KEY = 'eme-consent';
const EVENT = 'eme-consent-change';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: Consent; at: number };
    // Ask again after 12 months.
    if (Date.now() - parsed.at > 365 * 24 * 3600 * 1000) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function writeConsent(value: Consent) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
  } catch {
    /* storage unavailable: the banner will simply show again next visit */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

/**
 * Cookie banner + consent-gated analytics, in one place so the two can
 * never disagree. Only technical cookies run by default; Google Analytics
 * 4 (when NEXT_PUBLIC_GA_ID is set) loads only after an explicit "Aceptar",
 * with IP anonymisation and no ad signals. Rejecting is one click and as
 * prominent as accepting. The decision is remembered for 12 months and can
 * be changed from /cookies.
 */
export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);

  /**
   * NO APARECER MIENTRAS HAY UNA CAPA TAPANDO LA PÁGINA.
   *
   * Dos capas distintas, un solo gancho (lib/hooks/useCapaCompleta.ts):
   *
   * 1. LA SECUENCIA DE APERTURA (components/motion/CinematicIntro.tsx) marca
   *    con `inert` todo lo que hay fuera de ella mientras se reproduce, para
   *    que nadie tabule por una web que no ve. `inert` alcanza a todo el
   *    subárbol, y este aviso vive dentro de uno de esos hermanos: durante
   *    esos 2,25 s los botones se pintaban pero no respondían. Y se veía: a
   *    partir del fotograma 1,5 el telón ya se ha levantado y el aviso está a
   *    la vista, todavía inerte. Quien lo pulsaba ahí no obtenía nada, volvía
   *    a pulsar, y a la tercera --ya con la secuencia desmontada-- funcionaba.
   *    Parecía un botón que falla, no una web que aún no ha llegado.
   *
   * 2. EL MENÚ DEL TELÉFONO, que se cuelga del <body> y tapa la pantalla
   *    entera. Este aviso va a z-index 250 y el menú a 100, así que se
   *    pintaba por delante de la navegación.
   *
   * Comprobarlo al montar no sirve: la secuencia decide si se reproduce
   * leyendo sessionStorage DESPUÉS del primer render (no puede hacerlo
   * durante, o el servidor y el cliente no coincidirían), así que se monta un
   * instante después que esto. Por eso el gancho vigila el documento en vez
   * de leerlo una vez.
   */
  const tapado = useCapaCompleta();

  useEffect(() => {
    // Read after mount so the server render matches the client's first frame.
    const timer = window.setTimeout(() => {
      setConsent(readConsent());
      setReady(true);
    }, 0);
    const onChange = (e: Event) => setConsent((e as CustomEvent<Consent>).detail);
    window.addEventListener(EVENT, onChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(EVENT, onChange);
    };
  }, []);

  const decide = useCallback((value: Consent) => {
    writeConsent(value);
    setConsent(value);
  }, []);

  const showBanner = ready && consent === null && !tapado;
  const loadAnalytics = consent === 'accepted' && !!GA_ID;

  return (
    <>
      {showBanner && (
        <div className={styles.banner} role="region" aria-label="Aviso de cookies">
          <p className={styles.text}>
            Usamos cookies técnicas imprescindibles y, solo si nos lo permites, cookies analíticas para saber qué
            páginas se visitan. Más detalles en la <Link href="/cookies">política de cookies</Link>.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.reject} onClick={() => decide('rejected')}>
              Rechazar
            </button>
            <button type="button" className={styles.accept} onClick={() => decide('accepted')}>
              Aceptar
            </button>
          </div>
        </div>
      )}
      {loadAnalytics && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('config', '${GA_ID}', { anonymize_ip: true, allow_google_signals: false });`}
          </Script>
        </>
      )}
    </>
  );
}

/** Reopens the choice (used from /cookies). */
export function CookiePreferencesButton({ className }: { className?: string }) {
  const [current, setCurrent] = useState<Consent | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setCurrent(readConsent()), 0);
    const onChange = (e: Event) => setCurrent((e as CustomEvent<Consent>).detail);
    window.addEventListener(EVENT, onChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(EVENT, onChange);
    };
  }, []);
  const next: Consent = current === 'accepted' ? 'rejected' : 'accepted';
  return (
    <button type="button" className={className} onClick={() => writeConsent(next)}>
      {current === 'accepted' ? 'Rechazar cookies analíticas' : 'Aceptar cookies analíticas'}
    </button>
  );
}
