import Image from 'next/image';
import Link from 'next/link';
import type { Service } from '@/content/types';
import { focusOf } from '@/lib/focal';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ShowreelClip } from '@/components/sections/ShowreelClip';
import styles from './page.module.css';

/**
 * El cuerpo de un servicio: lo que incluye, cómo se trabaja y el trabajo real.
 *
 * Antes esto era el interior de un `services.map()` en `/servicios`, con los
 * dos servicios en la misma URL y un `index === 0` decidiendo quién se
 * quedaba el `<h1>` y qué imagen cargaba con prioridad. Al darle su página a
 * cada uno esas dos decisiones desaparecen: el servicio de la página es el
 * `<h1>`, y su imagen es siempre la primera visible.
 *
 * Un solo ScrollReveal por sección, sin anidar otro dentro para los ítems:
 * este proyecto ya se ha encontrado dos veces con que el translateY de un
 * ScrollReveal anidado desplaza la medición del ScrollTrigger de su
 * descendiente y le deja la animación clavada a medias. La numeración de
 * abajo sale de CSS, no de un segundo reveal.
 */
export function ServicioDetalle({ service }: { service: Service }) {
  return (
    <ScrollReveal className={styles.revealWrap}>
      <section className={styles.service} aria-labelledby="servicio-heading">
        <div className={`${styles.serviceInner} ${service.previewImage ? '' : styles.noImage}`}>
          <div className={styles.copy}>
            <Link href="/servicios" className={styles.kickerLink}>
              Servicios
            </Link>
            <h1 id="servicio-heading" className={styles.name}>
              {service.heading}
            </h1>
            <p className={styles.tagline}>{service.tagline}</p>
            {service.intro && <p className={styles.intro}>{service.intro}</p>}
            <p className={styles.idealFor}>{service.idealFor}</p>

            <div className={styles.numberedGroup} role="list" aria-label={`Incluye — ${service.name}`}>
              {service.includes.map((item, itemIndex) => (
                <div key={item} role="listitem" className={styles.numberedItem}>
                  <span className={styles.itemNumber} aria-hidden="true">
                    {String(itemIndex + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.itemText}>{item}</div>
                </div>
              ))}
            </div>

            <div className={styles.numberedGroup} role="list" aria-label={`Cómo trabajamos — ${service.name}`}>
              {service.process.map((step) => (
                <div key={step.step} role="listitem" className={styles.numberedItem}>
                  <span className={styles.itemNumber} aria-hidden="true">
                    {String(step.step).padStart(2, '0')}
                  </span>
                  <div className={styles.itemText}>
                    <span className={styles.stepTitle}>{step.title}</span>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.ctaRow}>
              <Link href="/contacto" className={styles.cta}>
                {service.ctaLabel}
                <span className="arrow" aria-hidden="true">↗</span>
              </Link>
              {service.relatedCategory && (
                <Link href={`/trabajos?categoria=${service.relatedCategory}`} className={styles.secondaryCta}>
                  Ver trabajos de {service.name.toLowerCase().replace('fotografía de ', '')}
                  <span className="arrow" aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>

          {service.previewVideo ? (
            <div className={styles.imageWrap}>
              <ShowreelClip
                src={service.previewVideo.src}
                poster={service.previewVideo.poster}
                alt={service.previewVideo.alt}
                fill
              />
            </div>
          ) : service.previewImage && (
            <div className={styles.imageWrap}>
              <Image
                src={service.previewImage}
                alt={service.previewImageAlt ?? ''}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                className={styles.image}
                priority
                style={focusOf(service.previewImage)}
              />
            </div>
          )}
        </div>

        {service.gallery && service.gallery.length > 0 && (
          <div
            className={`${styles.strip} ${service.gallery.every((item) => item.width > item.height) ? styles.stripLandscape : ''}`}
            role="list"
            aria-label={`Trabajos reales — ${service.name}`}
          >
            {service.gallery.map((item) => (
              <figure
                key={item.src}
                role="listitem"
                className={styles.stripItem}
                style={{ aspectRatio: `${item.width} / ${item.height}` }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 900px) 70vw, 30vw"
                  className={styles.image}
                  style={focusOf(item.src)}
                />
              </figure>
            ))}
          </div>
        )}
      </section>
    </ScrollReveal>
  );
}
