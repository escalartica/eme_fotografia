import { NextResponse } from 'next/server';
import { canjearToken, guardarPassword, MIN_LONGITUD } from '@/lib/admin-recovery';
import { olvidarCredenciales, getAdminCredentials } from '@/lib/admin-store';
import { destroySessionsForSubject } from '@/lib/auth/session';
import { consume, clientKeyFrom } from '@/lib/auth/rate-limit';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

/**
 * CANJEAR EL ENLACE Y DEJAR PUESTA LA CONTRASEÑA NUEVA.
 *
 * El orden de las cuatro operaciones del final no es casual:
 *   1. canjear (borra el enlace)  -- para que dos pestañas abiertas con el
 *      mismo enlace no puedan cambiar la contraseña dos veces;
 *   2. guardar la nueva;
 *   3. olvidar el hash cacheado en memoria -- sin esto el proceso seguiría
 *      aceptando la vieja hasta que alguien lo reiniciase, que es el fallo
 *      más caro posible aquí porque nadie lo nota;
 *   4. cerrar todas las sesiones abiertas -- si se ha llegado aquí porque
 *      alguien más podía tener la contraseña, dejar su sesión viva no arregla
 *      nada.
 */
const INTENTOS = 10;
const UNA_HORA = 60 * 60 * 1000;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }
  if (!consume(`recuperar-confirmar:${clientKeyFrom(request)}`, INTENTOS, UNA_HORA) ||
      !consume('recuperar-confirmar:cuenta', INTENTOS, UNA_HORA)) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un rato.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 400 });
  }
  const { token, password } = (body ?? {}) as { token?: unknown; password?: unknown };
  if (typeof token !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 400 });
  }
  if (password.length < MIN_LONGITUD) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_LONGITUD} caracteres.` },
      { status: 400 }
    );
  }

  if (!(await canjearToken(token))) {
    return NextResponse.json(
      { error: 'Este enlace ya no sirve: ha caducado o se ha usado. Pide otro desde la pantalla de acceso.' },
      { status: 400 }
    );
  }

  await guardarPassword(password);
  olvidarCredenciales();
  const { username } = await getAdminCredentials();
  await destroySessionsForSubject('admin', username);

  return NextResponse.json({ ok: true });
}
