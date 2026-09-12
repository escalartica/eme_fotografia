import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { CONSENTIMIENTO_TEXTO, CONSENTIMIENTO_VERSION, POLITICA_VERSION } from '@/content/consentimiento';

export interface ContactSubmission {
  nombre: string;
  email: string;
  /** OPCIONAL. Va junto al correo en el formulario: es la misma pregunta y no
   * merece un paso propio. Opcional porque obligarlo espanta a quien sólo
   * quiere saber si la fecha está libre. */
  telefono?: string;
  /** When the wedding is. REQUIRED. Together with `lugar`, this is the whole
   * of what the studio needs to answer "that date is free" -- which is what
   * every page of the site promises. Both used to be optional, so a couple
   * could send a message nobody could act on. */
  fecha: string;
  /** Where the wedding is (venue, town, or just the area). REQUIRED, same
   * reason as `fecha`. */
  lugar: string;
  /** What the couple wants covered: photo, video, both, or undecided.
   * REQUIRED -- it is the first price variable the site itself declares in
   * content/faq.ts. (Kept under the old `tipoEvento` name so existing stored
   * submissions in data/contact-submissions/ stay readable.) */
  tipoEvento: string;
  mensaje: string;
  /** How the couple found the studio. OPTIONAL, and asked last: it is
   * attribution data, useful to the studio and worth nothing to them. It used
   * to be required and blocked the form on step 3 of 8, before they had said
   * a word about their wedding. */
  comoNosConociste?: string;
  /**
   * CONSENTIMIENTO RGPD. Lo único que manda el formulario es la marca de que
   * la casilla estaba puesta; el TEXTO y la VERSIÓN los escribe el servidor
   * desde content/consentimiento.ts, nunca desde la petición -- si viajaran
   * en el cuerpo, cualquiera podría afirmar haber aceptado algo distinto de
   * lo que la web enseñó, y entonces el registro no probaría nada.
   * Obligatorio desde 2026-09-12. Los mensajes guardados antes no lo llevan,
   * y por eso es opcional en el tipo: el fichero de un mensaje de 2025 tiene
   * que seguir leyéndose en /admin/mensajes.
   */
  consentimiento?: 'si';
  consentimientoVersion?: string;
  consentimientoTexto?: string;
  /** Versión del documento de /privacidad vigente al aceptar. Ver
   * content/consentimiento.ts para por qué no basta con la del texto. */
  politicaVersion?: string;
  /** No longer collected by the form. `numeroInvitados` is not among the
   * price variables the site declares, and `presupuesto`/`queEsperas` were
   * folded away (its placeholder, "Ej. 1500-2500€", was the only rate
   * published anywhere on this site). Kept optional so submissions stored
   * before that change still parse. */
  numeroInvitados?: string;
  presupuesto?: string;
  queEsperas?: string;
}

export const DEFAULT_CONTACT_SUBMISSIONS_DIR = path.join(process.cwd(), 'data', 'contact-submissions');

/** Thrown for known, user-facing validation failures (safe to surface as a 400). */
export class ContactValidationError extends Error {}

/**
 * Topes de longitud por campo. Sin ellos, el formulario público acepta un
 * `mensaje` de 50 MB y lo escribe entero en data/contact-submissions/: unas
 * cuantas peticiones así llenan el disco del servidor y tiran la web entera.
 * Los topes son generosos respecto a lo que una pareja escribe de verdad
 * (2.000 caracteres son ~350 palabras) y ridículos comparados con lo que hace
 * falta para hacer daño.
 */
const MAX_LENGTHS: Record<string, number> = {
  nombre: 120,
  email: 254, // el máximo real de una dirección de correo (RFC 5321)
  telefono: 24, // holgado para un prefijo internacional con espacios
  fecha: 40,
  lugar: 160,
  tipoEvento: 60,
  mensaje: 2000,
  comoNosConociste: 120,
  // 2 caracteres: el valor es literalmente "si". Va en esta tabla porque
  // `sanitise` descarta cualquier clave que no esté aquí, así que sin la
  // entrada el campo nunca llegaría a la validación.
  consentimiento: 2,
  numeroInvitados: 40,
  presupuesto: 60,
  queEsperas: 500,
};

// Comprobación de forma, no de existencia: "algo@algo.algo" sin espacios. No
// pretende validar que el buzón exista (eso solo lo dice el correo que se
// envía); pretende que el estudio no reciba un `reply_to` con un salto de
// línea o un montón de basura dentro.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/**
 * Recorta cada campo a su tope y descarta cualquier clave que el formulario no
 * declare. Lo segundo importa tanto como lo primero: el cuerpo de la petición
 * es JSON arbitrario de un desconocido y, sin esta lista blanca, cualquiera
 * puede añadir campos inventados que acaban guardados en disco y pintados
 * después en /admin/mensajes.
 */
function sanitise(payload: ContactSubmission): ContactSubmission {
  const clean: Record<string, string> = {};
  for (const [key, max] of Object.entries(MAX_LENGTHS)) {
    const value = (payload as unknown as Record<string, unknown>)[key];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim().slice(0, max);
    if (trimmed) clean[key] = trimmed;
  }
  return clean as unknown as ContactSubmission;
}

