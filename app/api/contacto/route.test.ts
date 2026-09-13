import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { POST } from './route';
import * as contactStore from '@/lib/contact-store';
import { __resetRateLimits } from '@/lib/auth/rate-limit';

/** Ver el comentario de validPayload en lib/contact-store.test.ts. */
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

function req(body: unknown) {
  return new Request('http://localhost/api/contacto', { method: 'POST', body: JSON.stringify(body) });
}

describe('POST /api/contacto', () => {
  // This file used to let the route write to the REAL
  // data/contact-submissions/ directory and then `fs.rm` it in afterEach.
  // That is a data-destroying test: once the site is live, `npm test` on the
  // machine that serves it would delete every lead the studio had received,
  // irreversibly and without a word. The directory happened to be empty when
  // this was found, so nothing was lost -- but the only reason is that no
  // real submission had arrived yet.
  //
  // saveContactSubmission already takes the directory as its second
  // argument for exactly this reason. Redirect it to a fresh temp dir per
  // test: the route is still exercised end to end, writes and all, and the
  // real directory is never opened.
  const realSave = contactStore.saveContactSubmission;
  let tmpDir: string;

  beforeEach(async () => {
    // La ruta limita envíos por IP (5/hora) y en total (200/hora). Los
    // contadores viven en memoria del proceso, así que sin este reset el orden
    // de ejecución decidiría qué test se come el 429 -- y el fallo aparecería
    // en un test que no tiene nada que ver con el límite.
    __resetRateLimits();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eme-contacto-'));
    vi.spyOn(contactStore, 'saveContactSubmission').mockImplementation((payload) => realSave(payload, tmpDir));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('returns 400 for an invalid payload', async () => {
    const res = await POST(req({ nombre: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with an id for a valid payload', async () => {
    const res = await POST(req({ ...validPayload }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeTruthy();
  });

  it('reports delivered: false when no mail provider is configured, so the client can say so', async () => {
    // vitest.setup.ts pins RESEND_API_KEY to '' precisely so this is
    // deterministic: without that, a developer who has the real key exported
    // would have this suite send actual email to the studio inbox.
    const res = await POST(req({ ...validPayload }));
    const json = await res.json();
    expect(json.delivered).toBe(false);
  });

  it('returns 400 for malformed JSON body', async () => {
    const malformedRequest = new Request('http://localhost/api/contacto', { method: 'POST', body: 'not valid json{' });
    const res = await POST(malformedRequest);
    expect(res.status).toBe(400);
  });

  it('returns a generic 500 (not the raw error message) for an unexpected, non-validation failure', async () => {
    vi.spyOn(contactStore, 'saveContactSubmission').mockRejectedValue(new Error('EACCES: permission denied, open /data/x.json'));
    const res = await POST(req({ ...validPayload }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).not.toMatch(/EACCES|permission denied/);
    expect(json.error).toBe('Error interno del servidor');
  });

  it('devuelve 429 cuando se superan los envíos por hora, en vez de aceptar spam sin freno', async () => {
    // Sexto envío seguido: el formulario público es la puerta de entrada del
    // spam y de un ataque de llenado de disco, y antes no tenía ningún tope.
    for (let i = 0; i < 5; i++) {
      expect((await POST(req({ ...validPayload }))).status).toBe(200);
    }
    const res = await POST(req({ ...validPayload }));
    expect(res.status).toBe(429);
  });

  it('rechaza un envío cuyo Origin es otro sitio (CSRF / bot externo)', async () => {
    const cross = new Request('http://localhost/api/contacto', {
      method: 'POST',
      headers: { origin: 'https://sitio-de-otro.example' },
      body: JSON.stringify(validPayload),
    });
    expect((await POST(cross)).status).toBe(403);
  });

  it('recorta un mensaje enorme en vez de escribirlo entero en disco', async () => {
    const res = await POST(req({ ...validPayload, mensaje: 'a'.repeat(50000) }));
    expect(res.status).toBe(200);
    const { id } = await res.json();
    const stored = JSON.parse(await fs.readFile(path.join(tmpDir, `${id}.json`), 'utf8'));
    expect(stored.mensaje.length).toBe(2000);
  });

  it('rechaza una dirección de correo con una forma imposible', async () => {
    const res = await POST(req({ ...validPayload, email: 'no-es-un-correo' }));
    expect(res.status).toBe(400);
  });

  it('persists the optional and required extras through the full request/response cycle', async () => {
    // This test used to assert only `status === 200`, so it passed whether or
    // not the two optional fields survived the round trip -- the exact shape
    // of test that gives false confidence. It now reads the record back.
    const res = await POST(req({ ...validPayload, lugar: 'Sevilla capital', comoNosConociste: 'instagram' }));
    expect(res.status).toBe(200);
    const { id } = await res.json();
    const stored = JSON.parse(await fs.readFile(path.join(tmpDir, `${id}.json`), 'utf8'));
    expect(stored.lugar).toBe('Sevilla capital');
    expect(stored.comoNosConociste).toBe('instagram');
    expect(stored.fecha).toBe('2027-06-12');
    expect(stored.id).toBe(id);
  });
});
