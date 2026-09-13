/**
 * Deliberately no Header/Footer here -- a private client gallery
 * (app/[slug]/page.tsx and its login gate) never shows the public site's
 * marketing nav, matching how reference photo-delivery platforms
 * (Pixieset, ShootProof) present a client's own space. Still provides
 * the #main-content landmark the root skip-link points to.
 */
export default function GallerySlugLayout({ children }: { children: React.ReactNode }) {
  // tabIndex={-1}: ver el comentario en app/(site)/layout.tsx -- sin él el
  // enlace de salto mueve el ancla pero no el foco (WCAG 2.4.1).
  return (
    <main id="main-content" tabIndex={-1} data-sin-barra>
      {children}
    </main>
  );
}
