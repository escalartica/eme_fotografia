import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  crearToken,
  tokenValido,
  canjearToken,
  olvidarToken,
  guardarPassword,
  passwordGuardada,
  MIN_LONGITUD,
} from './admin-recovery';
import { verifyPassword } from './auth/password';

let dir: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'eme-admin-'));
});
afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe('el enlace de recuperación', () => {
  it('vale una vez y solo una', async () => {
    const { token } = await crearToken(dir);
    expect(await tokenValido(token, dir)).toBe(true);
    expect(await canjearToken(token, dir)).toBe(true);
    // La segunda vez ya no: un enlace que se queda en el historial del correo
    // --o que se reenvía sin querer-- no puede servir para volver a entrar.
    expect(await canjearToken(token, dir)).toBe(false);
    expect(await tokenValido(token, dir)).toBe(false);
  });

  it('no acepta un token inventado ni uno vacío', async () => {
    await crearToken(dir);
    expect(await tokenValido('lo-que-sea', dir)).toBe(false);
    expect(await tokenValido('', dir)).toBe(false);
  });

  it('caduca', async () => {
    const { token } = await crearToken(dir);
    // Se envejece el fichero a mano en vez de esperar media hora.
    const fichero = path.join(dir, 'reset.json');
    const datos = JSON.parse(await fs.readFile(fichero, 'utf-8'));
    datos.expiresAt = new Date(Date.now() - 1000).toISOString();
    await fs.writeFile(fichero, JSON.stringify(datos));
    expect(await tokenValido(token, dir)).toBe(false);
  });

  /* Pedir el enlace dos veces no puede dejar dos puertas abiertas. */
  it('el nuevo invalida al anterior', async () => {
    const primero = await crearToken(dir);
    const segundo = await crearToken(dir);
    expect(await tokenValido(primero.token, dir)).toBe(false);
    expect(await tokenValido(segundo.token, dir)).toBe(true);
  });

  it('en disco NO se guarda el token, solo su huella', async () => {
    const { token } = await crearToken(dir);
    const crudo = await fs.readFile(path.join(dir, 'reset.json'), 'utf-8');
    // Quien lea el fichero --una copia de seguridad mal hecha, otra cuenta
    // del servidor-- no puede fabricar el enlace.
    expect(crudo).not.toContain(token);
  });

  it('se puede tirar sin canjearlo', async () => {
    const { token } = await crearToken(dir);
    await olvidarToken(dir);
    expect(await tokenValido(token, dir)).toBe(false);
  });
});

describe('la contraseña guardada', () => {
  it('no existe hasta que alguien la cambia', async () => {
    // El aviso está en la cabecera de admin-recovery.ts: aquí hubo una vez un
    // fichero que se sembraba solo con una contraseña por defecto.
    expect(await passwordGuardada(dir)).toBeNull();
  });

  it('se guarda con hash y se puede verificar', async () => {
    const hash = await guardarPassword('unacontraseñalarga', dir);
    expect(hash).toMatch(/^scrypt:/);
    expect(await passwordGuardada(dir)).toBe(hash);
    expect(await verifyPassword('unacontraseñalarga', hash)).toBe(true);
    expect(await verifyPassword('otra cosa', hash)).toBe(false);
  });

  it('nunca escribe la contraseña en claro', async () => {
    await guardarPassword('unacontraseñalarga', dir);
    const crudo = await fs.readFile(path.join(dir, 'password.json'), 'utf-8');
    expect(crudo).not.toContain('unacontraseñalarga');
  });

  it('exige el mínimo de longitud', async () => {
    await expect(guardarPassword('corta', dir)).rejects.toThrow();
    expect('corta'.length).toBeLessThan(MIN_LONGITUD);
  });

  /* Un fichero ilegible no puede dejar al estudio fuera: se vuelve a la
     variable de entorno, que es el suelo. */
  it('si el fichero está corrupto, es como si no existiera', async () => {
    await guardarPassword('unacontraseñalarga', dir);
    await fs.writeFile(path.join(dir, 'password.json'), '{esto no es json');
    expect(await passwordGuardada(dir)).toBeNull();
  });

  it('ignora un hash con formato que no es el nuestro', async () => {
    await fs.writeFile(
      path.join(dir, 'password.json'),
      JSON.stringify({ passwordHash: 'contraseña-en-claro', updatedAt: new Date().toISOString() })
    );
    expect(await passwordGuardada(dir)).toBeNull();
  });
});
