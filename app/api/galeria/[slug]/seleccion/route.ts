import { NextResponse } from 'next/server';
import { getGalleryMeta, getSelection, saveSelection, type SelectionItem } from '@/lib/gallery-store';
import { getClientSession } from '@/lib/auth/require-session';
import { isSameOriginRequest } from '@/lib/auth/origin-check';
import { consume } from '@/lib/auth/rate-limit';
import { avisarDeSeleccion, isMailConfigured } from '@/lib/mail';
import { site } from '@/content/site';

const MAX_COMMENT_LENGTH = 2000;
/** Una selección no puede tener más entradas que fotos tiene la galería. Sin
 *  este tope, el cuerpo aceptaba un millón y medio de entradas con el mismo
 *  photoId válido y las escribía todas: un selection.json de cientos de MB,
 *  repetible en bucle, que además el panel lee entero para pintar el listado.
 *  Es un atacante con contraseña --la pareja, o a quien le hayan reenviado el
 *  enlace--, pero eso también está dentro del modelo de amenaza. */
const MAX_ITEMS_EXTRA = 50;
/**
 * EL TECHO ESTABA EN 30 Y SE LO COMÍA UNA PAREJA NORMAL.
 *
 * Desde que la galería guarda sola, cada corazón que se marca acaba en una
 * petición: se espera ESPERA_GUARDADO_MS de quietud y se manda. Alguien
 * repasando fotos con calma marca una cada pocos segundos, o sea una petición
 * por foto -- treinta fotos y el resto de la tarde con «No hemos podido
 * guardar», que es exactamente la pareja que más nos interesa que siga.
 *
 * 240 en diez minutos es una cada dos segundos y medio sostenida: por encima
 * de cualquier persona marcando fotos y muy por debajo de lo que haría falta
 * para llenar un disco, que es de lo que protege este tope (el cuerpo ya
 * viene acotado por MAX_ITEMS_EXTRA y por el largo del comentario).
 */
const ENVIOS_MAX = 240;
const VENTANA_MS = 10 * 60 * 1000;

/**
 * UN AVISO POR CORREO COMO MUCHO CADA HORA Y POR GALERÍA.
 *
 * El limitador de arriba protege el disco, no el buzón, y son dos cosas
 * distintas. Con 240 envíos permitidos cada diez minutos, un aviso por cada
 * `borrador: false` son 240 correos en diez minutos al buzón del estudio,
 * disparables por cualquiera que tenga el enlace y la contraseña de una
 * galería --que es el modelo de amenaza que este mismo fichero declara-- y
 * suficiente para quemar la cuota del proveedor de correo y, con ella, el
 * formulario de contacto, que es por donde entra el trabajo.
 *
 * Y sin mala intención tampoco hace falta: una pareja que pulsa «Enviar»
 * tres veces porque no vio la confirmación manda tres correos.
 *
 * La hora se cuenta desde el último envío definitivo YA GUARDADO, no desde
 * un contador en memoria: sobrevive a un reinicio del proceso y no ocupa
 * nada.
 */
const AVISO_MIN_MS = 60 * 60 * 1000;

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

  const esBorrador = borrador === true;
  // Lo que había antes se lee ANTES de escribir encima: es lo que distingue
  // un envío de verdad del tercer clic seguido del mismo botón.
  const anterior = esBorrador ? null : await getSelection(slug);
  await saveSelection(slug, cleaned, { borrador: esBorrador });

  const envioAnterior = anterior?.submittedAt ? Date.parse(anterior.submittedAt) : 0;
  const tocaAvisar = !envioAnterior || Date.now() - envioAnterior > AVISO_MIN_MS;

  /**
   * EL AVISO AL ESTUDIO, y sólo cuando la pareja pulsa «Enviar».
   *
   * Los borradores son el guardado automático: llegan cada pocos segundos
   * mientras marcan, y avisar de cada uno sería enterrar el buzón. Los
   * envíos de verdad avisan como mucho una vez por hora (AVISO_MIN_MS).
   *
   * No se espera al correo ni se falla por él. Lo que la pareja acaba de
   * hacer --su selección-- ya está escrito en disco dos líneas más arriba;
   * que el servidor de correo esté caído no puede convertir eso en un error
   * en su pantalla, ni hacerles pulsar «Enviar» otra vez encima de algo que
   * ya salió bien.
   *
   * `void` y no `await` porque este sitio corre como UN proceso Node de larga
   * vida detrás de nginx (docs/DESPLIEGUE.md). En un entorno sin estado que
   * congele el proceso al devolver la respuesta, el correo no llegaría a
   * salir y nadie se enteraría: allí habría que esperarlo.
   */
  if (!esBorrador && tocaAvisar && isMailConfigured()) {
    void avisarDeSeleccion({
      clientName: meta.clientName,
      slug,
      favoritas: cleaned.filter((i) => i.liked).length,
      conNota: cleaned.filter((i) => i.comment.trim() !== '').length,
      total: meta.photos.length,
      panelUrl: `${site.siteUrl}/admin/galerias/${slug}`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
