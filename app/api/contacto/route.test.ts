import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import { POST } from './route';
import * as contactStore from '@/lib/contact-store';
import { DEFAULT_CONTACT_SUBMISSIONS_DIR } from '@/lib/contact-store';

function req(body: unknown) {
  return new Request('http://localhost/api/contacto', { method: 'POST', body: JSON.stringify(body) });
}

describe('POST /api/contacto', () => {
  // This route always writes through saveContactSubmission's default
  // (real) directory, so clean up after every test — lib/contact-store.test.ts
  // uses its own isolated temp directory precisely so it never has to touch
  // (or race with) this shared directory.
  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(DEFAULT_CONTACT_SUBMISSIONS_DIR, { recursive: true, force: true });
  });

  it('returns 400 for an invalid payload', async () => {
    const res = await POST(req({ nombre: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with an id for a valid payload', async () => {
    const res = await POST(req({ nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeTruthy();
  });

  it('returns 400 for malformed JSON body', async () => {
    const malformedRequest = new Request('http://localhost/api/contacto', { method: 'POST', body: 'not valid json{' });
    const res = await POST(malformedRequest);
    expect(res.status).toBe(400);
  });

  it('returns a generic 500 (not the raw error message) for an unexpected, non-validation failure', async () => {
    vi.spyOn(contactStore, 'saveContactSubmission').mockRejectedValue(new Error('EACCES: permission denied, open /data/x.json'));
    const res = await POST(req({ nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola' }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).not.toMatch(/EACCES|permission denied/);
    expect(json.error).toBe('Error interno del servidor');
  });
});
