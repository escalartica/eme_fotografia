import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * First-party, cookie-less analytics. One line of NDJSON per page view in
 * data/analytics/YYYY-MM-DD.ndjson. Nothing here identifies a person:
 * no cookie, no localStorage, no IP stored. "Unique visitors" are counted
 * with a hash of (daily rotating salt + IP + user agent) that cannot be
 * reversed and changes every day, which is the model Plausible/Fathom use
 * and the reason the AEPD/CNIL do not treat it as needing consent.
 */

export interface Hit {
  /** ISO timestamp. */
  t: string;
  /** Path visited (query string stripped). */
  p: string;
  /** Referrer host, or 'directo' when there was none. */
  r: string;
  /** Daily visitor hash (12 hex chars). */
  v: string;
  /** Device class from the viewport width. */
  d: 'móvil' | 'tablet' | 'escritorio';
  /** Optional utm_source / utm_medium / utm_campaign, when the URL had them. */
  u?: string;
}

export const ANALYTICS_DIR = path.join(process.cwd(), 'data', 'analytics');

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headless|pingdom|monitor|curl|wget|python-requests/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_RE.test(userAgent);
}

export function deviceFromWidth(width: number | undefined): Hit['d'] {
  if (!width || width < 768) return 'móvil';
  if (width < 1100) return 'tablet';
  return 'escritorio';
}

/**
 * EL ÚNICO CAMPO DEL BEACON QUE NO TENÍA TOPE, y por ahí se llenaba el disco.
 *
 * Todos los demás lo tenían: `p` se recorta a 200 en `normalisePath`, `u` a
 * 120 en la ruta, `d` es un enumerado de tres valores. Éste devolvía
 * `new URL(referrer).hostname` tal cual, y un `hostname` puede medir lo que
 * quiera quien envía la petición: con `http://` + 60.000 letras + `.com` se
 * escribía una línea de 60 KB en el NDJSON del día. El cupo de esta ruta son
 * 5.000 peticiones por hora y nginx acepta cuerpos de hasta 64 MB: son
 * centenares de gigas por hora contra un VPS con 115 GB de disco.
 *
 * Y llenar el disco no tira sólo la analítica: deja de poder escribirse
 * `data/sessions/` (nadie entra en el panel), `data/contact-submissions/`
 * (se pierden los mensajes de las parejas) y las subidas de galerías.
 *
 * Dos topes, no uno. El de dentro (100) porque un host real no pasa de 253
 * bytes y para una estadística sobran cien. El de fuera, en la ruta, porque
 * si el propio `referrer` es una cadena de 60 MB, `new URL()` ya ha tenido
 * que construirla en memoria antes de que aquí se pueda recortar nada.
 */
const MAX_HOST = 100;

export function referrerHost(referrer: string | undefined, ownHost: string): string {
  if (!referrer) return 'directo';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (!host || host === ownHost.replace(/^www\./, '') || host === 'localhost') return 'directo';
    return host.length > MAX_HOST ? host.slice(0, MAX_HOST) : host;
  } catch {
    return 'directo';
  }
}

/** Only the first path segment matters for privacy; strip the query. */
export function normalisePath(raw: string): string | null {
  try {
    const url = new URL(raw, 'http://x');
    const p = url.pathname.replace(/\/+$/, '') || '/';
    if (p.startsWith('/admin') || p.startsWith('/api') || p.startsWith('/_next')) return null;
    return p.length > 200 ? p.slice(0, 200) : p;
  } catch {
    return null;
  }
}

async function dailySalt(dir: string, day: string): Promise<string> {
  // A per-install secret so the same IP+UA never hashes the same on two
  // deployments; kept next to the data, generated on first use.
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const secretFile = path.join(dir, '.secret');
  let secret: string;
  try {
    secret = (await fs.readFile(secretFile, 'utf-8')).trim();
  } catch {
    secret = crypto.randomBytes(32).toString('hex');
    await fs.writeFile(secretFile, secret, { mode: 0o600 });
  }
  return crypto.createHash('sha256').update(`${secret}:${day}`).digest('hex');
}

export async function visitorHash(ip: string, userAgent: string, day: string, dir: string = ANALYTICS_DIR): Promise<string> {
  const salt = await dailySalt(dir, day);
  return crypto.createHash('sha256').update(`${salt}:${ip}:${userAgent}`).digest('hex').slice(0, 12);
}

/**
 * Cuántos días se conservan. Los rangos del panel no pasan de 90, así que
 * borrar lo anterior no quita nada que se pueda mirar -- y sin este número
 * `data/analytics/` crecía para siempre: un fichero por día, uno por visita,
 * y nadie borrando nunca.
 *
 * Va aquí y no en un cron del servidor a propósito: un borrado que vive en
 * `/etc/cron.daily` es un borrado que se pierde el día que se reinstale la
 * máquina, y este dato lleva un identificador pseudonimizado. Que el plazo de
 * conservación viva en el mismo fichero que lo escribe es lo que hace que la
 * frase del §3 de /privacidad siga siendo verdad sin que nadie se acuerde.
 */
