import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { galleryPhotosDir, isValidSlug, isValidPhotoFilename } from '@/lib/gallery-store';
import { copiaReducida } from '@/lib/gallery-derivatives';
import { esAnchoValido, type Ancho } from '@/lib/gallery-anchos';
import { getAdminSession, getClientSession } from '@/lib/auth/require-session';

/**
 * The one place gallery photos are ever served from. They live under
 * data/galleries/<slug>/photos/, never public/ -- public/ is always
 * directly reachable by URL with no way to gate it, which would make
 * every "private" gallery photo actually public the moment its filename
 * leaked (a browser cache, a shared screenshot's dev tools, a referer
 * header). This route re-checks the session on every single request
 * instead, so revoking a session (logout, or simply not sharing further)
 * immediately cuts off every photo, not just the page around them.
 */

const CONTENT_TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; filename: string }> }
) {
  const { slug, filename } = await params;

  // Both checks are format allowlists, not blocklists -- isValidSlug/
  // isValidPhotoFilename accept only a known-safe character set, so
  // there is no `..`/`/` sequence this function ever passes to
  // path.join below, regardless of what the URL actually contained.
  if (!isValidSlug(slug) || !isValidPhotoFilename(filename)) {
    return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
  }

  const [clientSession, adminSession] = await Promise.all([
    getClientSession(slug),
    getAdminSession(),
  ]);
  if (!clientSession && !adminSession) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const ext = filename.split('.').pop()!.toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
  }

  /**
   * `?w=` pide una copia reducida (ver lib/gallery-derivatives.ts). Sin el
   * parámetro se sirve el original, que es lo que quiere el visor a pantalla
   * completa y lo que esta ruta ha hecho siempre.
   *
   * El ancho se valida contra una lista cerrada y se resuelve DESPUÉS de
   * comprobar la sesión, nunca antes: redimensionar es lo caro de esta ruta y
   * no se le regala a quien no ha iniciado sesión. Un `?w=` que no esté en la
   * lista se ignora y se devuelve el original -- ni error ni 404, porque el
   * parámetro es una optimización y no debe poder romper una galería.
   */
  const pedido = new URL(request.url).searchParams.get('w');
  if (esAnchoValido(pedido)) {
    // ENVUELTO EN try/catch, y no por costumbre: `copiaReducida` decodifica la
    // imagen con sharp, y sharp LANZA ante un fichero corrupto o ante una
    // resolución desmedida (su tope de píxeles de entrada). Sin esto, una sola
    // foto mal escrita en el disco convertía la cuadrícula entera de esa boda
    // en una fila de errores 500. Cayendo al original, la pareja ve su foto:
    // más lenta de cargar, pero la ve.
    let reducida: Uint8Array | null = null;
    try {
      reducida = await copiaReducida(slug, filename, Number(pedido) as Ancho);
    } catch {
      reducida = null;
    }
    if (reducida) {
      // `new Uint8Array(...)`, igual que abajo con el original: copia los
      // bytes a un ArrayBuffer propio, que es lo que NextResponse acepta.
      return new NextResponse(new Uint8Array(reducida), {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'private, no-store',
        },
      });
    }
  }

  try {
    const filePath = path.join(galleryPhotosDir(slug), filename);
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': contentType,
        // private: caches this browser only, never a shared/CDN cache --
        // this is exactly the content that must never be publicly
        // cacheable.
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
  }
}
