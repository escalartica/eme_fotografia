/**
 * LEER EL CUERPO JSON DE UNA PETICIÓN, CON TECHO.
 *
 * `request.json()` lee el cuerpo ENTERO en memoria antes de mirar nada, y en
 * las rutas de este proyecto no hay ningún otro límite delante salvo el de
 * nginx, que está en 420 MB porque las fotos de las galerías lo necesitan
 * (docs/DESPLIEGUE.md §7). O sea: cualquiera podía mandar 400 MB de JSON al
 * formulario de contacto o al login y el proceso los cargaba y los
 * convertía en objetos --varias veces ese tamaño en RAM-- antes de que el
 * limitador o la validación pudieran decir nada. Unas pocas a la vez tumban
 * el único proceso Node que sirve la web.
 *
 * Esto corta en cuanto se pasa del tope, sin haber leído el resto:
 *   1. si la petición declara Content-Length y ya pasa, ni se empieza;
 *   2. si no lo declara (o miente), se cuenta mientras llega y se aborta.
 *
 * Lanza un error en cualquier fallo (demasiado grande, cuerpo vacío, JSON
 * roto), igual que `request.json()`: las rutas ya lo envuelven en un
 * try/catch que responde 400, así que el cambio en cada una es una palabra.
 */

export class CuerpoDemasiadoGrande extends Error {
  constructor(public readonly maxBytes: number) {
    super(`El cuerpo de la petición supera ${maxBytes} bytes.`);
    this.name = 'CuerpoDemasiadoGrande';
  }
}

/** Topes por tipo de ruta. Holgados para un uso real; ridículos para un ataque. */
export const MAX_JSON_PEQUENO = 8 * 1024; // logins, contraseñas, beacon de visitas
export const MAX_JSON_FORMULARIO = 64 * 1024; // formulario de contacto
// La selección de una galería: hasta 3.050 entradas con un comentario de hasta
// 2.000 caracteres cada una (app/api/galeria/[slug]/seleccion/route.ts).
export const MAX_JSON_SELECCION = 16 * 1024 * 1024;

export async function leerJson(request: Request, maxBytes: number): Promise<unknown> {
  const declarado = Number(request.headers.get('content-length'));
  if (Number.isFinite(declarado) && declarado > maxBytes) {
    throw new CuerpoDemasiadoGrande(maxBytes);
  }

  if (!request.body) throw new SyntaxError('Cuerpo vacío.');

  const lector = request.body.getReader();
  const trozos: Uint8Array[] = [];
  let leidos = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    leidos += value.byteLength;
    if (leidos > maxBytes) {
      await lector.cancel().catch(() => {});
      throw new CuerpoDemasiadoGrande(maxBytes);
    }
    trozos.push(value);
  }

  const todo = new Uint8Array(leidos);
  let pos = 0;
  for (const t of trozos) {
    todo.set(t, pos);
    pos += t.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(todo));
}
