import Link from 'next/link';
import { services } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.css';

export const metadata = buildMetadata({
  title: 'Servicios',
  description: 'Fotografía de boda, vídeo, fotomatón y experiencia 360° en Sevilla.',
  path: '/servicios',
});

export default function Page() {
  return (
    <div className={styles.page}>
      <h1>Servicios</h1>
      {services.map((service, index) => (
        <section key={service.slug} id={service.slug} className={styles.service} aria-labelledby={`${service.slug}-heading`}>
          <h2 id={`${service.slug}-heading`} className={styles.serviceHeading}>
            <span className={styles.number} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            {service.name}
          </h2>
          <p>{service.tagline}</p>
          <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
          <p>{service.idealFor}</p>
          <ol>
            {service.process.map((step) => (
              <li key={step.step}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <Link href="/contacto">{service.ctaLabel}</Link>
        </section>
      ))}
    </div>
  );
}
