import { FOTOS_POR_TANDA, repartirEnTandas } from '@/lib/gallery-limits';
import { reducirFoto } from '@/lib/reducir-foto';

/**
 * SUBE UNA BODA ENTERA, DE TANDA EN TANDA.
 *
 * Lo usan el alta de una galería (app/admin/galerias/nueva) y el «Añadir
 * fotos» de una galería ya creada (app/admin/galerias/[slug]). Hace tres
 * cosas, en este orden y tanda a tanda:
 *
 *  1. Encoge las fotos de la tanda en el navegador (lib/reducir-foto.ts), de
 *     una en una. Una tanda cada vez y no las 1.200 de golpe: encogidas todas
 *     antes de empezar serían 700 MB vivos en la memoria de la pestaña.
 *  2. Las manda en una petición, con barra de progreso.
 *  3. Si la red falla o el servidor está ocupado, repite ESA tanda unas
 *     cuantas veces antes de rendirse. Con cuarenta peticiones seguidas, que
 *     una se corte por la wifi es lo normal, no la excepción, y no puede
 *     tirar abajo una subida de media hora.
 *
 * Si al final una tanda no entra, para y dice cuántas fotos se han subido:
 * quien llama decide qué ofrecer (normalmente, reintentar las que faltan).
 */

export interface RespuestaSubida {
  ok: boolean;
  status: number;
  data: Record<string, unknown> | null;
}

export interface Avance {
  fase: 'preparando' | 'subiendo';
  /** Fotos ya guardadas en el servidor. */
  subidas: number;
  /** Fotos de la tanda en curso ya encogidas (solo en la fase «preparando»). */
  preparadas: number;
  /** Cuántas fotos lleva la tanda en curso. */
  enLaTanda: number;
  /** De 0 a 1: lo enviado de la petición en curso. */
  fraccionTanda: number;
  total: number;
}

export type ResultadoTandas =
  | { ok: true; subidas: number }
  | { ok: false; subidas: number; error: string; status: number };

/** Envía un FormData con barra de progreso, que `fetch` todavía no sabe dar.
 *  Un 413 de nginx llega como HTML: `data` queda en null y el mensaje lo pone
 *  quien llama. */
export function enviarConProgreso(
  url: string,
  form: FormData,
  alProgresar: (fraccion: number) => void
): Promise<RespuestaSubida> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && e.total > 0) alProgresar(e.loaded / e.total);
    });
    xhr.addEventListener('load', () => {
      let data: Record<string, unknown> | null = null;
      try {
        data = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        // HTML de nginx o cuerpo vacío.
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    });
    xhr.addEventListener('error', () => reject(new Error('red')));
    xhr.send(form);
  });
}

/** Un 4xx que no sea 408 ni 429 es el servidor diciendo «esto no»: repetirlo
 *  dentro de un segundo dará lo mismo. Lo demás (red caída, 5xx, 408, 429)
 *  merece otro intento. */
function mereceOtroIntento(status: number): boolean {
  if (status === 0) return true;
  if (status === 408 || status === 429) return true;
  return status >= 500;
}

const INTENTOS = 4;
const ESPERA_INICIAL_MS = 2000;

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function mensajeDeError(res: RespuestaSubida): string {
  if (res.status === 413) {
    return 'El servidor no admite una subida tan grande de una vez. Exporta las fotos a menos resolución.';
  }
  if (res.status === 0) return 'No se pudo conectar. Comprueba tu conexión.';
  return (res.data?.error as string | undefined) ?? 'El servidor no ha aceptado las fotos.';
}

export async function subirEnTandas({
  fotos,
  enviarTanda,
  alAvanzar,
  encoger = reducirFoto,
}: {
  fotos: readonly File[];
  /** Manda una tanda ya encogida. `indice` es 0 en la primera. */
  enviarTanda: (
    tanda: File[],
    indice: number,
    alProgresar: (f: number) => void,
    /** El mismo en todos los reintentos de esta tanda: es lo que deja al
     *  servidor reconocer una repetida y no guardar las fotos dos veces. */
    idTanda: string
  ) => Promise<RespuestaSubida>;
  alAvanzar: (a: Avance) => void;
  /** Inyectable para los tests; en el navegador es lib/reducir-foto.ts. */
  encoger?: (f: File) => Promise<File>;
}): Promise<ResultadoTandas> {
  const total = fotos.length;
  let subidas = 0;
  let indice = 0;

  // Primero se cortan los ORIGINALES por número. El peso se ajusta después,
  // ya encogidas, que es lo que de verdad viaja.
  for (const grupo of repartirEnTandas(fotos, FOTOS_POR_TANDA, Number.POSITIVE_INFINITY)) {
    const listas: File[] = [];
    alAvanzar({ fase: 'preparando', subidas, preparadas: 0, enLaTanda: grupo.length, fraccionTanda: 0, total });
    for (const original of grupo) {
      listas.push(await encoger(original));
      alAvanzar({ fase: 'preparando', subidas, preparadas: listas.length, enLaTanda: grupo.length, fraccionTanda: 0, total });
    }

    for (const tanda of repartirEnTandas(listas)) {
      const idTanda = crypto.randomUUID();
      let espera = ESPERA_INICIAL_MS;
      let ultima: RespuestaSubida = { ok: false, status: 0, data: null };
      for (let intento = 1; intento <= INTENTOS; intento += 1) {
        alAvanzar({ fase: 'subiendo', subidas, preparadas: tanda.length, enLaTanda: tanda.length, fraccionTanda: 0, total });
        try {
          ultima = await enviarTanda(tanda, indice, (fraccionTanda) =>
            alAvanzar({ fase: 'subiendo', subidas, preparadas: tanda.length, enLaTanda: tanda.length, fraccionTanda, total }),
            idTanda
          );
        } catch {
          ultima = { ok: false, status: 0, data: null };
        }
        if (ultima.ok || !mereceOtroIntento(ultima.status) || intento === INTENTOS) break;
        await esperar(espera);
        espera *= 2;
      }
      if (!ultima.ok) {
        return { ok: false, subidas, error: mensajeDeError(ultima), status: ultima.status };
      }
      subidas += tanda.length;
      indice += 1;
    }
  }
  alAvanzar({ fase: 'subiendo', subidas, preparadas: 0, enLaTanda: 0, fraccionTanda: 1, total });
  return { ok: true, subidas };
}
