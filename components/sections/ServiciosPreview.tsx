import Link from 'next/link';
import { services } from '@/content/services';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export function ServiciosPreview() {
  return (
    <section aria-labelledby="servicios-heading">
      <h2 id="servicios-heading">Servicios</h2>
      <ul>
        {services.map((service) => (
          <ScrollReveal key={service.slug}>
            <li>
              <Link href={`/servicios#${service.slug}`}>{service.name}</Link>
              <p>{service.tagline}</p>
            </li>
          </ScrollReveal>
        ))}
      </ul>
    </section>
  );
}
