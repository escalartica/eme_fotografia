import Link from 'next/link';
import styles from './CtaContacto.module.css';

export function CtaContacto() {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <h2 id="cta-heading">¿Celebras algo importante?</h2>
      <p>Cuéntanos tu fecha y hagamos que se recuerde.</p>
      <Link href="/contacto" data-cursor="abrir">Empezar un proyecto</Link>
    </section>
  );
}
