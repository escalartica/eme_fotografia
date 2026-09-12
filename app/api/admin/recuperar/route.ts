import { NextResponse } from 'next/server';
import { crearToken, olvidarToken } from '@/lib/admin-recovery';
import { enviarEnlaceDeRecuperacion, isMailConfigured } from '@/lib/mail';
import { consume, clientKeyFrom } from '@/lib/auth/rate-limit';
import { isSameOriginRequest } from '@/lib/auth/origin-check';
import { site } from '@/content/site';

/**
 * PEDIR EL ENLACE PARA CAMBIAR LA CONTRASEÑA DEL PANEL.
 *
 * No recibe NADA: ni correo ni usuario. Solo hay una cuenta y su buzón lo
 * decide el servidor (ver `destinoDeRecuperacion` en lib/mail.ts), así que no
 * hay ningún dato de entrada que validar ni del que fiarse.
 *
 * LOS LÍMITES SON BAJOS A PROPÓSITO. Cada petición manda un correo, y un
 * correo que se manda solo es una forma de molestar al estudio y de quemar la
 * reputación del buzón. Tres por hora sobran para alguien que ha olvidado su
 * contraseña; de hecho basta con uno.
 */
const POR_HORA = 3;
const UNA_HORA = 60 * 60 * 1000;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }

  const porIp = consume(`recuperar:ip:${clientKeyFrom(request)}`, POR_HORA, UNA_HORA);
  // El cubo global no depende de ninguna cabecera, así que es el que de verdad
  // pone techo: la clave por IP sale de X-Forwarded-For y es falsificable.
  const global = consume('recuperar:cuenta', POR_HORA, UNA_HORA);
  if (!porIp || !global) {
    return NextResponse.json(
      { error: 'Ya se ha pedido un enlace hace poco. Revisa el correo del estudio o espera una hora.' },
      { status: 429 }
    );
  }

  if (!isMailConfigured()) {
    // Esto NO es un secreto que proteger: es una avería que quien intenta
    // entrar necesita saber, porque significa que tiene que ir por el camino
    // manual (docs/DESPLIEGUE.md). Callarlo la dejaría esperando un correo
    // que no va a llegar nunca.
    return NextResponse.json(
      {
        error:
          'El envío de correo no está configurado en el servidor, así que no se puede mandar el enlace. Hay que cambiar la contraseña a mano (ver docs/DESPLIEGUE.md).',
      },
      { status: 503 }
    );
  }

  const { token, expiraEn } = await crearToken();
  const enlace = `${site.siteUrl}/admin/recuperar/${token}`;

  try {
    await enviarEnlaceDeRecuperacion(enlace, expiraEn);
  } catch (err) {
    // Si el correo no sale, el enlace no le sirve a nadie y no tiene por qué
    // quedarse vivo media hora.
    await olvidarToken();
    console.error(`[admin] no se pudo enviar el enlace de recuperación: ${err instanceof Error ? err.message : err}`);
    return NextResponse.json(
      { error: 'No se ha podido enviar el correo. Inténtalo de nuevo en unos minutos.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, expiraEn: expiraEn.toISOString() });
}
