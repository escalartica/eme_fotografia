/**
 * Same reasoning as app/[slug]/layout.tsx: no public Header/Footer around
 * the studio's own management panel. Still provides the #main-content
 * landmark the root skip-link points to.
 */
// Belt and braces with robots.txt's own `disallow: /admin` (app/robots.ts):
// a Disallow only asks a crawler not to FETCH the URL, and a URL that is
// linked from somewhere else can still be indexed without being fetched.
// A noindex header on the page itself is what actually keeps the studio's
// panel out of the results -- and it is the same defence app/[slug] (the
// private client galleries) already uses.
export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // tabIndex={-1}: ver el comentario en app/(site)/layout.tsx -- sin él el
  // enlace de salto mueve el ancla pero no el foco (WCAG 2.4.1).
  return (
    <main id="main-content" tabIndex={-1} data-sin-barra>
      {children}
    </main>
  );
}
