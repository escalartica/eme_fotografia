import { notFound } from 'next/navigation';
import { getGalleryMeta, getSelection } from '@/lib/gallery-store';
import { getClientSession } from '@/lib/auth/require-session';
import { GalleryLoginForm } from './GalleryLoginForm';
import { GalleryClient } from './GalleryClient';

// Never indexed and never linked from the site's own nav (Header.tsx) --
// this route only exists at a slug the studio hands a client privately.
// robots.txt (app/robots.ts) can't disallow a URL it doesn't know about
// in advance, so this per-page directive is the real protection: it
// applies the moment a crawler fetches this exact URL, whatever robots.txt
// said about the general shape of the site.
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function GallerySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = await getGalleryMeta(slug);
  // A slug with no matching gallery renders the framework's real 404 --
  // indistinguishable from any other unmatched route, so this can't be
  // used to enumerate which slugs are real galleries versus typos.
  if (!meta) notFound();

  const session = await getClientSession(slug);
  if (!session) {
    return <GalleryLoginForm slug={slug} />;
  }

  const selection = await getSelection(slug);
  return (
    <GalleryClient
      slug={slug}
      clientName={meta.clientName}
      weddingDate={meta.weddingDate}
      photos={meta.photos}
      initialSelection={selection}
    />
  );
}
