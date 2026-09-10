import { NextResponse } from 'next/server';
import { deleteContactSubmission, isValidSubmissionId } from '@/lib/contact-store';
import { getAdminSession } from '@/lib/auth/require-session';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

/**
 * Borrado de un mensaje de contacto desde el panel (RGPD art. 17, derecho de
 * supresión). Hasta ahora no existía NINGUNA forma de borrar: el nombre, el
 * correo y el texto libre de una pareja se quedaban en data/contact-submissions/
 * indefinidamente y atender una petición de supresión exigía entrar por SSH.
 *
 * Tres puertas antes de tocar el disco:
 *   1. sesión de administración válida -- si no, 401 (sin ella cualquiera
 *      podría borrar los mensajes del estudio, que es tan grave como leerlos);
 *   2. Origin propio -- sin esto, una web cualquiera podría hacer que el
 *      navegador del estudio, con su cookie puesta, borrara sus mensajes solo
 *      por visitarla;
 *   3. el id tiene forma de UUID -- es un segmento de URL que acaba en un
 *      path.join, así que un `../../admin/users` no puede llegar al disco.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  if (!isSameOriginRequest(_request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }

  const { id } = await params;
  if (!isValidSubmissionId(id)) {
    return NextResponse.json({ error: 'Mensaje no encontrado.' }, { status: 404 });
  }

  const deleted = await deleteContactSubmission(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Mensaje no encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
