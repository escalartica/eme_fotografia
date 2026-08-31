import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './Manifiesto.module.css';

export function Manifiesto() {
  return (
    <ScrollReveal>
      <section className={styles.section} aria-labelledby="manifiesto-heading">
        <h2 id="manifiesto-heading">No contamos bodas. Contamos historias con fecha.</h2>
        <p>
          Cada pareja llega con su propio ritmo, su propia luz, su propia gente alrededor.
          Nuestro trabajo es no interponernos: observar de cerca, con la mirada de un
          editorial de moda, y entregar algo que se sienta tan real dentro de diez años
          como el día que pasó.
        </p>
      </section>
    </ScrollReveal>
  );
}
