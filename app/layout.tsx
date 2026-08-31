import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import localFont from 'next/font/local';
import { site } from '@/content/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';
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

export const metadata: Metadata = {
  title: { default: site.brandName, template: `%s — ${site.brandName}` },
  description: 'Fotografía y vídeo de bodas y eventos en Sevilla. Fotomatón y experiencia 360°.',
  metadataBase: new URL('https://www.emefotografiasevilla.es'),
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${generalSans.variable}`}>
      <body>
        <SmoothScrollProvider>
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
