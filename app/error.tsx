'use client';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DocumentTitle } from '@/components/ui/DocumentTitle';
import { site } from '@/content/site';
import styles from './status.module.css';

// Runtime error boundary. Same register as the 404: the visitor stays
// inside the brand -- menu and footer included -- is told plainly what
// happened, and gets a way forward rather than a stack trace. `reset`
// re-renders the segment, which is enough for the common case of a
// transient fetch failure.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <DocumentTitle title={`Algo ha fallado — ${site.brandName}`} />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className={styles.section} aria-labelledby="status-heading">
          <p className={styles.lead}>Algo</p>
          <h1 id="status-heading" className={styles.heading}>
            ha fallado
          </h1>
          <p className={styles.body}>No hemos podido cargar esta parte de la web. Puedes intentarlo otra vez.</p>
          <div className={styles.actions}>
            <button type="button" onClick={reset} className={styles.primary}>
              Reintentar
            </button>
            <Link href="/" className={styles.action}>
              Volver al inicio
              <span className="arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
