'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Sends one anonymous beacon per page view to /api/hit. Cookie-less by
 * design (see lib/analytics-store.ts), so it needs no consent and runs
 * regardless of the cookie banner. Honours Global Privacy Control.
 */
export function PageHit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.globalPrivacyControl) return;

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
