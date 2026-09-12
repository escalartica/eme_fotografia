import { NextResponse } from 'next/server';
import { deleteGallery, getGalleryMeta, isValidSlug, updateGalleryPasswordHash } from '@/lib/gallery-store';
import { hashPassword } from '@/lib/auth/password';
import { destroySessionsForSubject } from '@/lib/auth/session';
import { getAdminSession } from '@/lib/auth/require-session';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

/**
 * Las dos operaciones que le faltaban al panel sobre una galería ya creada:
 * borrarla y cambiarle la contraseña. Hasta ahora sólo se podía crear y
 * mirar.
 *
 * Las tres puertas de siempre, en el mismo orden que /api/admin/mensajes/[id]:
 *   1. sesión de administración -- sin ella cualquiera podría borrar las
 *      bodas del estudio;
 *   2. Origin propio -- sin esto, una web cualquiera podría hacer que el
 *      navegador del estudio, con su cookie puesta, borrara una galería sólo
 *      por visitarla (CSRF);
 *   3. el slug tiene forma válida -- es un segmento de URL que acaba dentro
 *      de un path.join sobre data/galleries/, así que un `../..` no puede
 *      llegar al disco.
 */

const MAX_PASSWORD_LENGTH = 200;

/**
 * BORRA LA GALERÍA Y CIERRA LAS SESIONES ABIERTAS DE ESA BODA.
 *
 * Lo segundo importa tanto como lo primero y es fácil de olvidar: las
 * sesiones de cliente duran treinta días, así que sin cerrarlas una pareja
 * que tuviera su galería abierta seguiría viendo las fotos durante un mes
 * después de un borrado que se pidió justamente para que dejaran de estar.
 * Las fotos ya no se sirven --la ruta las lee del disco y el disco está
 * vacío-- pero la sesión seguiría siendo válida, y eso no es lo que nadie
 * entiende por "borrada".
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }

  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  let borrada: boolean;
  try {
    borrada = await deleteGallery(slug);
  } catch (err) {
    // `deleteGallery` sólo devuelve false cuando la galería no existía;
    // cualquier otro fallo lo lanza. Distinguirlo importa: un 404 le dice al
    // estudio que no ha pasado nada, y lo que puede haber pasado es un
    // borrado a medias con la pareja todavía dentro.
    console.error(`[galerias] fallo al borrar ${slug}:`, err);
    return NextResponse.json(
      { error: 'No se ha podido borrar la galería. Revisa el servidor antes de volver a intentarlo.' },
      { status: 500 }
    );
  }
  if (!borrada) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  // Después del borrado, no antes: si el borrado falla, cerrar las sesiones
  // habría echado a la pareja de una galería que sigue existiendo.
  // Y si la revocación falla se dice, aunque las fotos ya no estén: una
  // sesión que sigue viva es algo que el estudio tiene que saber.
  try {
    const sesionesCerradas = await destroySessionsForSubject('client', slug);
    return NextResponse.json({ ok: true, sesionesCerradas });
  } catch (err) {
    console.error(`[galerias] galería ${slug} borrada, pero quedan sesiones abiertas:`, err);
    return NextResponse.json(
      {
        ok: true,
        revocacionParcial: true,
        error: 'La galería se ha borrado, pero no se han podido cerrar todas las sesiones abiertas.',
      },
      { status: 207 }
    );
  }
}

/**
 * CAMBIA LA CONTRASEÑA, y cierra también las sesiones de esa galería.
 *
 * Una sesión viva es una contraseña vieja que sigue funcionando: si se cambia
 * porque se ha filtrado, dejar abiertas las sesiones que esa contraseña abrió
 * deja el problema exactamente donde estaba. Quien tenga que seguir entrando
 * vuelve a entrar con la nueva, que es el único inconveniente y es el
 * correcto.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }

  const { slug } = await params;
  if (!isValidSlug(slug) || !(await getGalleryMeta(slug))) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'El cuerpo de la petición no es JSON válido.' }, { status: 400 });
  }
  const { password } = (body ?? {}) as { password?: unknown };
  if (typeof password !== 'string') {
    return NextResponse.json({ error: 'Falta la contraseña.' }, { status: 400 });
  }
  // Mismo mínimo que al crear la galería (ver POST en ../route.ts): si
  // divergieran, el panel aceptaría al cambiar una contraseña que no habría
  // aceptado al crear.
  if (password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
  }
  // SE RECHAZA, NO SE RECORTA. Recortando en silencio, el panel guardaba una
  // contraseña distinta de la que el estudio acababa de escribir y le iba a
  // pasar al cliente: la pareja no podía entrar y nadie sabía por qué.
  if (password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña no puede pasar de ${MAX_PASSWORD_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  let cambiada: boolean;
  try {
    cambiada = await updateGalleryPasswordHash(slug, await hashPassword(password));
  } catch (err) {
    console.error(`[galerias] fallo al cambiar la contraseña de ${slug}:`, err);
    return NextResponse.json({ error: 'No se ha podido cambiar la contraseña.' }, { status: 500 });
  }
  if (!cambiada) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  // Aquí la revocación NO es un remate: la contraseña se cambia porque la
  // vieja ya no vale, y una sesión abierta es esa contraseña vieja todavía
  // funcionando. Si falla, el estudio tiene que enterarse.
  try {
    const sesionesCerradas = await destroySessionsForSubject('client', slug);
    return NextResponse.json({ ok: true, sesionesCerradas });
  } catch (err) {
    console.error(`[galerias] contraseña de ${slug} cambiada, pero quedan sesiones abiertas:`, err);
    return NextResponse.json(
      {
        ok: true,
        revocacionParcial: true,
        error:
          'La contraseña se ha cambiado, pero no se han podido cerrar las sesiones que ya estaban abiertas con la anterior.',
      },
      { status: 207 }
    );
  }
}
