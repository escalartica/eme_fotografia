import { randomBytes } from 'node:crypto';
import {
  hashPassword,
  verifyPassword,
  timingSafeEqualString,
  DUMMY_PASSWORD_HASH,
} from '@/lib/auth/password';

/**
 * La cuenta de administración del estudio. Una sola cuenta, no una tabla de
 * usuarios: content/site.ts modela este negocio como un fotógrafo (site.
 * founderName) y el resto del estado del servidor está acotado igual de
 * mínimamente.
 *
 * ANTES ESTO ERA UNA CONTRASEÑA ESCRITA EN EL CÓDIGO ('EME-fotografia-2026')
 * que se sembraba sola en data/admin/users.json en el primer intento de login.
 * Con el código publicado, esa contraseña la conoce cualquiera: bastaba abrir
 * /admin/login y escribirla para entrar en el panel, crear galerías y ver los
 * datos personales del formulario de contacto. Ahora las credenciales SOLO
 * salen del entorno y no hay ningún valor por defecto ni ninguna siembra
 * automática: si no están configuradas, no se puede entrar de ninguna manera.
 *
 * data/admin/users.json ya NO se lee. Si en una instalación antigua existe ese
 * fichero, es un resto inerte (y conviene borrarlo: contiene el hash de la
 * contraseña pública que traía el repositorio).
 *
 * Variables (ver .env.example):
 *   ADMIN_USERNAME       -- obligatoria.
 *   ADMIN_PASSWORD_HASH  -- forma preferida: `scrypt:<salHex>:<hashHex>`,
 *                           generado con `node scripts/hash-admin-password.mjs`.
 *                           Así la contraseña en claro no existe en ningún
 *                           sitio del hosting.
 *   ADMIN_PASSWORD       -- alternativa en claro, solo si el hosting no deja
 *                           pegar cómodamente el hash. Se convierte a hash en
 *                           memoria al arrancar y nunca se escribe en disco.
 * Hay que fijar exactamente una de las dos de contraseña.
 */

export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

/** Longitud mínima para la variante en claro. No aplica a ADMIN_PASSWORD_HASH:
 * ahí ya no se ve la contraseña y quien genera el hash decide. */
const MIN_PASSWORD_LENGTH = 12;

const HASH_RE = /^scrypt:[0-9a-f]{2,}:[0-9a-f]{2,}$/i;

/**
 * Devuelve un mensaje si la configuración del admin es inválida, o null si
 * está bien. Separado de la carga para que el arranque
 * (instrumentation.ts) pueda fallar de forma ruidosa ANTES de que llegue el
 * primer visitante, en lugar de descubrirlo el día que el estudio intente
 * entrar en el panel.
 */
export function adminConfigProblem(env: NodeJS.ProcessEnv = process.env): string | null {
  const username = env.ADMIN_USERNAME?.trim();
  const hash = env.ADMIN_PASSWORD_HASH?.trim();
  const plain = env.ADMIN_PASSWORD;

  if (!username) {
    return 'Falta ADMIN_USERNAME: el panel de administración no tiene ninguna cuenta configurada.';
  }
  if (!hash && !plain) {
    return 'Falta ADMIN_PASSWORD_HASH (o, en su defecto, ADMIN_PASSWORD): el panel de administración no tiene contraseña configurada.';
  }
  if (hash && plain) {
    return 'ADMIN_PASSWORD_HASH y ADMIN_PASSWORD están las dos fijadas: deja solo una para que no haya duda de cuál manda.';
  }
  if (hash && !HASH_RE.test(hash)) {
    return 'ADMIN_PASSWORD_HASH no tiene el formato `scrypt:<salHex>:<hashHex>`. Genéralo con `node scripts/hash-admin-password.mjs`.';
  }
  if (plain && plain.length < MIN_PASSWORD_LENGTH) {
    return `ADMIN_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

export class AdminConfigError extends Error {}

// El hash de la variante en claro se calcula UNA vez por proceso y se cachea:
// scrypt es caro a propósito, y hacerlo en cada login sumaría su coste al de
// verificar la contraseña recibida, duplicando la latencia de cada entrada.
let cached: Promise<AdminCredentials> | null = null;

/**
 * Credenciales de usar y tirar para desarrollo, cuando no hay ninguna
 * configurada.
 *
 * En producción, un panel sin contraseña configurada es un fallo que tiene que
 * parar el servidor, y eso sigue igual. Pero tumbar también el `npm run dev`
 * significa que nadie puede ni levantar la web en su portátil para ver una
 * página pública hasta que se genere un hash, y eso convierte una medida de
 * seguridad en un obstáculo diario.
 *
 * Así que en desarrollo se genera una contraseña ALEATORIA por arranque y se
 * imprime en la terminal. No se escribe en ningún fichero, no sobrevive al
 * reinicio y no existe en producción: no es una contraseña por defecto que
 * alguien pueda adivinar leyendo el código, que es exactamente lo que se
 * retiró de aquí.
 */
let devCredentials: { username: string; password: string } | null = null;

export function getDevAdminCredentials(): { username: string; password: string } | null {
  if (process.env.NODE_ENV === 'production') return null;
  if (!devCredentials) {
    devCredentials = {
      username: 'eme',
      // 12 bytes en base64url: entra en el mínimo de longitud y se copia y
      // pega de un tirón desde la terminal.
      password: randomBytes(12).toString('base64url'),
    };
  }
  return devCredentials;
}

export function getAdminCredentials(env: NodeJS.ProcessEnv = process.env): Promise<AdminCredentials> {
  const problem = adminConfigProblem(env);
  if (problem) {
    const dev = getDevAdminCredentials();
    if (!dev) return Promise.reject(new AdminConfigError(problem));
    if (!cached) {
      cached = hashPassword(dev.password).then((passwordHash) => ({ username: dev.username, passwordHash }));
    }
    return cached;
  }
  if (cached) return cached;
  const username = env.ADMIN_USERNAME!.trim();
  const hash = env.ADMIN_PASSWORD_HASH?.trim();
  cached = hash
    ? Promise.resolve({ username, passwordHash: hash })
    : hashPassword(env.ADMIN_PASSWORD!).then((passwordHash) => ({ username, passwordHash }));
  return cached;
}

/** Solo para tests: olvida el hash cacheado cuando el test cambia el entorno. */
export function __resetAdminCredentialsCache(): void {
  cached = null;
}

/**
 * Comprueba unas credenciales de administración. Siempre ejecuta scrypt, tanto
 * si el usuario coincide como si no, y compara el usuario en tiempo constante:
 * quien pruebe usuarios no puede distinguir "usuario correcto, contraseña mal"
 * de "usuario inexistente" ni por el mensaje (la ruta devuelve uno solo) ni por
 * el tiempo de respuesta.
 */
export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  const admin = await getAdminCredentials();
  const usernameMatches = timingSafeEqualString(admin.username, username);
  const passwordOk = await verifyPassword(password, usernameMatches ? admin.passwordHash : DUMMY_PASSWORD_HASH);
  return usernameMatches && passwordOk;
}
