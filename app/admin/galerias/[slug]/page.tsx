import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getAdminSession } from '@/lib/auth/require-session';
import { getGalleryMeta, getSelection } from '@/lib/gallery-store';
import { AdminGalleryView } from './AdminGalleryView';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminGalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const { slug } = await params;
  const meta = await getGalleryMeta(slug);
  if (!meta) notFound();

  const selection = await getSelection(slug);

  // Built from the incoming request's own Host header rather than a
  // hardcoded production domain -- this page needs to show the *real*
  // reachable URL whether the admin is looking at it on localhost during
  // development or on the live site, and this is the same host the
  // gallery route itself will be reached at.
  const headerList = await headers();
  const host = headerList.get('host') ?? '';
  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  const shareUrl = host ? `${protocol}://${host}/${slug}` : `/${slug}`;

  return (
    <AdminGalleryView
      slug={slug}
      clientName={meta.clientName}
      weddingDate={meta.weddingDate}
      username={meta.username}
      shareUrl={shareUrl}
      photos={meta.photos}
      items={selection?.items ?? []}
      submittedAt={selection?.submittedAt ?? null}
    />
  );
}
