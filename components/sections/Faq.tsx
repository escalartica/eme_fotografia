import { faqs } from '@/content/faq';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { PlusIcon } from '@/components/ui/Icon';
import styles from './Faq.module.css';

// Was fully static — no other section on /contacto animates on scroll
// either, but this one sits directly under ContactForm and used to read
// as an afterthought pasted in below the "real" page. Heading and each
// disclosure get their own top-level ScrollReveal (never nested — this
// project's documented bug class), with a light per-item stagger via the
// `delay` prop so the six questions settle in sequence rather than as one
// flat block. Capped at 6 steps of 0.05s: `faqs` is a short, fixed
// editorial list (not a paginated/unbounded one), so a per-index delay
// here can't grow into an unreasonably long wait the way it could for
// unbounded content.
export function Faq() {
  return (
    // El id es el destino del enlace del lateral de /contacto: las tres
    // primeras preguntas (fecha libre, antelación, precio) son las que la
    // pareja trae en la cabeza antes de escribir, y el bloque vive debajo
    // del formulario.
    <section id="preguntas-frecuentes" className={styles.section} aria-labelledby="faq-heading">
      <ScrollReveal>
        <h2 id="faq-heading">Preguntas frecuentes</h2>
      </ScrollReveal>
      {faqs.map((f, i) => (
        <ScrollReveal key={f.id} delay={Math.min(i * 0.05, 0.25)}>
          <details className={styles.item}>
            <summary className={styles.summary}>
              {f.question}
              <span className={styles.marker}>
                <PlusIcon size={14} />
              </span>
            </summary>
            <p>{f.answer}</p>
          </details>
        </ScrollReveal>
      ))}
    </section>
  );
}
