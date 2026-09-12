import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DocumentTitle } from '@/components/ui/DocumentTitle';
import { site } from '@/content/site';
import styles from './status.module.css';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

// Root-level not-found renders OUTSIDE the (site) route group, so it has
// to bring the public chrome (menu + footer) itself: a visitor who lands
// on a dead link must still be able to navigate the site from here.
export default function NotFound() {
  return (
    <>
      <DocumentTitle title={`Página no encontrada — ${site.brandName}`} />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className={styles.section} aria-labelledby="status-heading">
          <p className={styles.code} aria-hidden="true">
            404
          </p>
          <p className={styles.lead}>Esta página</p>
          <h1 id="status-heading" className={styles.heading}>
            no existe
          </h1>
          <p className={styles.body}>Puede que la dirección haya cambiado o que el enlace esté mal escrito.</p>
          <div className={styles.actions}>
            <Link href="/" className={styles.primary}>
              Volver al inicio
            </Link>
            <Link href="/trabajos" className={styles.action}>
              Ver los trabajos
              <ArrowGlyph />
            </Link>
            <Link href="/contacto" className={styles.action}>
              Contacto
              <ArrowGlyph />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
