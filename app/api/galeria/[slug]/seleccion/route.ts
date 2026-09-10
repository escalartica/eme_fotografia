import { NextResponse } from 'next/server';
import { getGalleryMeta, saveSelection, type SelectionItem } from '@/lib/gallery-store';
import { getClientSession } from '@/lib/auth/require-session';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

const MAX_COMMENT_LENGTH = 2000;

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
  const { items } = (body ?? {}) as { items?: unknown };
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Formato de selección no válido.' }, { status: 400 });
  }

  // Validate every item against the gallery's REAL photo list -- a
  // client's POST body is attacker-controlled input, so photoId values
  // that don't belong to this gallery, or a comment longer than the
  // sane cap, are dropped rather than trusted verbatim into storage the
  // admin will later read.
  const realPhotoIds = new Set(meta.photos.map((p) => p.id));
  const cleaned: SelectionItem[] = [];
  for (const raw of items) {
    if (typeof raw !== 'object' || raw === null) continue;
    const { photoId, liked, comment } = raw as Record<string, unknown>;
    if (typeof photoId !== 'string' || !realPhotoIds.has(photoId)) continue;
    cleaned.push({
      photoId,
      liked: liked === true,
      comment: typeof comment === 'string' ? comment.slice(0, MAX_COMMENT_LENGTH) : '',
    });
  }

  await saveSelection(slug, cleaned);
  return NextResponse.json({ ok: true });
}
