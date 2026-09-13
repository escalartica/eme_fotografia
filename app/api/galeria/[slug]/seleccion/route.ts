import { NextResponse } from 'next/server';
import { getGalleryMeta, saveSelection, type SelectionItem } from '@/lib/gallery-store';
import { getClientSession } from '@/lib/auth/require-session';
import { isSameOriginRequest } from '@/lib/auth/origin-check';
import { consume } from '@/lib/auth/rate-limit';

const MAX_COMMENT_LENGTH = 2000;
/** Una selección no puede tener más entradas que fotos tiene la galería. Sin
 *  este tope, el cuerpo aceptaba un millón y medio de entradas con el mismo
 *  photoId válido y las escribía todas: un selection.json de cientos de MB,
 *  repetible en bucle, que además el panel lee entero para pintar el listado.
 *  Es un atacante con contraseña --la pareja, o a quien le hayan reenviado el
 *  enlace--, pero eso también está dentro del modelo de amenaza. */
const MAX_ITEMS_EXTRA = 50;
/** Un envío cada pocos segundos sobra para alguien que está marcando fotos. */
const ENVIOS_MAX = 30;
const VENTANA_MS = 10 * 60 * 1000;

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }

  const { slug } = await params;
  // getClientSession already enforces that the session's own subject
  // matches this slug -- a logged-in client for gallery A can never
  // write gallery B's selection just by POSTing a different slug in the
  // URL while their own cookie is still attached.
  const session = await getClientSession(slug);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  // Era la ÚNICA ruta que cambia estado sin limitador. La clave es la sesión,
  // no la IP: aquí ya se sabe quién es, así que no hay nada que falsificar.
  if (!consume(`seleccion:${session.subject}`, ENVIOS_MAX, VENTANA_MS)) {
    return NextResponse.json({ error: 'Demasiados envíos seguidos. Espera un momento.' }, { status: 429 });
  }

  const meta = await getGalleryMeta(slug);
  if (!meta) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición no válido.' }, { status: 400 });
  }
  const { items, borrador } = (body ?? {}) as { items?: unknown; borrador?: unknown };
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Formato de selección no válido.' }, { status: 400 });
  }

  // Validate every item against the gallery's REAL photo list -- a
  // client's POST body is attacker-controlled input, so photoId values
  // that don't belong to this gallery, or a comment longer than the
  // sane cap, are dropped rather than trusted verbatim into storage the
  // admin will later read.
  if (items.length > meta.photos.length + MAX_ITEMS_EXTRA) {
    return NextResponse.json({ error: 'Selección demasiado larga.' }, { status: 400 });
  }

  const realPhotoIds = new Set(meta.photos.map((p) => p.id));
  const yaVistos = new Set<string>();
  const cleaned: SelectionItem[] = [];
  for (const raw of items) {
    if (typeof raw !== 'object' || raw === null) continue;
    const { photoId, liked, comment } = raw as Record<string, unknown>;
    if (typeof photoId !== 'string' || !realPhotoIds.has(photoId)) continue;
    // Una foto, una entrada: repetir el mismo photoId válido era la otra
    // mitad de la amplificación, y además dejaba al panel decidiendo cuál de
    // las dos entradas de la misma foto es la buena.
    if (yaVistos.has(photoId)) continue;
    yaVistos.add(photoId);
    cleaned.push({
      photoId,
      liked: liked === true,
      comment: typeof comment === 'string' ? comment.slice(0, MAX_COMMENT_LENGTH) : '',
    });
  }

  await saveSelection(slug, cleaned, { borrador: borrador === true });
  return NextResponse.json({ ok: true });
}
