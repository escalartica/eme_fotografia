import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { appendGalleryPhotos, galleryPhotosDir, getGalleryMeta, isValidSlug, tandaValida } from '@/lib/gallery-store';
import { fotosDelFormulario, guardarFotos, validarLote } from '@/lib/gallery-upload';
import { MAX_FOTOS_POR_GALERIA } from '@/lib/gallery-limits';
import { getAdminSession } from '@/lib/auth/require-session';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

/**
 * AÑADE FOTOS A UNA GALERÍA QUE YA EXISTE.
 *
 * Es por donde entran todas las tandas menos la primera cuando se crea una
 * galería grande (ver lib/gallery-limits.ts), y también lo que usa el panel
 * para añadir fotos a una galería ya entregada.
 *
 * Las mismas tres puertas que el resto de /api/admin/galerias/[slug]: sesión
 * de administración, Origin propio y slug con forma válida. Y las mismas
 * comprobaciones por foto que el alta (lib/gallery-upload.ts): tipo real por
 * los bytes, techo de píxeles y metadatos fuera antes de tocar el disco.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
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
  const meta = await getGalleryMeta(slug);
  if (!meta) {
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el formulario.' }, { status: 400 });
  }

  const tanda = tandaValida(form.get('tanda'));
  // Un reintento de una tanda que ya entró: no se procesa otra vez.
  if (tanda && meta.tandasRecibidas?.includes(tanda)) {
    return NextResponse.json({ ok: true, nuevas: 0, total: meta.photos.length });
  }

  const files = fotosDelFormulario(form);
  const loteMalo = validarLote(files);
  if (loteMalo) {
    return NextResponse.json({ error: loteMalo.error }, { status: loteMalo.status });
  }
  // Comprobación temprana, antes de escribir nada. La que cuenta es la de
  // `appendGalleryPhotos`, que se hace en la cola y con la ficha recién leída.
  if (meta.photos.length + files.length > MAX_FOTOS_POR_GALERIA) {
    return NextResponse.json(
      { error: `Esta galería ya tiene ${meta.photos.length} fotos y el máximo es ${MAX_FOTOS_POR_GALERIA}.` },
      { status: 400 }
    );
  }

  const resultado = await guardarFotos(slug, files, {
    primerNumero: meta.photos.length + 1,
    clientName: meta.clientName,
  });
  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  }

  const borrarLasDeEstaTanda = () =>
    Promise.all(
      resultado.photos.map((p) =>
        fs.rm(path.join(/* turbopackIgnore: true */ galleryPhotosDir(slug), p.filename), { force: true })
      )
    );

  let total: Awaited<ReturnType<typeof appendGalleryPhotos>>;
  try {
    total = await appendGalleryPhotos(slug, resultado.photos, MAX_FOTOS_POR_GALERIA, tanda);
  } catch (err) {
    await borrarLasDeEstaTanda();
    console.error(`[galerias] fallo al apuntar fotos nuevas en ${slug}:`, err);
    return NextResponse.json({ error: 'No se han podido guardar las fotos. Inténtalo de nuevo.' }, { status: 500 });
  }
  if (total === 'no-existe') {
    // La han borrado mientras subía. Las fotos de esta tanda no pueden quedarse
    // huérfanas en disco: borrar una galería es borrar sus fotos.
    await borrarLasDeEstaTanda();
    return NextResponse.json({ error: 'Galería no encontrada.' }, { status: 404 });
  }
  if (total === 'repetida') {
    // El original y el reintento se han cruzado: el primero ya las apuntó.
    await borrarLasDeEstaTanda();
    const ahora = await getGalleryMeta(slug);
    return NextResponse.json({ ok: true, nuevas: 0, total: ahora?.photos.length ?? 0 });
  }
  if (total === 'lleno') {
    await borrarLasDeEstaTanda();
    return NextResponse.json(
      { error: `Con estas fotos la galería pasaría de ${MAX_FOTOS_POR_GALERIA}.` },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, nuevas: resultado.photos.length, total });
}
