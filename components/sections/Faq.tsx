import { faqs } from '@/content/faq';
import styles from './Faq.module.css';

export function Faq() {
  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <h2 id="faq-heading">Preguntas frecuentes</h2>
      {faqs.map((f) => (
        <details key={f.id} className={styles.item}>
          <summary>{f.question}</summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </section>
  );
}
