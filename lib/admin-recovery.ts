import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { hashPassword, timingSafeEqualString } from '@/lib/auth/password';

/**
 * RECUPERAR LA CONTRASEÑA DEL PANEL SIN DEPENDER DE NADIE.
 *
 * El panel lo usa una sola persona y su contraseña vive en una variable de
 * entorno del servidor. Hasta ahora, olvidarla significaba entrar por SSH y
 * regenerar un hash a mano: para quien lleva el estudio, eso es quedarse
 * fuera de su propio trabajo hasta que alguien con acceso al servidor tenga un
 * rato. Esto lo arregla por el único camino que ella controla sola -- su
 * correo.
 *
 * CÓMO FUNCIONA, y por qué cada pieza está donde está:
 *
 * 1. Se pide un enlace desde /admin/recuperar. NO hay campo de correo: el
 *    destino lo decide el servidor y siempre es el buzón del estudio. Un
 *    formulario que acepta una dirección es un formulario que le manda el
 *    enlace a quien la escriba.
 * 2. Se genera un secreto de 32 bytes. En disco se guarda SOLO su SHA-256,
 *    igual que las sesiones: quien lea el fichero no puede fabricar el enlace.
 * 3. Caduca a los 30 minutos y es de UN SOLO USO: al canjearlo se borra, así
 *    que un enlace reenviado sin querer --o que se quede en el historial del
 *    correo-- no vale para una segunda vez.
 * 4. La contraseña nueva se guarda en data/admin/password.json y a partir de
 *    ahí manda sobre ADMIN_PASSWORD_HASH. La variable de entorno sigue siendo
 *    obligatoria al arrancar: si alguien borra este fichero, el panel vuelve a
 *    la contraseña de la variable en lugar de quedarse sin ninguna.
 * 5. Al cambiarla se cierran TODAS las sesiones abiertas. Si se ha pedido
 *    recuperar porque alguien más podía tener la contraseña, dejar su sesión
 *    viva no arregla nada.
 *
 * CUIDADO CON EL HISTORIAL DE ESTE FICHERO: aquí hubo un data/admin/users.json
 * que se sembraba solo con una contraseña por defecto en el primer intento de
 * login, y cualquiera que leyera el repositorio entraba. Este fichero NO se
 * crea nunca solo: solo lo escribe un canje válido.
 */

export const ADMIN_DIR = path.join(process.cwd(), 'data', 'admin');
const FICHERO_PASSWORD = 'password.json';
const FICHERO_TOKEN = 'reset.json';

/** Media hora: lo que tarda alguien en abrir el correo, no lo que tarda un
 *  atacante en probar. */
export const VIGENCIA_MS = 30 * 60 * 1000;

/** El mismo mínimo que exige ADMIN_PASSWORD en admin-store.ts. */
export const MIN_LONGITUD = 12;

const HASH_RE = /^scrypt:[0-9a-f]{2,}:[0-9a-f]{2,}$/i;

function huella(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function escribirAtomico(destino: string, contenido: unknown): Promise<void> {
  await fs.mkdir(path.dirname(destino), { recursive: true, mode: 0o700 });
  const tmp = `${destino}.${process.pid}-${Date.now()}.tmp`;
  try {
    await fs.writeFile(tmp, JSON.stringify(contenido, null, 2), { mode: 0o600 });
    await fs.rename(tmp, destino);
  } catch (err) {
    await fs.rm(tmp, { force: true }).catch(() => {});
    throw err;
  }
}

async function leerJson<T>(fichero: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(fichero, 'utf-8')) as T;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* La contraseña guardada                                              */
/* ------------------------------------------------------------------ */

interface PasswordGuardada {
  passwordHash: string;
  updatedAt: string;
}

/**
 * El hash que manda, si se ha cambiado alguna vez desde el panel. `null`
 * cuando no hay ninguno, cuando el fichero está corrupto o cuando lo que
 * contiene no tiene pinta de hash: en los tres casos se vuelve a la variable
 * de entorno, que es el comportamiento seguro. Un fichero ilegible no puede
 * dejar a nadie fuera.
 */
export async function passwordGuardada(dir: string = ADMIN_DIR): Promise<string | null> {
  const datos = await leerJson<PasswordGuardada>(path.join(dir, FICHERO_PASSWORD));
  const hash = datos?.passwordHash?.trim();
  return hash && HASH_RE.test(hash) ? hash : null;
}

/** Guarda la contraseña nueva. Devuelve el hash escrito. */
export async function guardarPassword(password: string, dir: string = ADMIN_DIR): Promise<string> {
  if (password.length < MIN_LONGITUD) {
    throw new Error(`La contraseña debe tener al menos ${MIN_LONGITUD} caracteres.`);
  }
  const passwordHash = await hashPassword(password);
  await escribirAtomico(path.join(dir, FICHERO_PASSWORD), {
    passwordHash,
    updatedAt: new Date().toISOString(),
  } satisfies PasswordGuardada);
  return passwordHash;
}

/* ------------------------------------------------------------------ */
/* El enlace de un solo uso                                            */
/* ------------------------------------------------------------------ */

interface TokenGuardado {
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Crea el secreto y guarda su huella. Devuelve el secreto EN CLARO, que es lo
 * único que sale de aquí y solo viaja hasta el correo del estudio.
 *
 * Crear uno nuevo invalida el anterior: hay un solo fichero. Así, pedir el
 * enlace dos veces no deja dos puertas abiertas.
 */
export async function crearToken(dir: string = ADMIN_DIR): Promise<{ token: string; expiraEn: Date }> {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiraEn = new Date(Date.now() + VIGENCIA_MS);
  await escribirAtomico(path.join(dir, FICHERO_TOKEN), {
    tokenHash: huella(token),
    expiresAt: expiraEn.toISOString(),
    createdAt: new Date().toISOString(),
  } satisfies TokenGuardado);
  return { token, expiraEn };
}

/** ¿Este enlace sirve todavía? No lo consume: lo usa la página para decidir
 *  si enseña el formulario o el aviso de caducado. */
export async function tokenValido(token: string, dir: string = ADMIN_DIR): Promise<boolean> {
  if (!token) return false;
  const datos = await leerJson<TokenGuardado>(path.join(dir, FICHERO_TOKEN));
  if (!datos?.tokenHash || !datos.expiresAt) return false;
  if (Date.parse(datos.expiresAt) < Date.now()) return false;
  // En tiempo constante sobre los digests, como el resto de comparaciones de
  // secretos del proyecto.
  return timingSafeEqualString(datos.tokenHash, huella(token));
}

/** Lo gasta. Devuelve false si no valía, y en ese caso no borra nada. */
export async function canjearToken(token: string, dir: string = ADMIN_DIR): Promise<boolean> {
  if (!(await tokenValido(token, dir))) return false;
  await fs.rm(path.join(dir, FICHERO_TOKEN), { force: true });
  return true;
}

/** Borra el enlace pendiente, si lo hay. Se llama tras cambiar la contraseña
 *  por cualquier vía: un enlace que sigue vivo después de eso es una puerta
 *  que nadie ha cerrado. */
export async function olvidarToken(dir: string = ADMIN_DIR): Promise<void> {
  await fs.rm(path.join(dir, FICHERO_TOKEN), { force: true });
}
