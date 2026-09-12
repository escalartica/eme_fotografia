import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { saveContactSubmission } from './contact-store';
import { CONSENTIMIENTO_TEXTO, CONSENTIMIENTO_VERSION } from '@/content/consentimiento';

/**
 * Carga útil mínima que el servidor acepta hoy. `fecha` y `lugar` entraron en
 * la lista de obligatorios cuando el formulario dejó de tratarlos como
 * opcionales: son los dos únicos datos con los que el estudio puede contestar
 * "esa fecha la tenemos libre", que es lo que promete toda la web.
 * `comoNosConociste` salió de la lista: es atribución para el estudio y
 * bloqueaba a la pareja antes de que hubiera contado nada de su boda.
 */
const validPayload = {
  nombre: 'Ana',
  email: 'ana@example.com',
  fecha: '2027-06-12',
  lugar: 'Carmona',
  tipoEvento: 'foto-y-video',
  mensaje: 'Hola',
  // Obligatorio desde que el formulario pide el consentimiento expreso
  // (RGPD art. 7.1): sin esta marca el servidor rechaza el envío con un 400.
  // Ver content/consentimiento.ts y el bloque de pruebas del final.
  consentimiento: 'si' as const,
};

// Use a unique per-file temp directory (rather than the real
// data/contact-submissions/ dir) so this file's beforeEach/afterEach cleanup
// can never race with app/api/contacto/route.test.ts, which also exercises
// saveContactSubmission concurrently when Vitest runs test files in parallel.
const DIR = path.join(os.tmpdir(), `eme-contact-store-test-${crypto.randomUUID()}`);

beforeEach(async () => { await fs.rm(DIR, { recursive: true, force: true }); });
afterEach(async () => { await fs.rm(DIR, { recursive: true, force: true }); });

describe('saveContactSubmission', () => {
  it('persists the submission as a real JSON file on disk', async () => {
    const { id } = await saveContactSubmission({ ...validPayload }, DIR);
    const files = await fs.readdir(DIR);
    expect(files).toHaveLength(1);
    const content = JSON.parse(await fs.readFile(path.join(DIR, files[0]), 'utf-8'));
    expect(content.nombre).toBe('Ana');
    expect(content.id).toBe(id);
  });

  it('rejects a payload missing required fields', async () => {
    await expect(
      saveContactSubmission({ nombre: '', email: '', fecha: '', lugar: '', tipoEvento: '', mensaje: '' }, DIR)
    ).rejects.toThrow();
  });

  it('rejects a payload with a date but no place, and the other way round', async () => {
    // Cualquiera de los dos por su cuenta deja al estudio sin poder contestar,
    // así que la validación tiene que caer con los dos casos, no solo con el
    // formulario entero vacío.
    await expect(saveContactSubmission({ ...validPayload, lugar: '' }, DIR)).rejects.toThrow();
    await expect(saveContactSubmission({ ...validPayload, fecha: '' }, DIR)).rejects.toThrow();
  });

  it('never lets a client-supplied id or receivedAt override the server-generated values', async () => {
    const clientSuppliedPayload = {
      ...validPayload,
      id: 'attacker-controlled-id',
      receivedAt: '1970-01-01T00:00:00.000Z',
    } as unknown as Parameters<typeof saveContactSubmission>[0];

    const { id } = await saveContactSubmission(clientSuppliedPayload, DIR);
    expect(id).not.toBe('attacker-controlled-id');

    const files = await fs.readdir(DIR);
    expect(files).toEqual([`${id}.json`]);
    const content = JSON.parse(await fs.readFile(path.join(DIR, files[0]), 'utf-8'));
    expect(content.id).toBe(id);
    expect(content.receivedAt).not.toBe('1970-01-01T00:00:00.000Z');
  });

  it('accepts a submission with no comoNosConociste — it is optional now', async () => {
    // El formulario ya no lo exige y lo pregunta el último. Si el servidor
    // siguiera exigiéndolo, la pareja se comería un 400 que no sabe leer.
    await expect(saveContactSubmission({ ...validPayload }, DIR)).resolves.toBeTruthy();
  });

  it('persists comoNosConociste when the couple does answer it', async () => {
    await saveContactSubmission(
      { ...validPayload, comoNosConociste: 'instagram' },
      DIR
    );
    const files = await fs.readdir(DIR);
    const content = JSON.parse(await fs.readFile(path.join(DIR, files[0]), 'utf-8'));
    expect(content.comoNosConociste).toBe('instagram');
    expect(content.lugar).toBe('Carmona');
  });
});


/**
 * EL REGISTRO DE CONSENTIMIENTO (RGPD art. 7.1).
 *
 * Lo que se comprueba aquí no es que exista una casilla --eso es del
 * formulario-- sino que el servidor no guarda un dato personal sin poder
 * justificar por qué lo tiene. Esta ruta es una API pública: cualquiera puede
 * publicar contra ella sin pasar por la casilla, así que la exigencia tiene
 * que vivir también aquí.
 */
describe('consentimiento', () => {
  it('rechaza un envío sin la marca de consentimiento', async () => {
    const { consentimiento: _, ...sinConsentimiento } = validPayload;
    await expect(
      saveContactSubmission(sinConsentimiento as typeof validPayload, DIR)
    ).rejects.toThrow(/política de privacidad/i);
  });

  it('rechaza un valor que no sea exactamente "si"', async () => {
    await expect(
      saveContactSubmission({ ...validPayload, consentimiento: 'no' } as never, DIR)
    ).rejects.toThrow();
    await expect(
      saveContactSubmission({ ...validPayload, consentimiento: 'on' } as never, DIR)
    ).rejects.toThrow();
  });

  /**
   * La parte que hace que el registro sirva de prueba: el texto y la versión
   * los escribe el SERVIDOR desde content/consentimiento.ts. Si vinieran en la
   * petición, cualquiera podría afirmar haber aceptado algo distinto de lo que
   * la web enseñó.
   */
  it('guarda el texto y la versión desde el servidor, ignorando lo que mande el cliente', async () => {
    const { id } = await saveContactSubmission(
      {
        ...validPayload,
        consentimientoTexto: 'acepto cualquier cosa',
        consentimientoVersion: '1999-01-01',
      } as never,
      DIR
    );
    const guardado = JSON.parse(await fs.readFile(path.join(DIR, `${id}.json`), 'utf-8'));
    expect(guardado.consentimientoTexto).toBe(CONSENTIMIENTO_TEXTO);
    expect(guardado.consentimientoVersion).toBe(CONSENTIMIENTO_VERSION);
    expect(guardado.receivedAt).toBeTruthy();
  });
});
