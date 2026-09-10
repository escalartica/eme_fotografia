#!/usr/bin/env node
/**
 * Genera el valor de ADMIN_PASSWORD_HASH a partir de una contraseña.
 *
 *   node scripts/hash-admin-password.mjs 'la contraseña que quieras'
 *
 * Pega la línea que imprime en las variables de entorno del hosting. Así la
 * contraseña en claro no queda guardada en ningún sitio: ni en el código, ni en
 * el panel del hosting, ni en data/.
 *
 * Mismo formato y mismos parámetros que lib/auth/password.ts (scrypt de
 * node:crypto, N=16384, r=8, p=1, 64 bytes, sal de 16 bytes por contraseña).
 * Si cambia uno, tiene que cambiar el otro.
 */
import crypto from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error("Uso: node scripts/hash-admin-password.mjs 'tu-contraseña'");
  process.exit(1);
}
if (password.length < 12) {
  console.error('La contraseña debe tener al menos 12 caracteres.');
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString('hex')}:${derived.toString('hex')}`);
