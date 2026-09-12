import nodemailer from 'nodemailer';
import type { ContactSubmission } from '@/lib/contact-store';

/**
 * EL AVISO POR CORREO DE CADA SOLICITUD DEL FORMULARIO.
 *
 * VA POR EL SMTP DE IONOS, y antes iba por la API de Resend. El cambio no es
 * capricho: los tres buzones del estudio están en IONOS y el destinatario
 * (info@emefotografiasevilla.com) también, así que esto es un correo de IONOS
 * a IONOS -- prácticamente entrega local. Con Resend había que meter en el
 * DNS del dominio los registros de SPF y DKIM que pide, y el DNS de este
 * dominio es exactamente donde una edición anterior se llevó por delante un
 * grupo entero de registros; ahí lo que está en juego son los buzones del
 * estudio.
 *
 * Y de paso desaparece la única transferencia de datos personales fuera del
 * Espacio Económico Europeo que tenía esta web -- Resend está en Estados
 * Unidos --, con lo que el §4 de /privacidad se queda con un encargado menos y
 * sin cláusulas contractuales tipo que justificar.
 *
 * EL REMITENTE TIENE QUE SER UN BUZÓN QUE EXISTA. Aquí ponía
 * `web@emefotografiasevilla.com`, que NO está creado en IONOS: con Resend el
 * correo habría salido igual (firma el dominio entero), pero cualquiera que
 * respondiera al aviso escribiría a un buzón inexistente. Por SMTP, además, el
 * servidor exige autenticarse como ese buzón, así que un remitente que no
 * existe es directamente un envío que no sale.
 *
 * Configuración (ver .env.example):
 *   SMTP_HOST  -- servidor de salida. IONOS: smtp.ionos.es
 *   SMTP_PORT  -- 465 (TLS directo, el de por defecto) o 587 (STARTTLS)
 *   SMTP_USER  -- la dirección completa del buzón desde el que se envía
 *   SMTP_PASS  -- su contraseña
 *   CONTACT_TO -- buzón que recibe las solicitudes
 *   CONTACT_FROM -- remitente que ve el estudio; su dirección tiene que ser
 *                   la misma que SMTP_USER
 *
 * Sin SMTP_HOST/USER/PASS, `isMailConfigured()` es falso y la ruta se limita a
 * guardar el mensaje en disco -- que es lo que llevaba pasando desde que la
 * web se publicó, porque la clave nunca llegó a ponerse.
 */

/**
 * Buzón que recibe las solicitudes. Se pueden poner varios separados por coma.
 *
 * UNO, `info@`, porque es lo que pidió el estudio. Aquí había dos --`info@` y
 * `contratos@`-- con el razonamiento de que un mensaje no se perdiera si
 * alguien estaba de viaje; el estudio prefiere una sola bandeja. Los dos
 * buzones existen en IONOS, así que volver a los dos es añadir una coma.
 *
 * Cualquier dirección que se ponga aquí tiene que EXISTIR de verdad: un buzón
 * inexistente rebota, y en un envío con varios destinatarios puede tumbar el
 * envío entero.
 */
export const DEFAULT_CONTACT_TO = 'info@emefotografiasevilla.com';
const DEFAULT_CONTACT_FROM = 'EME Fotografía Sevilla <info@emefotografiasevilla.com>';

export function isMailConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.SMTP_HOST?.trim() && env.SMTP_USER?.trim() && env.SMTP_PASS?.trim()
  );
}

export class MailError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

