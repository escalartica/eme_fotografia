import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { saveContactSubmission } from './contact-store';

// Use a unique per-file temp directory (rather than the real
// data/contact-submissions/ dir) so this file's beforeEach/afterEach cleanup
// can never race with app/api/contacto/route.test.ts, which also exercises
// saveContactSubmission concurrently when Vitest runs test files in parallel.
const DIR = path.join(os.tmpdir(), `eme-contact-store-test-${crypto.randomUUID()}`);

beforeEach(async () => { await fs.rm(DIR, { recursive: true, force: true }); });
afterEach(async () => { await fs.rm(DIR, { recursive: true, force: true }); });

describe('saveContactSubmission', () => {
  it('persists the submission as a real JSON file on disk', async () => {
    const { id } = await saveContactSubmission({ nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola' }, DIR);
    const files = await fs.readdir(DIR);
    expect(files).toHaveLength(1);
    const content = JSON.parse(await fs.readFile(path.join(DIR, files[0]), 'utf-8'));
    expect(content.nombre).toBe('Ana');
    expect(content.id).toBe(id);
  });

  it('rejects a payload missing required fields', async () => {
    await expect(saveContactSubmission({ nombre: '', email: '', tipoEvento: '', mensaje: '' }, DIR)).rejects.toThrow();
  });

  it('never lets a client-supplied id or receivedAt override the server-generated values', async () => {
    const clientSuppliedPayload = {
      nombre: 'Ana',
      email: 'ana@example.com',
      tipoEvento: 'boda',
      mensaje: 'Hola',
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

  it('persists lugar and numeroInvitados when provided', async () => {
    const { id } = await saveContactSubmission({
      nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola',
      lugar: 'Hacienda de San Rafael', numeroInvitados: '80',
    }, DIR);
    const files = await fs.readdir(DIR);
    const content = JSON.parse(await fs.readFile(path.join(DIR, files[0]), 'utf-8'));
    expect(content.lugar).toBe('Hacienda de San Rafael');
    expect(content.numeroInvitados).toBe('80');
  });
});
