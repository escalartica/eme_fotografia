// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  adminConfigProblem,
  getAdminCredentials,
  getDevAdminCredentials,
  verifyAdminLogin,
  AdminConfigError,
  __resetAdminCredentialsCache,
} from './admin-store';
import { hashPassword } from './auth/password';

/** La contraseña que este repositorio traía escrita en el código y que se
 * sembraba sola en el primer login. Con el código publicado, la conocía
 * cualquiera. */
const CONTRASENA_RETIRADA = 'EME-fotografia-2026';

const USUARIO = 'estudio';
const CONTRASENA = 'una-contrasena-muy-larga';

/** `NodeJS.ProcessEnv` exige NODE_ENV, así que los entornos de prueba se
 * construyen aquí y cada test solo declara las variables que le importan. */
function entorno(vars: Partial<NodeJS.ProcessEnv> = {}): NodeJS.ProcessEnv {
  return { ...vars, NODE_ENV: 'test' };
}

beforeEach(() => {
  // El hash de la variante en claro se cachea por proceso: sin este reset, el
  // primer test que configure el entorno decidiría las credenciales de todos
  // los demás.
  __resetAdminCredentialsCache();
  // Las tres se fijan siempre de forma explícita para que un entorno con
  // ADMIN_* exportado en la terminal no cambie el resultado.
  vi.stubEnv('ADMIN_USERNAME', undefined);
  vi.stubEnv('ADMIN_PASSWORD_HASH', undefined);
  vi.stubEnv('ADMIN_PASSWORD', undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  __resetAdminCredentialsCache();
});

describe('adminConfigProblem', () => {
  it('reports the missing username when nothing is configured', () => {
    expect(adminConfigProblem(entorno())).toMatch(/Falta ADMIN_USERNAME/);
  });

  it('treats a whitespace-only username as missing', () => {
    expect(adminConfigProblem(entorno({ ADMIN_USERNAME: '   ', ADMIN_PASSWORD_HASH: 'scrypt:aa:bb' }))).toMatch(
      /Falta ADMIN_USERNAME/
    );
  });

  it('reports the missing password when only the username is set', () => {
    expect(adminConfigProblem(entorno({ ADMIN_USERNAME: USUARIO }))).toMatch(/Falta ADMIN_PASSWORD_HASH/);
  });

  it('reports the ambiguity when both password forms are set at once', () => {
    // Con las dos puestas nadie sabe cuál manda: quien creía haber cambiado la
    // contraseña puede seguir con la vieja en pie.
    const problema = adminConfigProblem(
      entorno({ ADMIN_USERNAME: USUARIO, ADMIN_PASSWORD_HASH: 'scrypt:aa:bb', ADMIN_PASSWORD: 'x'.repeat(12) })
    );
    expect(problema).toMatch(/están las dos fijadas/);
  });

  it('reports a hash that is not in the scrypt format', () => {
    expect(adminConfigProblem(entorno({ ADMIN_USERNAME: USUARIO, ADMIN_PASSWORD_HASH: 'no-es-un-hash' }))).toMatch(
      /formato `scrypt:/
    );
    expect(adminConfigProblem(entorno({ ADMIN_USERNAME: USUARIO, ADMIN_PASSWORD_HASH: 'scrypt:zz:zz' }))).toMatch(
      /formato `scrypt:/
    );
  });

  it('rejects a clear-text password shorter than the minimum', () => {
    expect(adminConfigProblem(entorno({ ADMIN_USERNAME: USUARIO, ADMIN_PASSWORD: 'corta' }))).toMatch(
      /al menos 12 caracteres/
    );
  });

  it('returns null for either valid configuration', () => {
    expect(adminConfigProblem(entorno({ ADMIN_USERNAME: USUARIO, ADMIN_PASSWORD_HASH: 'scrypt:aa:bb' }))).toBeNull();
    expect(adminConfigProblem(entorno({ ADMIN_USERNAME: USUARIO, ADMIN_PASSWORD: 'x'.repeat(12) }))).toBeNull();
  });
});

describe('verifyAdminLogin', () => {
  it('accepts the credentials configured as a hash', async () => {
    vi.stubEnv('ADMIN_USERNAME', USUARIO);
    vi.stubEnv('ADMIN_PASSWORD_HASH', await hashPassword(CONTRASENA));
    expect(await verifyAdminLogin(USUARIO, CONTRASENA)).toBe(true);
  });

  it('accepts the credentials configured in clear text', async () => {
    vi.stubEnv('ADMIN_USERNAME', USUARIO);
    vi.stubEnv('ADMIN_PASSWORD', CONTRASENA);
    expect(await verifyAdminLogin(USUARIO, CONTRASENA)).toBe(true);
  });

  it('rejects the wrong password and the wrong username', async () => {
    vi.stubEnv('ADMIN_USERNAME', USUARIO);
    vi.stubEnv('ADMIN_PASSWORD_HASH', await hashPassword(CONTRASENA));
    expect(await verifyAdminLogin(USUARIO, 'otra-cosa-distinta')).toBe(false);
    expect(await verifyAdminLogin('otro-usuario', CONTRASENA)).toBe(false);
    expect(await verifyAdminLogin('', '')).toBe(false);
    expect(await verifyAdminLogin(USUARIO.toUpperCase(), CONTRASENA)).toBe(false);
  });

  it('rejects the password that used to be hardcoded in this repository', async () => {
    // CANDADO. Si alguien vuelve a meter una contraseña por defecto en el
    // código, este test salta. Con el repositorio publicado, esa contraseña
    // abría /admin a cualquiera: crear galerías y leer los datos personales del
    // formulario de contacto.
    vi.stubEnv('ADMIN_USERNAME', USUARIO);
    vi.stubEnv('ADMIN_PASSWORD_HASH', await hashPassword(CONTRASENA));
    expect(await verifyAdminLogin(USUARIO, CONTRASENA_RETIRADA)).toBe(false);
    expect(await verifyAdminLogin('eme', CONTRASENA_RETIRADA)).toBe(false);
    expect(await verifyAdminLogin('admin', CONTRASENA_RETIRADA)).toBe(false);
  });

  it('rejects the old hardcoded password even with nothing configured', async () => {
    // Sin configuración, en desarrollo se usan credenciales aleatorias de un
    // solo arranque. Tampoco por ahí puede colarse la contraseña retirada.
    expect(await verifyAdminLogin('eme', CONTRASENA_RETIRADA)).toBe(false);
  });
});

describe('getAdminCredentials', () => {
  it('refuses to invent credentials in production when nothing is configured', async () => {
    // Un panel sin contraseña configurada en producción es un fallo que tiene
    // que parar el arranque (instrumentation.ts), no degradarse a una cuenta
    // adivinable.
    vi.stubEnv('NODE_ENV', 'production');
    await expect(getAdminCredentials(entorno())).rejects.toBeInstanceOf(AdminConfigError);
    await expect(getAdminCredentials(entorno())).rejects.toThrow(/Falta ADMIN_USERNAME/);
  });

  it('returns the configured username with the configured hash, untouched', async () => {
    const hash = await hashPassword(CONTRASENA);
    vi.stubEnv('ADMIN_USERNAME', `  ${USUARIO}  `);
    vi.stubEnv('ADMIN_PASSWORD_HASH', hash);
    const credentials = await getAdminCredentials();
    expect(credentials.username).toBe(USUARIO);
    expect(credentials.passwordHash).toBe(hash);
  });
});

describe('getDevAdminCredentials', () => {
  it('returns null in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(getDevAdminCredentials()).toBeNull();
  });

  it('returns usable credentials outside production, stable within the process', () => {
    // Levantar `npm run dev` no puede exigir generar un hash antes de poder ver
    // una página pública; pero la contraseña tiene que ser de este arranque, no
    // una que se pueda leer en el código.
    const first = getDevAdminCredentials();
    expect(first).not.toBeNull();
    expect(first!.username).toBeTruthy();
    expect(first!.password.length).toBeGreaterThanOrEqual(12);
    expect(first!.password).not.toBe(CONTRASENA_RETIRADA);
    expect(getDevAdminCredentials()!.password).toBe(first!.password);
  });

  it('generates a different password for each process', async () => {
    // Recargar el módulo equivale a arrancar de nuevo: si la contraseña
    // coincidiera, sería un valor fijo, es decir una contraseña por defecto.
    const first = getDevAdminCredentials()!.password;
    vi.resetModules();
    const reloaded = await import('./admin-store');
    const second = reloaded.getDevAdminCredentials()!.password;
    expect(second).not.toBe(first);
  });
});