export const DIAS_QUE_SE_CONSERVAN = 90;

/** Cada cuánto se molesta en mirar si hay algo que borrar. Sin esto, cada
 *  visita listaría el directorio entero. */
const CADA_CUANTO_MS = 6 * 60 * 60 * 1000;
let ultimaPurga = 0;

/**
 * Borra los ficheros de día anteriores al plazo. Silencioso a propósito: es
 * mantenimiento, y que falle no puede tumbar la petición de una visita.
 */
export async function purgarAntiguos(dir: string = ANALYTICS_DIR, now: Date = new Date()): Promise<number> {
  const corte = new Date(now);
  corte.setUTCDate(corte.getUTCDate() - DIAS_QUE_SE_CONSERVAN);
  const limite = corte.toISOString().slice(0, 10);
  let borrados = 0;
  try {
    for (const nombre of await fs.readdir(dir)) {
      const m = /^(\d{4}-\d{2}-\d{2})\.ndjson$/.exec(nombre);
      if (!m || m[1] >= limite) continue;
      await fs.rm(path.join(dir, nombre), { force: true });
      borrados += 1;
    }
  } catch {
    // El directorio puede no existir todavía. No es un problema.
  }
  return borrados;
}

export async function recordHit(hit: Hit, dir: string = ANALYTICS_DIR): Promise<void> {
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const day = hit.t.slice(0, 10);
  // `mode` explícito, como todo lo demás que se escribe bajo `data/`: era el
  // único sitio del proyecto que se fiaba del umask.
  await fs.appendFile(path.join(dir, `${day}.ndjson`), JSON.stringify(hit) + '\n', { mode: 0o600 });

  // La purga va DESPUÉS de escribir y sin esperarla: el beacon de una visita
  // no puede quedarse colgado de una tarea de mantenimiento.
  const ahora = Date.now();
  if (ahora - ultimaPurga > CADA_CUANTO_MS) {
    ultimaPurga = ahora;
    void purgarAntiguos(dir).catch(() => {});
  }
}

export async function readHits(days: number, dir: string = ANALYTICS_DIR, now: Date = new Date()): Promise<Hit[]> {
  const hits: Hit[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const day = d.toISOString().slice(0, 10);
    try {
      const raw = await fs.readFile(path.join(dir, `${day}.ndjson`), 'utf-8');
      for (const line of raw.split('\n')) {
        if (!line) continue;
        try {
          hits.push(JSON.parse(line) as Hit);
        } catch {
          /* skip a torn line */
        }
      }
    } catch {
      /* no file for that day */
    }
  }
  return hits;
}

export interface Summary {
  days: number;
  pageViews: number;
  visitors: number;
  perDay: { day: string; views: number; visitors: number }[];
  pages: { key: string; count: number }[];
  referrers: { key: string; count: number }[];
  devices: { key: string; count: number }[];
  campaigns: { key: string; count: number }[];
}

function top(map: Map<string, number>, limit = 12) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

export function summarise(hits: Hit[], days: number, now: Date = new Date()): Summary {
  const pages = new Map<string, number>();
  const referrers = new Map<string, number>();
  const devices = new Map<string, number>();
  const campaigns = new Map<string, number>();
  const perDayMap = new Map<string, { views: number; visitors: Set<string> }>();
  const visitors = new Set<string>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    perDayMap.set(d.toISOString().slice(0, 10), { views: 0, visitors: new Set() });
  }

  for (const h of hits) {
    pages.set(h.p, (pages.get(h.p) ?? 0) + 1);
    referrers.set(h.r, (referrers.get(h.r) ?? 0) + 1);
    devices.set(h.d, (devices.get(h.d) ?? 0) + 1);
    if (h.u) campaigns.set(h.u, (campaigns.get(h.u) ?? 0) + 1);
    const day = h.t.slice(0, 10);
    // Visitor hashes rotate daily, so uniques are per day and summed.
    visitors.add(`${day}:${h.v}`);
    const bucket = perDayMap.get(day);
    if (bucket) {
      bucket.views++;
      bucket.visitors.add(h.v);
    }
  }

  return {
    days,
    pageViews: hits.length,
    visitors: visitors.size,
    perDay: [...perDayMap.entries()].map(([day, b]) => ({ day, views: b.views, visitors: b.visitors.size })),
    pages: top(pages),
    referrers: top(referrers),
    devices: top(devices, 3),
    campaigns: top(campaigns, 8),
  };
}
