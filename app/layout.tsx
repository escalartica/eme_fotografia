import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import '../styles/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EME Fotografía',
  description: 'EME Fotografía Sevilla',
};

// Minimal placeholder shell — replaced in Task 9.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={fraunces.variable}>
      <body>{children}</body>
    </html>
  );
}
