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
//
// EL TECHO GLOBAL ESTUVO EN 5.000 Y SE QUEDABA CORTO PARA UN DÍA BUENO. Cada
// página vista es una línea, así que una visita que mira cinco bodas son seis
// o siete: 5.000 son unos 700 visitantes en una hora, y una publicación que
// funcione en Instagram los trae. Lo que pasaba al llegar al tope no era un
// error visible, era peor: las visitas se tiraban en silencio justo en la
// hora punta, es decir, se perdía exactamente el dato por el que se hace la
// campaña. 30.000 líneas por hora son ~3,5 MB en el peor caso, que sigue
// siendo un techo de sobra para lo que esto tiene que frenar.
const PER_IP_MAX = 120;
const GLOBAL_MAX = 30000;
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
      // Recortado ANTES de llegar a `referrerHost`: ahí dentro el recorte ya
      // llegaría tarde, porque `new URL()` habría construido la cadena entera
      // en memoria. 2.048 es holgado para cualquier referrer real y cierra la
      // amplificación (ver el comentario de MAX_HOST en analytics-store.ts).
      r: referrerHost(typeof body.r === 'string' ? body.r.slice(0, 2048) : undefined, ownHost),
      v: await visitorHash(ip, ua ?? '', day),
      d: deviceFromWidth(typeof body.w === 'number' ? body.w : undefined),
      ...(body.u ? { u: String(body.u).slice(0, 120) } : {}),
    });
  } catch (err) {
    console.error('[analytics] no se pudo guardar la visita', err);
  }
  return new Response(null, { status: 204 });
}
