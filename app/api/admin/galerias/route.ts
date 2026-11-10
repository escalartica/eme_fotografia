import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import { getGalleryMeta, saveGalleryMeta, galleryPhotosDir, isValidSlug, recordarTanda, tandaValida } from '@/lib/gallery-store';
import { fotosDelFormulario, guardarFotos, validarLote } from '@/lib/gallery-upload';
import { hashPassword } from '@/lib/auth/password';
import { motivoPasswordDebil } from '@/lib/gallery-credentials';
import { getAdminSession } from '@/lib/auth/require-session';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

// LA GALERÍA SE CREA CON LA PRIMERA TANDA DE FOTOS, NO CON TODAS.
//
// Hasta noviembre de 2026 todas viajaban aquí en una sola petición, con un
// tope de 200. Una boda para que la pareja elija son 1.200 o más, y eso no
// cabe en una petición (ver lib/gallery-limits.ts). Ahora el formulario manda
// aquí los datos de la pareja y la primera tanda, y el resto por
// /api/admin/galerias/<slug>/fotos. Los topes por petición y por foto viven
// en lib/gallery-upload.ts, compartidos con esa ruta.

// Campos de texto: topes generosos para lo que escribe el estudio y ridículos
// para lo que hace falta para llenar un disco escribiendo meta.json.
const MAX_NAME_LENGTH = 120;
const MAX_PASSWORD_LENGTH = 200;

/**
 * Creates a new client gallery: metadata + credentials + the uploaded
 * photo set, in one multipart request. Uses the Web-standard
 * `request.formData()` -- no multipart-parsing dependency (formidable/
 * multer) needed, Next.js Route Handlers already implement it.
 */
export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el formulario.' }, { status: 400 });
  }

  const slug = String(form.get('slug') ?? '').trim().toLowerCase();
  const clientName = String(form.get('clientName') ?? '').trim().slice(0, MAX_NAME_LENGTH);
  const weddingDate = String(form.get('weddingDate') ?? '').trim().slice(0, 40);
  const username = String(form.get('username') ?? '').trim().slice(0, MAX_NAME_LENGTH);
  const password = String(form.get('password') ?? '').slice(0, MAX_PASSWORD_LENGTH);

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: 'El enlace debe usar solo minúsculas, números y guiones (ej. boda-ana-y-luis).' },
      { status: 400 }
    );
  }
  if (!clientName || !username) {
    return NextResponse.json({ error: 'Faltan el nombre del cliente o el usuario.' }, { status: 400 });
  }
  // La misma regla que aplica el formulario (lib/gallery-credentials.ts).
  // Aquí no es una comodidad: un POST puede llegar sin pasar por esa pantalla.
  const passwordFloja = motivoPasswordDebil(password);
  if (passwordFloja) {
    return NextResponse.json({ error: passwordFloja }, { status: 400 });
  }
  const tanda = tandaValida(form.get('tanda'));
  const existente = await getGalleryMeta(slug);
  if (existente) {
    // Un reintento del alta que SÍ había entrado (se perdió la respuesta): no
    // es un choque de enlaces, es la misma galería. Se contesta como si se
    // acabara de crear, y el formulario sigue con la siguiente tanda.
    if (tanda && existente.tandasRecibidas?.includes(tanda)) {
      return NextResponse.json({ ok: true, slug, total: existente.photos.length });
    }
    return NextResponse.json({ error: 'Ya existe una galería con ese enlace.' }, { status: 409 });
  }

  const files = fotosDelFormulario(form);
  const loteMalo = validarLote(files);
  if (loteMalo) {
    return NextResponse.json({ error: loteMalo.error }, { status: loteMalo.status });
  }

  const resultado = await guardarFotos(slug, files, { primerNumero: 1, clientName });
  if (!resultado.ok) {
    // Limpieza: la galería es nueva, así que lo que haya en su carpeta de
    // fotos es de esta petición. Se borra entera para no dejar a medias un
    // directorio sin meta.json que nadie va a poder gestionar desde el panel.
    await fs.rm(galleryPhotosDir(slug), { recursive: true, force: true });
    return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  }
  const photos = resultado.photos;

  await saveGalleryMeta({
    slug,
    clientName,
    weddingDate: weddingDate || undefined,
    username,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    photos,
    ...(tanda ? { tandasRecibidas: recordarTanda(undefined, tanda) } : {}),
  });

  return NextResponse.json({ ok: true, slug, total: photos.length });
}
