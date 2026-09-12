import { saveContactSubmission, ContactValidationError } from '@/lib/contact-store';
import { isMailConfigured, sendContactEmail, MailError } from '@/lib/mail';
import { consume, clientKeyFrom } from '@/lib/auth/rate-limit';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

// Un formulario público sin freno es spam garantizado, y aquí cada envío
// además escribe un fichero en disco y dispara un correo de pago (Resend).
// Cinco envíos por hora y dirección son más de los que hace una pareja real
// (que manda uno) y suficientes para que reintentar tras un error no dé un
// portazo. El cubo global es el que de verdad frena a un bot: la clave por IP
// sale de X-Forwarded-For, que se puede falsificar en cada petición, así que
// sin un techo absoluto por ruta el límite por IP no frena nada.
const PER_IP_MAX = 5;
const GLOBAL_MAX = 60;
const WINDOW_MS = 60 * 60 * 1000; // 1 hora

/**
 * Contact form endpoint. Every valid submission is (1) written to
 * data/contact-submissions/ as a permanent backup and (2) emailed to the
 * studio inbox (lib/mail.ts). The email is the real delivery: if the
 * provider is configured and rejects the message, the client gets a 502
 * with a fallback address so the lead is never silently lost. If no
 * provider is configured (no RESEND_API_KEY), the submission is still
 * stored and listed in /admin/mensajes, and the response says so with
 * `delivered: false`.
 */
export async function POST(request: Request) {
  // El formulario vive en esta misma web y envía con fetch same-origin, así
  // que exigir Origin propio no rompe nada y descarta de entrada al bot que
  // publica contra la ruta desde otro sitio.
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }

  const ipAllowed = consume(`contacto:ip:${clientKeyFrom(request)}`, PER_IP_MAX, WINDOW_MS);
  const globalAllowed = consume('contacto:global', GLOBAL_MAX, WINDOW_MS);
  if (!ipAllowed || !globalAllowed) {
    return Response.json(
      {
        error:
          'Hemos recibido demasiados envíos desde aquí. Inténtalo dentro de un rato o escríbenos a info@emefotografiasevilla.com.',
      },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'El cuerpo de la petición no es JSON válido.' }, { status: 400 });
  }

  let saved: Awaited<ReturnType<typeof saveContactSubmission>>;
  try {
    saved = await saveContactSubmission(payload as Parameters<typeof saveContactSubmission>[0]);
  } catch (err) {
    if (err instanceof ContactValidationError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    // Unexpected error (e.g. filesystem failure) — never leak internal details to the client.
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }

  if (!isMailConfigured()) {
    console.warn(`[contacto] correo de salida sin configurar (SMTP_HOST/SMTP_USER/SMTP_PASS): el mensaje ${saved.id} se ha guardado pero no se ha avisado por correo.`);
    return Response.json({ id: saved.id, delivered: false }, { status: 200 });
  }

  try {
    // `saved.clean`, NO `payload`: el crudo se salta todos los topes de
    // longitud que `saveContactSubmission` sí aplica a lo que va a disco.
    const { id: messageId } = await sendContactEmail(saved.clean, saved);
    return Response.json({ id: saved.id, delivered: true, messageId }, { status: 200 });
  } catch (err) {
    const detail = err instanceof MailError ? err.message : 'error desconocido';
    console.error(`[contacto] Fallo al enviar el mensaje ${saved.id}: ${detail}`);
    return Response.json(
      {
        id: saved.id,
        delivered: false,
        error: 'No hemos podido enviar vuestro mensaje ahora mismo. Escribidnos directamente a info@emefotografiasevilla.com.',
      },
      { status: 502 }
    );
  }
}
