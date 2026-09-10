/**
 * Shared cookie names/options so the Route Handlers that SET these
 * cookies (via NextResponse) and the Server Components that READ them
 * (via next/headers's cookies()) can never drift apart on name, path or
 * flags -- a mismatch here is exactly how an auth cookie silently stops
 * being sent.
 */

export const ADMIN_COOKIE = 'eme_admin_session';
export const CLIENT_COOKIE = 'eme_gallery_session';

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    // Lax, not Strict: a client opening their gallery link from an email
    // client or messaging app is a top-level cross-site navigation --
    // Strict would drop the cookie on that very first visit and make the
    // link look broken. Lax still blocks the cookie being attached to a
    // cross-site POST, which is the case that matters for CSRF.
    sameSite: 'lax' as const,
    // Secure only in production: the local dev server the site owner
    // tests against runs on plain http://localhost, where a Secure
    // cookie would silently never be set at all.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}
