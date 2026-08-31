import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface ContactSubmission {
  nombre: string;
  email: string;
  tipoEvento: string;
  fecha?: string;
  lugar?: string;
  numeroInvitados?: string;
  presupuesto?: string;
  mensaje: string;
}

export const DEFAULT_CONTACT_SUBMISSIONS_DIR = path.join(process.cwd(), 'data', 'contact-submissions');

/** Thrown for known, user-facing validation failures (safe to surface as a 400). */
export class ContactValidationError extends Error {}

/**
 * @param dir Directory to persist submissions in. Defaults to the real
 * `data/contact-submissions/` directory; tests should pass their own unique
 * directory to avoid racing other test files that also read/write it.
 */
export async function saveContactSubmission(
  payload: ContactSubmission,
  dir: string = DEFAULT_CONTACT_SUBMISSIONS_DIR
): Promise<{ id: string }> {
  if (!payload.nombre || !payload.email || !payload.tipoEvento || !payload.mensaje) {
    throw new ContactValidationError('Faltan campos obligatorios: nombre, email, tipoEvento, mensaje');
  }
  await fs.mkdir(dir, { recursive: true });
  const id = crypto.randomUUID();
  // Spread payload first so the server-generated id/receivedAt always win —
  // a client-supplied id or receivedAt in the request body must never override them.
  const record = { ...payload, id, receivedAt: new Date().toISOString() };
  await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2));
  return { id };
}
