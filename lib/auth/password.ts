import crypto from 'node:crypto';

/**
 * Password hashing with Node's built-in scrypt -- no bcrypt/argon2
 * dependency. scrypt is the algorithm Node's own crypto docs use as the
 * canonical "hash a password" example (see
 * https://nodejs.org/api/crypto.html#using-strings-as-inputs-to-cryptographic-apis),
 * and it is a memory-hard KDF, the same design goal bcrypt/argon2 serve.
 *
 * Stored format: `scrypt:<saltHex>:<hashHex>` -- versioned prefix so a
 * future algorithm change (e.g. if this project later adds a real
 * dependency) can coexist with old hashes instead of invalidating every
 * stored password at once.
 */

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // N=16384 (2^14) is Node's own documented default cost factor --
    // deliberately not raised further: this app's login routes are
    // synchronous per-request (no worker/queue), so a heavier cost
    // directly extends every legitimate login's latency, not just an
    // attacker's brute-force cost.
    crypto.scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derived = await scryptAsync(password, salt);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

/**
 * Timing-safe verification. Never short-circuits on a length/format
 * mismatch by returning early with a plain `false` from unequal-length
 * comparison logic alone -- `crypto.timingSafeEqual` itself throws on
 * mismatched buffer lengths, so that case is caught and treated as "not
 * a match" rather than allowed to leak timing information via a thrown
 * exception path that behaves differently from the equal-length path.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, saltHex, hashHex] = parts;
  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scryptAsync(password, salt);
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * Hash con formato válido pero que ninguna contraseña puede satisfacer (la
 * sal y el digest son ceros). Sirve para gastar exactamente el mismo tiempo
 * de scrypt cuando el usuario/la galería NO existe que cuando sí existe: sin
 * esto, "no existe" responde en microsegundos y "contraseña incorrecta" en
 * decenas de milisegundos, y esa diferencia es un oráculo para enumerar
 * usuarios o slugs de galería válidos.
 */
export const DUMMY_PASSWORD_HASH =
  'scrypt:00000000000000000000000000000000:' + '0'.repeat(128);

/**
 * Comparación de cadenas en tiempo constante para valores NO secretos-pero-
 * enumerables (el nombre de usuario). `a === b` en JavaScript sale en cuanto
 * encuentra el primer carácter distinto, así que el tiempo de respuesta filtra
 * cuántos caracteres del usuario se han acertado. Se compara sobre el digest
 * SHA-256 de cada valor para que ambos búferes midan siempre lo mismo y
 * `timingSafeEqual` no lance por longitudes distintas (que es, en sí, otra
 * fuga: revelaría la longitud del usuario real).
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const da = crypto.createHash('sha256').update(a).digest();
  const db = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(da, db);
}
