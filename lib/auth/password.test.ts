// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, timingSafeEqualString, DUMMY_PASSWORD_HASH } from './password';

describe('hashPassword', () => {
  it('produces the versioned scrypt format the rest of the app expects', async () => {
    // El prefijo `scrypt:` es lo que permite cambiar de algoritmo algún día sin
    // invalidar de golpe todas las contraseñas guardadas, y lo que
    // adminConfigProblem valida en ADMIN_PASSWORD_HASH.
    const stored = await hashPassword('una-contraseña-larga');
    expect(stored).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
  });

  it('salts every hash, so two identical passwords never look alike on disk', async () => {
    const [a, b] = await Promise.all([hashPassword('la-misma'), hashPassword('la-misma')]);
    expect(a).not.toBe(b);
    expect(await verifyPassword('la-misma', a)).toBe(true);
    expect(await verifyPassword('la-misma', b)).toBe(true);
  });
});

describe('verifyPassword', () => {
  it('accepts the password the hash was made from and rejects any other', async () => {
    const stored = await hashPassword('contra-segura-1234');
    expect(await verifyPassword('contra-segura-1234', stored)).toBe(true);
    expect(await verifyPassword('contra-segura-1235', stored)).toBe(false);
    expect(await verifyPassword('CONTRA-SEGURA-1234', stored)).toBe(false);
    expect(await verifyPassword('', stored)).toBe(false);
    expect(await verifyPassword('contra-segura-1234 ', stored)).toBe(false);
  });

  it('returns false, never throws, for a stored value that is not a valid hash', async () => {
    // Un meta.json corrupto o editado a mano no debe reventar el login con un
    // 500: tiene que comportarse como "contraseña incorrecta".
    for (const stored of ['', 'no-es-un-hash', 'scrypt:solo-dos-partes', 'bcrypt:aa:bb', 'scrypt:zz:zz', 'scrypt::']) {
      expect(await verifyPassword('lo-que-sea', stored), `stored=${stored}`).toBe(false);
    }
  });

  it('never lets any password match the dummy hash used for absent accounts', async () => {
    // DUMMY_PASSWORD_HASH existe para gastar el mismo tiempo de scrypt cuando la
    // galería o el usuario NO existen. Si alguna contraseña llegara a validar
    // contra él, cualquiera entraría en una galería inexistente.
    expect(await verifyPassword('', DUMMY_PASSWORD_HASH)).toBe(false);
    expect(await verifyPassword('admin', DUMMY_PASSWORD_HASH)).toBe(false);
    expect(await verifyPassword('0'.repeat(128), DUMMY_PASSWORD_HASH)).toBe(false);
  });

  it('keeps the dummy hash in the same format as a real one, so it costs the same to check', async () => {
    expect(DUMMY_PASSWORD_HASH).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
  });
});

describe('timingSafeEqualString', () => {
  it('reports equality for identical strings', () => {
    expect(timingSafeEqualString('estudio', 'estudio')).toBe(true);
    expect(timingSafeEqualString('', '')).toBe(true);
    expect(timingSafeEqualString('ñandú €', 'ñandú €')).toBe(true);
  });

  it('reports inequality for strings of different lengths instead of throwing', () => {
    // timingSafeEqual lanza con búferes de distinta longitud; aquí se comparan
    // digests SHA-256, que siempre miden lo mismo. Sin eso, comparar el usuario
    // recibido con el real reventaría (y la propia excepción delataría la
    // longitud del usuario correcto).
    expect(timingSafeEqualString('a', 'abcdefghijklmnop')).toBe(false);
    expect(timingSafeEqualString('estudio', '')).toBe(false);
    expect(timingSafeEqualString('', 'estudio')).toBe(false);
  });

  it('reports inequality for same-length strings that differ', () => {
    expect(timingSafeEqualString('estudio', 'estudia')).toBe(false);
    expect(timingSafeEqualString('estudio', 'Estudio')).toBe(false);
  });
});
