import { NextResponse } from 'next/server';
import { getGalleryMeta } from '@/lib/gallery-store';
import { verifyPassword, timingSafeEqualString, DUMMY_PASSWORD_HASH } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { CLIENT_COOKIE, cookieOptions } from '@/lib/auth/cookies';
import { checkRateLimit, recordAttempt, clientKeyFrom } from '@/lib/auth/rate-limit';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

// Single generic message for every failure mode (gallery doesn't exist,
// wrong username, wrong password) -- never reveals which one, so a
// caller can't enumerate valid gallery slugs or usernames by watching
// which error comes back.
const GENERIC_ERROR = 'Usuario o contraseña incorrectos.';

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 403 });
  }

  const { slug } = await params;
  // Igual que en /api/admin/login: dos cubos. El de IP frena al atacante
  // normal; el de galería (sin cabeceras de por medio) es el que un
  // X-Forwarded-For falsificado no puede multiplicar, y es lo único que
  // pone un techo real a probar contraseñas contra la boda de un cliente.
  const ipKey = `galeria:${slug}:${clientKeyFrom(request)}`;
  const slugKey = `galeria:${slug}`;
  if (!checkRateLimit(ipKey) || !checkRateLimit(slugKey, 40)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Inténtalo de nuevo más tarde.' },
      { status: 429 }
    );
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
    recordAttempt(slugKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const meta = await getGalleryMeta(slug);
  recordAttempt(ipKey);
  recordAttempt(slugKey);

  // Siempre se ejecuta verifyPassword, aunque la galería o el usuario no
  // existan, contra un hash imposible (DUMMY_PASSWORD_HASH) -- así una
  // petición contra una galería inexistente tarda lo mismo que una con la
  // contraseña mal, en vez de responder al instante y delatar por tiempo qué
  // slugs existen. El usuario se compara también en tiempo constante.
  const usernameMatches = !!meta && timingSafeEqualString(meta.username, username);
  const passwordOk = await verifyPassword(password, usernameMatches ? meta!.passwordHash : DUMMY_PASSWORD_HASH);

  if (!meta || !usernameMatches || !passwordOk) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const { token, maxAgeSeconds } = await createSession('client', slug, username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CLIENT_COOKIE, token, cookieOptions(maxAgeSeconds));
  return response;
}
