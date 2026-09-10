import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Redirige el directorio `data/` de los módulos de servidor a un directorio
 * temporal, SOLO para los tests.
 *
 * lib/gallery-store.ts, lib/auth/session.ts y lib/contact-store.ts fijan su
 * ruta de datos con `path.join(process.cwd(), 'data', ...)` en una constante de
 * módulo, es decir EN EL MOMENTO DE CARGARSE. No hay ningún parámetro por el
 * que redirigirlos después (contact-store sí lo tiene; los otros dos no).
 *
 * Por qué importa: sin esto, un `npm test` en la máquina que sirve el sitio
 * escribiría galerías, sesiones y selecciones de prueba dentro de los datos
 * reales del estudio -- y la limpieza de los tests borraría fotos de bodas de
 * clientes. Ese riesgo ya obligó una vez a reescribir
 * app/api/contacto/route.test.ts (ver su comentario de cabecera).
 *
 * La única palanca disponible es `process.cwd`, así que se sustituye justo
 * durante la carga del módulo y se restaura inmediatamente después: para cuando
 * el primer test se ejecuta, la constante ya está calculada contra el directorio
 * temporal y `process.cwd` vuelve a ser el de verdad.
 */
export interface TempDataRoot {
  /** Raíz temporal; `data/` cuelga de aquí. */
  readonly root: string;
  /** Carga módulos con `process.cwd()` apuntando a `root`. */
  load<T>(loader: () => Promise<T>): Promise<T>;
}

const realCwd = process.cwd;

export function createTempDataRoot(prefix: string): TempDataRoot {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  return {
    root,
    async load<T>(loader: () => Promise<T>): Promise<T> {
      process.cwd = () => root;
      try {
        return await loader();
      } finally {
        process.cwd = realCwd;
      }
    },
  };
}
