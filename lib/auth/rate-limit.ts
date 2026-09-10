/**
 * Limitador de peticiones en memoria (ventana deslizante simple) para los
 * logins, el formulario de contacto y el beacon de analítica.
 *
 * Deliberadamente NO se persiste en disco: esto es un sitio de un solo
 * estudio, servido por UN ÚNICO proceso Node (mismo criterio que el resto
 * del estado del proyecto, ficheros bajo data/), así que un Map por proceso
 * basta para frenar fuerza bruta y spam sin meter una dependencia (Redis)
 * que el proyecto no usa para nada más.
 *
 * QUÉ PASA SI ALGÚN DÍA HAY VARIAS INSTANCIAS: cada proceso llevaría su
 * propio contador, así que el límite efectivo se multiplicaría por el número
 * de instancias (2 réplicas = el doble de intentos permitidos) y un reinicio
 * o un redespliegue pone todos los contadores a cero. Si esto se despliega
 * detrás de un balanceador con más de una réplica, o en un runtime serverless
 * donde cada petición puede caer en un proceso nuevo, ESTE MÓDULO DEJA DE
 * SERVIR y hay que sustituirlo por un contador compartido (Redis/Upstash) o
 * por el rate limiting del propio proveedor (Vercel WAF, Cloudflare).
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

/** Ventana y tope por defecto: los logins. */
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 8;

/**
 * Tope duro de claves vivas. Sin esto, un atacante que falsifique
 * X-Forwarded-For con un valor distinto en cada petición crea una entrada
 * nueva por petición y el Map crece sin límite hasta tumbar el proceso por
 * memoria: el propio limitador se convierte en el vector de denegación de
 * servicio que venía a evitar. Al llegar al tope se purgan primero las
 * ventanas caducadas y, si aun así no baja, se vacía entero (fail-open
 * momentáneo, preferible a caerse).
 */
const MAX_KEYS = 20000;

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS) buckets.delete(key);
  }
}

function guardSize(now: number): void {
  if (buckets.size < MAX_KEYS) return;
  prune(now);
  if (buckets.size >= MAX_KEYS) buckets.clear();
}

/** Devuelve true si esta clave todavía puede intentarlo. */
export function checkRateLimit(key: string, max: number = MAX_ATTEMPTS, windowMs: number = WINDOW_MS): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    guardSize(now);
    buckets.set(key, { count: 0, windowStart: now });
    return true;
  }
  return bucket.count < max;
}

/** Llamar tras CADA intento, con éxito o sin él -- un login correcto no
 * exime la clave, así que una contraseña filtrada tampoco se puede reutilizar
 * a velocidad ilimitada. */
export function recordAttempt(key: string, windowMs: number = WINDOW_MS): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    guardSize(now);
    buckets.set(key, { count: 1, windowStart: now });
    return;
  }
  bucket.count += 1;
}

/**
 * Comprobar y contar en una sola llamada: es lo que quieren las rutas que no
 * son de login (contacto, hit), donde toda petición cuenta, no solo los
 * fallos. Devuelve true si la petición se permite.
 */
export function consume(key: string, max: number, windowMs: number): boolean {
  const allowed = checkRateLimit(key, max, windowMs);
  recordAttempt(key, windowMs);
  return allowed;
}

/**
 * Identificador del cliente, en la medida en que se puede saber. X-Forwarded-For
 * es una PISTA, no una identidad: cualquiera puede falsificarlo, así que un
 * atacante puede darse una "IP" nueva en cada petición y saltarse cualquier
 * límite que dependa solo de esto. Por eso todas las rutas que llaman aquí
 * combinan esta clave con una segunda clave global (por cuenta, por galería o
 * por ruta) que no depende de ninguna cabecera y que sí pone un techo absoluto.
 */
export function clientKeyFrom(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Solo para los tests: cada fichero de test empieza con los contadores a
 * cero, si no el orden de ejecución decidiría qué test se come el límite. */
export function __resetRateLimits(): void {
  buckets.clear();
}
