import type { Metadata } from 'next';

const SITE_URL = 'https://www.emefotografiasevilla.es';

export function buildMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
      locale: 'es_ES',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