/**
 * @param dir Directory to persist submissions in. Defaults to the real
 * `data/contact-submissions/` directory; tests should pass their own unique
 * directory to avoid racing other test files that also read/write it.
 */
export async function saveContactSubmission(
  payload: ContactSubmission,
  dir: string = DEFAULT_CONTACT_SUBMISSIONS_DIR
): Promise<{ id: string; receivedAt: string }> {
  // `comoNosConociste` ya NO es obligatorio: es dato de atribución para el
  // estudio y bloqueaba a la pareja antes de que hubiera contado nada. `fecha`
  // y `lugar` SÍ lo son ahora, porque son lo único que hace falta para cumplir
  // lo que promete toda la web ("decidnos la fecha y el lugar y os decimos si
  // estamos libres"). El formulario y el servidor tienen que exigir lo mismo:
  // si divergen, el cliente deja pasar un envío que el servidor rechaza con un
  // 400 que la pareja no sabe interpretar.
  if (!payload || typeof payload !== 'object') {
    throw new ContactValidationError('Faltan campos obligatorios: nombre, email, fecha, lugar, tipoEvento, mensaje');
  }
  // Sanear ANTES de validar: si no, un campo que solo tiene espacios pasa el
  // "está relleno" y se guarda vacío.
  const clean = sanitise(payload);
  if (!clean.nombre || !clean.email || !clean.tipoEvento || !clean.mensaje || !clean.fecha || !clean.lugar) {
    throw new ContactValidationError('Faltan campos obligatorios: nombre, email, fecha, lugar, tipoEvento, mensaje');
  }
  if (!EMAIL_RE.test(clean.email)) {
    throw new ContactValidationError('La dirección de correo no es válida.');
  }
  // El servidor lo exige aparte del formulario, y no por desconfianza: esta
  // ruta es una API pública y cualquiera puede publicar contra ella sin pasar
  // por la casilla. Un mensaje guardado sin constancia de consentimiento es
  // un dato personal que el estudio no puede justificar tener.
  if (clean.consentimiento !== 'si') {
    throw new ContactValidationError(
      'Falta aceptar la política de privacidad para poder responderos.'
    );
  }
  // 0o700 / 0o600: estos ficheros son datos personales (nombre, correo,
  // teléfono y texto libre de una pareja). En un servidor compartido, el modo
  // por defecto (0o755/0o644) los deja legibles para cualquier otra cuenta de
  // la máquina. Con esto solo los lee el usuario que ejecuta el proceso Node.
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const id = crypto.randomUUID();
  // Spread payload first so the server-generated id/receivedAt always win —
  // a client-supplied id or receivedAt in the request body must never override them.
  const receivedAt = new Date().toISOString();
  // El texto y la versión los pone el servidor, encima de lo que viniera en
  // la petición: es la mitad del registro que tiene que ser creíble. Y
  // `receivedAt` hace de fecha del consentimiento, que es el mismo instante.
  const record = {
    ...clean,
    consentimientoVersion: CONSENTIMIENTO_VERSION,
    consentimientoTexto: CONSENTIMIENTO_TEXTO,
    politicaVersion: POLITICA_VERSION,
    id,
    receivedAt,
  };
  await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2), { mode: 0o600 });
  return { id, receivedAt };
}

/** Un mensaje tal y como queda guardado en disco. */
export type StoredContactSubmission = ContactSubmission & { id: string; receivedAt: string };

/**
 * El id es SIEMPRE un UUID v4 generado por el servidor (crypto.randomUUID).
 * Esta comprobación es la única frontera entre un segmento de URL --que
 * controla quien llama-- y un `path.join` sobre data/contact-submissions/:
 * un id como `../../admin/users` no pasa de aquí, así que ninguna ruta puede
 * salirse del directorio ni borrar un fichero que no sea un mensaje.
 */
export function isValidSubmissionId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Todos los mensajes, del más reciente al más antiguo. */
export async function listContactSubmissions(
  dir: string = DEFAULT_CONTACT_SUBMISSIONS_DIR
): Promise<StoredContactSubmission[]> {
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const rows = await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => {
        try {
          return JSON.parse(await fs.readFile(path.join(dir, f), 'utf-8')) as StoredContactSubmission;
        } catch {
          return null;
        }
      })
  );
  return rows
    .filter((r): r is StoredContactSubmission => r !== null)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

/**
 * Borrado definitivo de un mensaje (RGPD, art. 17 "derecho de supresión").
 * Antes de esto no había NINGUNA forma de borrar un mensaje de contacto: el
 * nombre, el correo y el texto libre de una pareja se quedaban en el disco
 * para siempre, y una petición de supresión solo se podía atender entrando por
 * SSH. Devuelve false si el mensaje no existía, para que la ruta pueda
 * responder 404 en vez de fingir que ha borrado algo.
 */
export async function deleteContactSubmission(
  id: string,
  dir: string = DEFAULT_CONTACT_SUBMISSIONS_DIR
): Promise<boolean> {
  if (!isValidSubmissionId(id)) return false;
  try {
    await fs.unlink(path.join(dir, `${id}.json`));
    return true;
  } catch {
    return false;
  }
}
