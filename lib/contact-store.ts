import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface ContactSubmission {
  nombre: string;
  email: string;
  tipoEvento: string;
  fecha?: string;
  presupuesto?: string;
  mensaje: string;
}

const DIR = path.join(process.cwd(), 'data', 'contact-submissions');

export async function saveContactSubmission(payload: ContactSubmission): Promise<{ id: string }> {
  if (!payload.nombre || !payload.email || !payload.tipoEvento || !payload.mensaje) {
    throw new Error('Faltan campos obligatorios: nombre, email, tipoEvento, mensaje');
  }
  await fs.mkdir(DIR, { recursive: true });
  const id = crypto.randomUUID();
  const record = { id, receivedAt: new Date().toISOString(), ...payload };
  await fs.writeFile(path.join(DIR, `${id}.json`), JSON.stringify(record, null, 2));
  return { id };
}
