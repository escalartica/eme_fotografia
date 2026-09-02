import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import localFont from 'next/font/local';
import { site } from '@/content/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';
import { Cursor } from '@/components/motion/Cursor';
import { localBusinessSchema } from '@/lib/schema';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import '../styles/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif-loaded',
  display: 'swap',
});

const generalSans = localFont({
  src: '../public/fonts/GeneralSans-Variable.woff2',
  variable: '--font-sans-loaded',
  weight: '300 700',
  display: 'swap',
});

const DESCRIPTION = 'Fotografía y vídeo de bodas y eventos en Sevilla. Fotomatón y experiencia 360°.';

export const metadata: Metadata = {
  title: { default: site.brandName, template: `%s — ${site.brandName}` },
  description: DESCRIPTION,
  metadataBase: new URL('https://www.emefotografiasevilla.es'),
  // Home has no per-page buildMetadata() call (see lib/seo.ts) -- its own
  // openGraph/twitter fields, matching that function's shape, so sharing
  // the homepage shows the same branded card every other page falls back
  // to instead of no preview image at all.
  openGraph: {
    title: site.brandName,
    description: DESCRIPTION,
    url: 'https://www.emefotografiasevilla.es',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    locale: 'es_ES',
  },
  twitter: { card: 'summary_large_image', title: site.brandName, description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${generalSans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
        />
        <SmoothScrollProvider>
          <Cursor />
          <a href="#main-content" className="skip-link">
            Saltar al contenido
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
