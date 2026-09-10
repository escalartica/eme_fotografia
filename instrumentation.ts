/**
 * Comprobación de configuración al arrancar el servidor. Next.js llama a
 * `register()` una sola vez, cuando se levanta la instancia.
 *
 * Existe porque las credenciales del panel salen ahora del entorno
 * (lib/admin-store.ts) y un fallo de configuración tiene que verse AL
 * ARRANCAR y no el día que el estudio intente entrar en /admin y no pueda.
 * Se lanza una excepción a propósito: un servidor con el panel mal configurado
 * no debe quedarse en pie fingiendo que todo va bien.
 */
export async function register() {
  // Solo en el runtime de Node: en el runtime edge no hay ni fs ni las mismas
  // variables, y esta comprobación no aporta nada allí.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  // Durante `next build` no hay por qué exigir secretos de producción: en
  // muchos hostings las variables solo existen en tiempo de ejecución, y
  // reventar el build por eso impediría desplegar.
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  const { adminConfigProblem, getDevAdminCredentials } = await import('@/lib/admin-store');
  const problem = adminConfigProblem();
  if (!problem) return;

  // En desarrollo NO se para el servidor. Hacerlo impediría levantar la web
  // para mirar una página pública hasta tener un hash generado, y el efecto
  // real de eso es que alguien acabe poniendo una contraseña cómoda y fija
  // en .env.local, que es la situación que este cambio vino a corregir. En su
  // lugar se avisa y se imprime una contraseña aleatoria de un solo arranque.
  const dev = getDevAdminCredentials();
  if (dev) {
    console.warn(
      `\n[EME] Aviso: el panel de administración no está configurado (${problem})\n` +
        '      Para ESTE arranque de desarrollo se han generado credenciales temporales:\n\n' +
        `        usuario:     ${dev.username}\n` +
        `        contraseña:  ${dev.password}\n\n` +
        '      Cambian en cada reinicio y NO funcionan en producción. Antes de publicar,\n' +
        '      fija ADMIN_USERNAME y ADMIN_PASSWORD_HASH en el hosting (ver .env.example).\n'
    );
    return;
  }

  console.error(
    '\n[EME] El servidor NO puede arrancar: el panel de administración está mal configurado.\n' +
      `       ${problem}\n` +
      '       Revisa .env.example y fija las variables en el hosting antes de publicar.\n'
  );
  throw new Error(`Configuración del panel de administración inválida: ${problem}`);
}
