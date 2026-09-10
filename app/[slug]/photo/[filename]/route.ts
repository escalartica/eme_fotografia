import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { galleryPhotosDir, isValidSlug, isValidPhotoFilename } from '@/lib/gallery-store';
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
  _request: Request,
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
