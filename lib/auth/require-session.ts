import { cookies } from 'next/headers';
import { getSession, type Session } from './session';
import { ADMIN_COOKIE, CLIENT_COOKIE } from './cookies';

/**
 * Read-only session lookups for Server Components (pages) and Route
 * Handlers alike -- next/headers's cookies() works in both. These are
 * the single choke point every protected page/route calls through, so
 * "what counts as a valid admin/client session" only has one definition
 * in the whole app.
 */

export async function getAdminSession(): Promise<Session | null> {
  const jar = await cookies();
  const session = await getSession(jar.get(ADMIN_COOKIE)?.value);
  return session?.role === 'admin' ? session : null;
}

/** Valid only when the session is both a client session AND scoped to
 * THIS gallery's slug -- a session for gallery A must never authorize
 * gallery B just because both cookies happen to be present. */
export async function getClientSession(slug: string): Promise<Session | null> {
  const jar = await cookies();
  const session = await getSession(jar.get(CLIENT_COOKIE)?.value);
  return session?.role === 'client' && session.subject === slug ? session : null;
}
