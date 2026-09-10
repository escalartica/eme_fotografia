import type { ContactSubmission } from '@/lib/contact-store';

/**
 * Outgoing email for the contact form. Sends through Resend's REST API
 * (https://resend.com/docs/api-reference/emails/send-email) with plain
 * `fetch`, so it needs no SDK and no extra dependency.
 *
 * Configuration (see .env.example):
 *   RESEND_API_KEY  -- required to actually send. Without it, `isMailConfigured()`
 *                      is false and the route only keeps the on-disk copy.
 *   CONTACT_TO      -- inbox that receives the leads. Defaults to the studio's
 *                      address, info@emefotografiasevilla.com.
 *   CONTACT_FROM    -- sender shown to the studio. Must belong to a domain
 *                      verified in Resend (e.g. "EME Web <web@emefotografiasevilla.com>").
 */

/**
 * Buzones que reciben las solicitudes, separados por coma.
 *
 * Dos a propósito: `contratos@` es donde el estudio lleva la gestión de cada
 * boda e `info@` es la dirección pública que aparece en la web, de modo que un
 * mensaje no se pierde si alguien está de viaje. Se puede cambiar sin tocar
 * código con la variable CONTACT_TO.
 *
 * Los dos van en emefotografiasevilla.com, que es el dominio que se verifica
 * en Resend. Si el estudio quiere recibir además en otro dominio suyo, se
 * añade aquí separado por coma: es el destinatario, no el remitente, así que
 * no necesita verificación, pero sí tiene que existir de verdad — un buzón
 * inexistente rebota y en un envío con varios destinatarios puede tumbar el
 * envío entero.
 */
export const DEFAULT_CONTACT_TO = 'contratos@emefotografiasevilla.com,info@emefotografiasevilla.com';
const DEFAULT_CONTACT_FROM = 'EME Fotografía Sevilla <web@emefotografiasevilla.com>';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function isMailConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.RESEND_API_KEY && env.RESEND_API_KEY.trim().length > 0);
}

export class MailError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

const LABELS: Record<keyof ContactSubmission, string> = {
  nombre: 'Nombre',
  email: 'Email',
  comoNosConociste: 'Cómo nos conociste',
  tipoEvento: 'Tipo de evento',
  fecha: 'Fecha',
  lugar: 'Lugar',
  numeroInvitados: 'Invitados',
  presupuesto: 'Presupuesto',
  queEsperas: 'Qué esperan de la cobertura',
  mensaje: 'Mensaje',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/** Subject + text + HTML bodies for one lead; exported so tests can assert on them. */
export function renderContactEmail(submission: ContactSubmission, id: string, receivedAt: string) {
  const when = submission.fecha ? ` · ${submission.fecha}` : '';
  const subject = `Nueva solicitud de ${submission.tipoEvento.toLowerCase()}: ${submission.nombre}${when}`;

  const rows = (Object.keys(LABELS) as (keyof ContactSubmission)[])
    .map((key) => [LABELS[key], (submission[key] ?? '').toString().trim()] as const)
    .filter(([, value]) => value.length > 0);

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
export async function sendContactEmail(
  submission: ContactSubmission,
  meta: { id: string; receivedAt: string },
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch
): Promise<SendResult> {
  if (!isMailConfigured(env)) {
    throw new MailError('RESEND_API_KEY no está configurada; el correo no se ha enviado.');
  }
  const { subject, text, html } = renderContactEmail(submission, meta.id, meta.receivedAt);
  const to = (env.CONTACT_TO ?? DEFAULT_CONTACT_TO).split(',').map((s) => s.trim()).filter(Boolean);
  const from = env.CONTACT_FROM ?? DEFAULT_CONTACT_FROM;

  const res = await fetchImpl(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to,
      reply_to: submission.email,
      subject,
      text,
      html,
      tags: [{ name: 'source', value: 'contact-form' }],
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { message?: string };
      detail = body.message ?? '';
    } catch {
      /* body not JSON */
    }
    throw new MailError(`Resend respondió ${res.status}${detail ? `: ${detail}` : ''}`, res.status);
  }
  const body = (await res.json()) as { id?: string };
  return { id: body.id ?? '' };
}
