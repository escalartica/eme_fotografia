import type { Metadata } from 'next';

const SITE_URL = 'https://www.emefotografiasevilla.es';

/** Site-wide fallback social share card (logo on the brand's own dark
 * background, 1200x630) -- used whenever a page doesn't have a real photo
 * of its own to share (only /trabajos/[slug] currently passes a real
 * `image`, via its project's cover). Without this, sharing any other page
 * on WhatsApp/Facebook/etc. showed no preview image at all. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og/default.png`;

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
      images: [{ url: image ?? DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
      locale: 'es_ES',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
