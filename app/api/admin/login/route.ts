import { NextResponse } from 'next/server';
import { verifyAdminLogin, getAdminCredentials, AdminConfigError } from '@/lib/admin-store';
import { createSession } from '@/lib/auth/session';
import { ADMIN_COOKIE, cookieOptions } from '@/lib/auth/cookies';
import { checkRateLimit, recordAttempt, clientKeyFrom } from '@/lib/auth/rate-limit';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

const GENERIC_ERROR = 'Usuario o contraseña incorrectos.';
const TOO_MANY = 'Demasiados intentos. Inténtalo de nuevo más tarde.';

// Dos cubos, no uno. El de IP (8 intentos / 15 min) frena al atacante normal.
// El GLOBAL es el que importa de verdad: la clave por IP sale de
// X-Forwarded-For, que cualquiera puede falsificar poniendo una IP distinta en
// cada petición, y con eso el límite por IP no frena absolutamente nada. El
// cubo global no depende de ninguna cabecera, así que pone un techo absoluto
// de intentos contra la única cuenta que existe.
//
// BAJADO DE 40 A 15. Cuarenta cada quince minutos son 3.840 al día contra un
// único usuario conocido, que para un diccionario no es ridículo: es un
// presupuesto. Quince siguen siendo de sobra para la única persona que entra
// aquí -- si se equivoca quince veces seguidas al teclear, el problema no es
// el limitador --, y bajan el presupuesto del atacante a 1.440 al día.
// El precio de bajarlo: quien pase scripts/pentest.mjs contra el sitio deja la
// cuenta bloqueada quince minutos. Está avisado en el propio script.
export const IP_MAX = 8;
const GLOBAL_KEY = 'admin:cuenta';
/** Exportado a propósito: la prueba de fuerza bruta lo importa en vez de
 *  repetir el número. Cuando se movió de 40 a 15, la prueba seguía contando
 *  40 intentos y empezó a fallar -- un número copiado en dos sitios es un
 *  número que se va a desincronizar. */
export const GLOBAL_MAX = 15;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 403 });
  }

  const ipKey = `admin:ip:${clientKeyFrom(request)}`;
  if (!checkRateLimit(ipKey, IP_MAX) || !checkRateLimit(GLOBAL_KEY, GLOBAL_MAX)) {
    return NextResponse.json({ error: TOO_MANY }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }
  const { username, password } = (body ?? {}) as { username?: unknown; password?: unknown };
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    recordAttempt(ipKey);
    recordAttempt(GLOBAL_KEY);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  recordAttempt(ipKey);
  recordAttempt(GLOBAL_KEY);

  let ok: boolean;
  try {
    ok = await verifyAdminLogin(username, password);
  } catch (err) {
    if (err instanceof AdminConfigError) {
      // El servidor no tiene cuenta configurada. Al cliente se le da el mismo
      // mensaje genérico que a una contraseña mal escrita -- que /admin exista
      // pero esté sin configurar es información que no le hace falta a nadie
      // de fuera. El detalle va al log del servidor, donde lo verá quien
      // despliega. instrumentation.ts ya debería haber impedido llegar aquí.
      console.error(`[admin] configuración inválida: ${err.message}`);
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }
    throw err;
  }

  if (!ok) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const { username: adminUsername } = await getAdminCredentials();
  const { token, maxAgeSeconds } = await createSession('admin', adminUsername, adminUsername);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, cookieOptions(maxAgeSeconds));
  return response;
}
