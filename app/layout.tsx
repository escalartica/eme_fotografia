import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EME Fotografía',
  description: 'EME Fotografía Sevilla',
};

// Minimal placeholder shell — replaced in Task 9.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
