import { testimonials } from '@/content/testimonials';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export function Testimonios() {
  return (
    <section aria-labelledby="testimonios-heading">
      <h2 id="testimonios-heading">Lo que dicen de nosotros</h2>
      {testimonials.map((t) => (
        <ScrollReveal key={t.id}>
          <blockquote>
            <p>“{t.quote}”</p>
            <cite>{t.author} — {t.role}</cite>
          </blockquote>
        </ScrollReveal>
      ))}
    </section>
  );
}
