/**
 * El texto y las reglas de la contraseña que EME entrega a cada pareja.
 *
 * Viven fuera del formulario porque son las dos cosas de esa pantalla que
 * salen de la web: el mensaje acaba pegado en un WhatsApp y la contraseña
 * acaba protegiendo las fotos de la boda de alguien. Las dos se pueden
 * probar aquí sin montar el formulario entero.
 */

/**
 * Diez, no ocho.
 *
 * En la primera galería real que se creó desde el panel, la contraseña
 * elegida a mano fue «12345678»: ocho caracteres bastaban, así que ocho
 * caracteres fue lo que se escribió. El mínimo no es una opinión sobre
 * criptografía, es lo que decide qué se teclea cuando hay prisa.
 */
export const MIN_PASSWORD_LENGTH = 10;

/** Sin 0/O/1/l/i: esta contraseña se lee en voz alta por teléfono y se copia
 *  a mano desde una nota, y esos cinco caracteres son los que se confunden. */
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';

/** Diez caracteres al azar. `globalThis.crypto` existe igual en el navegador
 *  y en Node, así que esta función sirve en las dos pantallas del panel. */
export function generarPassword(): string {
  const bytes = new Uint32Array(MIN_PASSWORD_LENGTH);
  globalThis.crypto.getRandomValues(bytes);
  let out = '';
  for (const n of bytes) out += ALFABETO[n % ALFABETO.length];
  return out;
}

const SECUENCIAS = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl'];

const SUGERENCIA = 'Pulsa «Generar» y se crea una segura.';

/**
 * Devuelve el motivo por el que una contraseña no vale, o null si vale.
 *
 * Comprobar solo la longitud deja pasar «1234567890», que es exactamente
 * el tipo de contraseña que alguien escribe cuando el campo le pide diez
 * caracteres y tiene la cabeza en las cuarenta fotos que está subiendo.
 */
export function motivoPasswordDebil(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres. ${SUGERENCIA}`;
  }

  const limpia = password.toLowerCase();

  if (/^\d+$/.test(limpia)) {
    return `Una contraseña de solo números se adivina en segundos. ${SUGERENCIA}`;
  }

  if (new Set(limpia).size <= 3) {
    return `Esa contraseña repite casi siempre los mismos caracteres. ${SUGERENCIA}`;
  }

  for (const secuencia of SECUENCIAS) {
    const alReves = [...secuencia].reverse().join('');
    if (secuencia.includes(limpia) || alReves.includes(limpia)) {
      return `Esa contraseña es una secuencia seguida del teclado. ${SUGERENCIA}`;
    }
  }

  return null;
}

export interface DatosDeLaPareja {
  clientName: string;
  shareUrl: string;
  username: string;
  password: string;
}

/**
 * El texto que el estudio pega en WhatsApp.
 *
 * Escrito para que la pareja entienda qué hay dentro y por qué merece la
 * pena entrar, no solo para entregarle tres datos.
 *
 * CADA PÁRRAFO VA EN UNA SOLA LÍNEA, por larga que parezca aquí. Estuvo
 * partido a mano a lo ancho de esta ventana y en WhatsApp se leía con los
 * cortes en mitad de la frase («dejarnos una nota en cualquiera / de
 * ellas»), porque el cliente de mensajería ya ajusta el ancho y respeta
 * los saltos que le manden. Los únicos saltos que hay que escribir son los
 * que separan párrafos.
 */
export function mensajeParaLaPareja(g: DatosDeLaPareja): string {
  return [
    `Hola, ${g.clientName}:`,
    '',
    'Ya tenéis lista vuestra galería privada. Este enlace es solo vuestro:',
    '',
    g.shareUrl,
    `Usuario: ${g.username}`,
    `Contraseña: ${g.password}`,
    '',
    'Dentro podéis marcar con el corazón las fotos que más os gusten y dejarnos una nota en cualquiera de ellas: lo que nos contéis es lo que usamos para preparar el álbum.',
    '',
    'Se va guardando solo mientras vais marcando, así que podéis tomároslo con calma, dejarlo a medias y volver cuando queráis.',
    '',
    'Cualquier cosa, nos decís.',
    'EME Fotografía Sevilla',
  ].join('\n');
}
