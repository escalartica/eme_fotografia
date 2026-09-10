import type { Metadata } from 'next';

import { site } from '@/content/site';

const SITE_URL = site.siteUrl;

/** Site-wide fallback social share card (logo on the brand's own dark
 * background, 1200x630) -- used whenever a page doesn't have a real photo
 * of its own to share (only /trabajos/[slug] currently passes a real
 * `image`, via its project's cover). Without this, sharing any other page
 * on WhatsApp/Facebook/etc. showed no preview image at all. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og/default.jpg`;

/**
 * The share card's image, as a JPEG.
 *
 * Every photograph on this site is a .webp, and WhatsApp -- which is how a
 * couple actually sends a reportaje to their family -- does not render
 * WebP link previews. Neither do several other crawlers. So every project
 * cover has a 1200x630 JPEG derivative sitting beside it (`cover-og.jpg`),
 * cropped around the same measured focal point the site itself uses, and
 * this is what goes in `og:image`. Falls back to the original path if a
 * derivative is ever missing, which is worse than a JPEG but better than
 * nothing.
 */
export function ogImage(src: string | undefined): string | undefined {
  if (!src) return undefined;
  return src.replace(/\.webp$/i, '-og.jpg');
}

/**
 * Recorta al último final de frase (o de palabra) por debajo de `max`.
 *
 * Google corta la meta description alrededor de los 155-160 caracteres. El
 * texto editorial de content/projects.ts llega a 317 -- 22 de los 29
 * reportajes pasan de 160 --, así que el fragmento se partía a mitad de
 * enumeración, justo donde estaba la frase que remata. Esto NO genera texto:
 * solo decide dónde parar, para que la frase cierre.
 */
export function clampDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const window = text.slice(0, max + 1);
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '));
  if (sentenceEnd >= 90) return text.slice(0, sentenceEnd + 1);
  const wordEnd = window.lastIndexOf(' ');
  return `${text.slice(0, wordEnd > 0 ? wordEnd : max).replace(/[,;:]$/, '')}…`;
}

export function buildMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImageUrl = image ?? DEFAULT_OG_IMAGE;
  // El texto completo se queda en OG, donde WhatsApp y Facebook enseñan
  // bastante más que Google; solo la meta description se recorta.
  const serpDescription = clampDescription(description);
  return {
    title,
    description: serpDescription,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      locale: 'es_ES',
      type: 'website',
      siteName: 'EME Fotografía Sevilla',
    },
    // `twitter.images` faltaba: Next no copia las imágenes de openGraph a las
    // etiquetas twitter:*, así que `summary_large_image` dependía de que cada
    // cliente cayera por su cuenta al og:image. Una línea, y deja de depender.
    twitter: { card: 'summary_large_image', title, description: serpDescription, images: [ogImageUrl] },
  };
}
