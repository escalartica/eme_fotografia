import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import localFont from 'next/font/local';
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
  title: 'EME Fotografía',
  description: 'EME Fotografía Sevilla',
};

// Minimal placeholder shell — replaced in Task 9.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${generalSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