const LABELS: Record<keyof ContactSubmission, string> = {
  nombre: 'Nombre',
  email: 'Email',
  telefono: 'Teléfono',
  comoNosConociste: 'Cómo nos conociste',
  tipoEvento: 'Tipo de evento',
  fecha: 'Fecha',
  lugar: 'Lugar',
  numeroInvitados: 'Invitados',
  presupuesto: 'Presupuesto',
  queEsperas: 'Qué esperan de la cobertura',
  mensaje: 'Mensaje',
  // El registro de consentimiento NO va en el correo al estudio: es una
  // prueba que vive en el fichero guardado y se consulta desde el panel, y
  // repetirla en cada aviso sólo alarga un correo que se lee de un vistazo
  // para saber si la fecha está libre. Las tres claves están aquí porque
  // `Record<keyof ContactSubmission, string>` las exige; la cadena vacía es
  // la señal de "no se imprime" (ver el filtro de `campos` más abajo).
  consentimiento: '',
  consentimientoVersion: '',
  consentimientoTexto: '',
  politicaVersion: '',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/** Subject + text + HTML bodies for one lead; exported so tests can assert on them. */
export function renderContactEmail(submission: ContactSubmission, id: string, receivedAt: string) {
  const when = submission.fecha ? ` · ${submission.fecha}` : '';
  const subject = `Nueva solicitud de ${submission.tipoEvento.toLowerCase()}: ${submission.nombre}${when}`;

  // Se filtra por las DOS puntas: un valor vacío no tiene nada que contar, y
  // una etiqueta vacía es la marca de "este campo existe en el tipo pero no
  // se imprime" (el registro de consentimiento, ver LABELS). Sin lo segundo,
  // el correo salía con una línea ": si" colgando al final.
  const rows = (Object.keys(LABELS) as (keyof ContactSubmission)[])
    .map((key) => [LABELS[key], (submission[key] ?? '').toString().trim()] as const)
    .filter(([label, value]) => label.length > 0 && value.length > 0);

  const text = [
    `Nueva solicitud recibida desde emefotografiasevilla.com`,
    ``,
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ``,
    `Recibido: ${receivedAt}`,
    `Referencia: ${id}`,
  ].join('\n');

  const html = `<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#f4f1ec;font-family:Helvetica,Arial,sans-serif;color:#151515">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e6e1d8">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#7a746b">Formulario de contacto</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:400;font-family:Georgia,'Times New Roman',serif">${escapeHtml(submission.nombre)} quiere hablar de su ${escapeHtml(submission.tipoEvento.toLowerCase())}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:8px 0;border-top:1px solid #eee;color:#7a746b;width:38%;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0;border-top:1px solid #eee;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
        )
        .join('')}
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#7a746b">Responde a este correo para contestar directamente a ${escapeHtml(submission.email)}.<br>Recibido ${escapeHtml(receivedAt)} · ref. ${escapeHtml(id)}</p>
  </div></body></html>`;

  return { subject, text, html };
}

export interface SendResult {
  /** Provider message id. */
  id: string;
}

/**
 * Sends the lead to the studio inbox. Throws `MailError` when the provider
 * rejects the request; the caller decides whether that is fatal.
 */
/** Lo único que esta función necesita de un transporte. Inyectable para que
 *  las pruebas no abran un socket ni manden un correo de verdad. */
export type EnviarCorreo = (mensaje: {
  from: string;
  to: string[];
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}) => Promise<{ messageId?: string }>;

function transportePorDefecto(env: NodeJS.ProcessEnv): EnviarCorreo {
  const port = Number(env.SMTP_PORT ?? 465);
  const transporte = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    // 465 es TLS desde el primer byte; 587 empieza en claro y sube con
    // STARTTLS. IONOS admite los dos y recomienda 465, que es el que se usa
    // por defecto: una conexión que nunca está en claro no depende de que el
    // servidor anuncie bien sus capacidades.
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    // Si el servidor de correo no responde, la pareja no puede quedarse
    // esperando: el mensaje YA está guardado en disco y la ruta sabe
    // contestar `delivered: false`.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return (mensaje) => transporte.sendMail(mensaje);
}

/**
 * Manda la solicitud al buzón del estudio. Lanza `MailError` cuando el
 * servidor de correo la rechaza; quien llama decide si eso es fatal (y no lo
 * es: el mensaje ya está guardado antes de llegar aquí).
 */
export async function sendContactEmail(
  submission: ContactSubmission,
  meta: { id: string; receivedAt: string },
  env: NodeJS.ProcessEnv = process.env,
  enviar?: EnviarCorreo
): Promise<SendResult> {
  if (!isMailConfigured(env)) {
    throw new MailError('El correo de salida no está configurado (SMTP_HOST/SMTP_USER/SMTP_PASS).');
  }
  const { subject, text, html } = renderContactEmail(submission, meta.id, meta.receivedAt);
  const to = (env.CONTACT_TO ?? DEFAULT_CONTACT_TO).split(',').map((s) => s.trim()).filter(Boolean);
  const from = env.CONTACT_FROM ?? DEFAULT_CONTACT_FROM;

  try {
    const resultado = await (enviar ?? transportePorDefecto(env))({
      from,
      to,
      // La respuesta del estudio va a la pareja, no a su propio buzón. Es la
      // línea que hace que «Responder» en el correo funcione sin pensar.
      replyTo: submission.email,
      subject,
      text,
      html,
    });
    return { id: resultado.messageId ?? '' };
  } catch (err) {
    // El detalle va al log del servidor; al cliente le llega el mensaje
    // genérico que compone la ruta.
    throw new MailError(
      `El servidor de correo rechazó el envío: ${err instanceof Error ? err.message : 'error desconocido'}`
    );
  }
}

/* ------------------------------------------------------------------ */
/* El enlace para recuperar la contraseña del panel                    */
/* ------------------------------------------------------------------ */

/**
 * EL DESTINO NO SE PIDE, SE DECIDE AQUÍ. Nunca sale de una variable que venga
 * del navegador: un formulario de recuperación que acepta una dirección es un
 * formulario que le manda el enlace a quien la escriba. Va al buzón del
 * estudio y a ninguna otra parte.
 */
export function destinoDeRecuperacion(env: NodeJS.ProcessEnv = process.env): string[] {
  return (env.ADMIN_EMAIL ?? env.CONTACT_TO ?? DEFAULT_CONTACT_TO)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function enviarEnlaceDeRecuperacion(
  enlace: string,
  expiraEn: Date,
  env: NodeJS.ProcessEnv = process.env,
  enviar?: EnviarCorreo
): Promise<SendResult> {
  if (!isMailConfigured(env)) {
    throw new MailError('El correo de salida no está configurado (SMTP_HOST/SMTP_USER/SMTP_PASS).');
  }
  const hora = expiraEn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const texto = [
    'Has pedido cambiar la contraseña del panel de EME Fotografía Sevilla.',
    '',
    'Abre este enlace y elige una nueva:',
    enlace,
    '',
    `El enlace caduca a las ${hora} y sirve una sola vez.`,
    '',
    'Si no has sido tú, no hagas nada: sin abrir el enlace no cambia nada, y',
    'quien lo pidió no puede entrar. Pero conviene que lo sepas.',
  ].join('\n');

  const html = `<!doctype html><html lang="es"><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.6;color:#111">
  <p>Has pedido cambiar la contraseña del panel de EME Fotografía Sevilla.</p>
  <p><a href="${escapeHtml(enlace)}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:4px">Elegir una contraseña nueva</a></p>
  <p style="font-size:14px;color:#555">El enlace caduca a las ${escapeHtml(hora)} y sirve una sola vez.<br>
  Si el botón no funciona, copia esta dirección en el navegador:<br>
  <span style="word-break:break-all">${escapeHtml(enlace)}</span></p>
  <p style="font-size:14px;color:#555">Si no has sido tú, no hagas nada: sin abrir el enlace no cambia nada, y quien lo pidió no puede entrar. Pero conviene que lo sepas.</p>
  </body></html>`;

  try {
    const resultado = await (enviar ?? transportePorDefecto(env))({
      from: env.CONTACT_FROM ?? DEFAULT_CONTACT_FROM,
      to: destinoDeRecuperacion(env),
      // Nadie tiene que responder a esto.
      replyTo: env.SMTP_USER ?? '',
      subject: 'Cambiar la contraseña del panel de EME',
      text: texto,
      html,
    });
    return { id: resultado.messageId ?? '' };
  } catch (err) {
    throw new MailError(
      `El servidor de correo rechazó el envío: ${err instanceof Error ? err.message : 'error desconocido'}`
    );
  }
}
