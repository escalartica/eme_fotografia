import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { saveContactSubmission } from './contact-store';

const DIR = path.join(process.cwd(), 'data', 'contact-submissions');

beforeEach(async () => { await fs.rm(DIR, { recursive: true, force: true }); });
afterEach(async () => { await fs.rm(DIR, { recursive: true, force: true }); });

describe('saveContactSubmission', () => {
  it('persists the submission as a real JSON file on disk', async () => {
    const { id } = await saveContactSubmission({ nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola' });
    const files = await fs.readdir(DIR);
    expect(files).toHaveLength(1);
    const content = JSON.parse(await fs.readFile(path.join(DIR, files[0]), 'utf-8'));
    expect(content.nombre).toBe('Ana');
    expect(content.id).toBe(id);
  });

  it('rejects a payload missing required fields', async () => {
    await expect(saveContactSubmission({ nombre: '', email: '', tipoEvento: '', mensaje: '' })).rejects.toThrow();
  });
});
