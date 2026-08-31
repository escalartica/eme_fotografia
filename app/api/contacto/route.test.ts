import { describe, it, expect } from 'vitest';
import { POST } from './route';

function req(body: unknown) {
  return new Request('http://localhost/api/contacto', { method: 'POST', body: JSON.stringify(body) });
}

describe('POST /api/contacto', () => {
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
});
