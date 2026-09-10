import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  getGalleryMeta,
  saveGalleryMeta,
  galleryPhotosDir,
  isValidSlug,
  sniffImageKind,
  type GalleryPhoto,
} from '@/lib/gallery-store';
import { hashPassword } from '@/lib/auth/password';
import { getAdminSession } from '@/lib/auth/require-session';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB por foto
const MAX_FILES = 60;
// Tope del conjunto, no solo de cada fichero: 60 x 25MB serían 1,5 GB en una
// sola petición, suficiente para llenar el disco del servidor de una tacada.
const MAX_TOTAL_BYTES = 400 * 1024 * 1024; // 400MB por galería
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
  if (password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
  }
  if (await getGalleryMeta(slug)) {
    return NextResponse.json({ error: 'Ya existe una galería con ese enlace.' }, { status: 409 });
  }

  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: 'Sube al menos una foto.' }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Máximo ${MAX_FILES} fotos por galería.` }, { status: 400 });
  }
  let totalBytes = 0;
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `"${file.name}" supera el tamaño máximo de 25MB.` }, { status: 400 });
    }
    totalBytes += file.size;
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { error: 'El conjunto de fotos supera los 400MB. Sube la galería en dos tandas o exporta a menos resolución.' },
      { status: 400 }
    );
  }

  const photosDir = galleryPhotosDir(slug);
  await fs.mkdir(photosDir, { recursive: true, mode: 0o700 });

  // El nombre del fichero lo genera SIEMPRE el servidor (nunca el que traía el
  // fichero subido): eso quita de en medio tanto el path traversal por un
  // nombre manipulado como la fuga del nombre original (las exportaciones de
  // los programas de revelado suelen llevar dentro el nombre y la fecha reales
  // del cliente).
  //
  // Y la extensión sale de los BYTES del fichero, no de su `Content-Type`: ese
  // campo lo escribe quien sube y no demuestra nada. Antes bastaba declarar
  // `image/jpeg` para que un .html o un .svg con <script> se guardara y luego
  // se sirviera desde el dominio del estudio.
  const photos: GalleryPhoto[] = [];
  let index = 0;
  for (const file of files) {
    index += 1;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImageKind(bytes);
    if (!kind) {
      // Limpieza: lo ya escrito de esta galería se borra, para no dejar a
      // medias un directorio sin meta.json que nadie va a poder gestionar
      // desde el panel.
      await fs.rm(photosDir, { recursive: true, force: true });
      return NextResponse.json(
        { error: `"${file.name}" no es una imagen JPG, PNG, WEBP o AVIF real.` },
        { status: 400 }
      );
    }
    const id = crypto.randomUUID();
    const filename = `${id}.${kind}`;
    await fs.writeFile(path.join(photosDir, filename), bytes, { mode: 0o600 });
    photos.push({ id, filename, alt: `Foto ${index} de la boda de ${clientName}` });
  }

  await saveGalleryMeta({
    slug,
    clientName,
    weddingDate: weddingDate || undefined,
    username,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    photos,
  });

  return NextResponse.json({ ok: true, slug });
}
