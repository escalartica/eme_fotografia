import Image from 'next/image';
import Link from 'next/link';
import { services } from '@/content/services';
import { focusOf } from '@/lib/focal';
import { buildMetadata } from '@/lib/seo';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './page.module.css';

/**
 * Índice de servicios.
 *
 * Esta página tuvo durante un tiempo los dos servicios enteros dentro, uno
 * detrás de otro, con dos anclas. Son dos decisiones de compra distintas —hay
 * parejas que ya tienen fotógrafo y buscan solo la película, y al revés— y
 * compartían `<title>`, `description` y un único `<h1>`, así que ninguna de
 * las dos podía competir por su propia búsqueda. Ahora cada servicio tiene su
 * URL y aquí queda lo único que no cabe en ninguna de las dos: la elección.
 *
 * El argumento de por qué foto y vídeo juntos salen mejor NO se repite aquí:
 * vive en la guía de la home (`GuiaBodasSevilla`), que es su casa.
 */
export const metadata = buildMetadata({
  // El <title> NO repite el <h1>. Con el anterior ('Fotografía y vídeo de
  // bodas en Sevilla') este índice y la home se presentaban en Google con el
  // mismo rótulo salvo una letra —'Fotógrafo' / 'Fotografía'— y competían
  // entre sí. 'Reportaje de boda' es además la forma en que la pareja nombra
  // lo que viene a comparar aquí.
  title: 'Reportaje de boda y vídeo en Sevilla',
  description:
    'Dos servicios y un mismo equipo: reportaje de fotografía y película de boda. Qué incluye cada uno, cómo trabajamos el día y bodas reales en Sevilla.',
  path: '/servicios',
});

export default function Page() {
  return (
    <div className={styles.indexPage}>
      <header className={styles.indexHeader}>
        <p className={styles.kicker}>Servicios</p>
        <h1 className={styles.indexTitle}>
          Fotografía y vídeo <em className={styles.indexTitleEm}>de bodas en Sevilla</em>
        </h1>
        <p className={styles.indexLead}>
          Podéis contratar uno o los dos. Aquí está qué incluye cada uno y cómo trabajamos el
          día de la boda.
        </p>
      </header>

      <ul className={styles.indexGrid}>
        {services.map((service, index) => (
          <li key={service.slug} className={styles.card}>
            <ScrollReveal delay={index * 0.05}>
              <Link href={service.route} className={styles.cardLink} data-cursor="ver">
                {service.previewImage && (
                  <span className={styles.cardFrame}>
                    <Image
                      src={service.previewImage}
                      alt={service.previewImageAlt ?? ''}
                      fill
                      sizes="(max-width: 900px) 92vw, 44vw"
                      className={styles.cardImage}
                      priority={index === 0}
                      style={focusOf(service.previewImage)}
                    />
                  </span>
                )}
                <span className={styles.cardNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className={styles.cardName}>{service.name}</h2>
                <span className={styles.cardTagline}>{service.tagline}</span>
                <span className={styles.cardCta}>
                  Ver qué incluye
                  <span className="arrow" aria-hidden="true">→</span>
                </span>
              </Link>
            </ScrollReveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
