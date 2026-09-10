import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Server-side session store, same file-per-record shape as
 * lib/contact-store.ts. Sessions are opaque random tokens, not JWTs: no
 * new dependency needed (no jose/jsonwebtoken), and unlike a JWT an
 * opaque token can be revoked instantly on logout by deleting its file --
 * a signed-but-stateless JWT would keep validating until it expired even
 * after "logout". The token itself is never written to disk; only a
 * SHA-256 hash of it is, so reading data/sessions/ (e.g. a misconfigured
 * static file server, a backup leak) never yields a token an attacker
 * could present as a cookie -- the same reason password hashes, not
 * passwords, are what gets stored.
 */

export type SessionRole = 'admin' | 'client';

export interface Session {
  role: SessionRole;
  /** Admin sessions: the admin username. Client sessions: the gallery slug. */
  subject: string;
  username: string;
  createdAt: string;
  expiresAt: string;
}

const SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions');
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const CLIENT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days -- clients
// revisit a gallery over weeks while deciding; a short-lived session would
// make them re-enter the password on every visit, and re-authenticating
// changes nothing about how sensitive that time window is (the same
// password gates access whether the session is 1 day or 30).

function tokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sessionFile(token: string): string {
  return path.join(SESSIONS_DIR, `${tokenHash(token)}.json`);
}

/**
 * Barrido oportunista de sesiones caducadas. getSession ya borra la suya
 * cuando la encuentra caducada, pero una sesión que nadie vuelve a usar (el
 * cliente que abrió su galería una vez y no volvió) no la mira nadie nunca:
 * sin esto, data/sessions/ solo crece. Se ejecuta al crear una sesión, que es
 * un momento raro y ya lento por scrypt, así que no añade coste a ninguna
 * petición normal. Los fallos se ignoran: limpiar es opcional, iniciar sesión
 * no.
 */
async function purgeExpiredSessions(): Promise<void> {
  try {
    const now = Date.now();
    const files = await fs.readdir(SESSIONS_DIR);
    await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith('.json')) return;
        try {
          const raw = await fs.readFile(path.join(SESSIONS_DIR, file), 'utf-8');
          const record = JSON.parse(raw) as Session;
          if (new Date(record.expiresAt).getTime() < now) {
            await fs.unlink(path.join(SESSIONS_DIR, file));
          }
        } catch {
          /* fichero ilegible o ya borrado: nada que hacer */
        }
      })
    );
  } catch {
    /* el directorio aún no existe */
  }
}

export async function createSession(
  role: SessionRole,
  subject: string,
  username: string
): Promise<{ token: string; maxAgeSeconds: number }> {
  // 0o700/0o600: aunque en disco solo va el HASH del token (nunca el token),
  // el fichero dice quién tiene sesión abierta y hasta cuándo. En un servidor
  // compartido, el modo por defecto lo deja legible para el resto de cuentas.
  await fs.mkdir(SESSIONS_DIR, { recursive: true, mode: 0o700 });
  await purgeExpiredSessions();
  const token = crypto.randomBytes(32).toString('base64url');
  const ttlMs = role === 'admin' ? ADMIN_SESSION_TTL_MS : CLIENT_SESSION_TTL_MS;
  const now = Date.now();
  const record: Session = {
    role,
    subject,
    username,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttlMs).toISOString(),
  };
  await fs.writeFile(sessionFile(token), JSON.stringify(record, null, 2), { mode: 0o600 });
  return { token, maxAgeSeconds: Math.floor(ttlMs / 1000) };
}

export async function getSession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const raw = await fs.readFile(sessionFile(token), 'utf-8');
    const record = JSON.parse(raw) as Session;
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      await destroySession(token);
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  try {
    await fs.unlink(sessionFile(token));
  } catch {
    // Already gone -- logout is idempotent.
  }
}
