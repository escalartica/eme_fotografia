import { headers } from 'next/headers';
import { consume, clientKeyFrom } from '@/lib/auth/rate-limit';
import { isSameOriginRequest } from '@/lib/auth/origin-check';
import {
  deviceFromWidth,
  isBot,
  normalisePath,
  recordHit,
  referrerHost,
  visitorHash,
} from '@/lib/analytics-store';

/**
 * Receives one beacon per page view from components/analytics/PageHit.tsx.
 * No cookies are read or set; the IP is used once to compute the daily
 * visitor hash and is never written anywhere.
 */
// Cada petición aceptada añade una línea a data/analytics/<día>.ndjson. Sin
// freno, cualquiera con un bucle de curl llena el disco del servidor y, de
// paso, deja las estadísticas del estudio inservibles. 120 por hora y
// dirección dan de sobra para una visita real (una línea por página vista) y
// el cubo global pone el techo absoluto que un X-Forwarded-For falsificado no
// puede saltarse.
const PER_IP_MAX = 120;
const GLOBAL_MAX = 5000;
const WINDOW_MS = 60 * 60 * 1000; // 1 hora

export async function POST(request: Request) {
  // Este beacon solo lo emite el propio sitio (components/analytics/PageHit).
  // Una petición con Origin de otro dominio es, por definición, alguien
  // inyectando visitas falsas en las estadísticas del estudio.
  if (!isSameOriginRequest(request)) {
    return new Response(null, { status: 403 });
  }
  const ipAllowed = consume(`hit:ip:${clientKeyFrom(request)}`, PER_IP_MAX, WINDOW_MS);
  const globalAllowed = consume('hit:global', GLOBAL_MAX, WINDOW_MS);
  // 204, no 429: esto es telemetría, y devolver un error visible al navegador
  // de un visitante legítimo que simplemente navega mucho no aporta nada. Se
  // descarta la visita en silencio.
  if (!ipAllowed || !globalAllowed) return new Response(null, { status: 204 });

  let body: { p?: string; r?: string; w?: number; u?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response(null, { status: 400 });
  }

  const h = await headers();
  const ua = h.get('user-agent');
  if (isBot(ua)) return new Response(null, { status: 204 });

  const path = normalisePath(body.p ?? '');
  if (!path) return new Response(null, { status: 204 });

  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || '0.0.0.0';
  const ownHost = h.get('host') ?? '';
  const now = new Date();
  const day = now.toISOString().slice(0, 10);

  try {
    await recordHit({
      t: now.toISOString(),
      p: path,
      r: referrerHost(body.r, ownHost),
      v: await visitorHash(ip, ua ?? '', day),
      d: deviceFromWidth(typeof body.w === 'number' ? body.w : undefined),
      ...(body.u ? { u: String(body.u).slice(0, 120) } : {}),
    });
  } catch (err) {
    console.error('[analytics] no se pudo guardar la visita', err);
  }
  return new Response(null, { status: 204 });
}
