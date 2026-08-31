import Image from 'next/image';
import { testimonials } from '@/content/testimonials';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './Testimonios.module.css';

export function Testimonios() {
  return (
    <section aria-labelledby="testimonios-heading" className={styles.section}>
      <h2 id="testimonios-heading">Lo que dicen de nosotros</h2>
      {testimonials.map((t) => (
        <ScrollReveal key={t.id} className={styles.item}>
          <blockquote className={styles.quote}>
            {t.photo && (
              <div className={styles.photoWrap}>
                <Image src={t.photo} alt={t.author} fill sizes="4rem" />
              </div>
            )}
            <p>“{t.quote}”</p>
            <cite>{t.author} — {t.role}</cite>
          </blockquote>
        </ScrollReveal>
      ))}
    </section>
  );
}
