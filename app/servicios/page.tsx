import Image from 'next/image';
import Link from 'next/link';
import { services } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './page.module.css';

export const metadata = buildMetadata({
  title: 'Servicios',
  description: 'Fotografía de boda, vídeo, fotomatón y experiencia 360° en Sevilla.',
  path: '/servicios',
});

export default function Page() {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageHeading}>Servicios</h1>
      {services.map((service, index) => {
        const chapterNumber = String(index + 1).padStart(2, '0');
        return (
          // A single ScrollReveal per service moment — deliberately not
          // nested with a second ScrollReveal for the includes/process
          // items inside (this codebase has a twice-found bug where a
          // nested ScrollReveal's own translateY shifts a descendant's
          // ScrollTrigger measurement out from under it, sticking the
          // descendant's animation at a partial value). The numbered
          // sequences below get their numerals from plain CSS, not a
          // second reveal.
          <ScrollReveal key={service.slug} className={styles.revealWrap}>
            <section
              id={service.slug}
              className={styles.service}
              aria-labelledby={`${service.slug}-heading`}
            >
              <div className={`${styles.serviceInner} ${service.previewImage ? '' : styles.noImage}`}>
                <div className={styles.copy}>
                  <span className={styles.chapterNumber} aria-hidden="true">
                    {chapterNumber}
                  </span>
                  <h2 id={`${service.slug}-heading`} className={styles.name}>
                    {service.name}
                  </h2>
                  <p className={styles.tagline}>{service.tagline}</p>
                  <p className={styles.idealFor}>{service.idealFor}</p>

                  <div
                    className={styles.numberedGroup}
                    role="list"
                    aria-label={`Incluye — ${service.name}`}
                  >
                    {service.includes.map((item, itemIndex) => (
                      <div key={item} role="listitem" className={styles.numberedItem}>
                        <span className={styles.itemNumber} aria-hidden="true">
                          {String(itemIndex + 1).padStart(2, '0')}
                        </span>
                        <div className={styles.itemText}>{item}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={styles.numberedGroup}
                    role="list"
                    aria-label={`Cómo trabajamos — ${service.name}`}
                  >
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

                  <Link href="/contacto" className={styles.cta}>
                    {service.ctaLabel}
                  </Link>
                </div>

                {service.previewImage && (
                  <div className={styles.imageWrap}>
                    <Image
                      src={service.previewImage}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 100vw, 50vw"
                      className={styles.image}
                      // The first service's own image renders above the
                      // fold (this is the first section on the page) --
                      // matches the established priority-on-first-visible
                      // pattern already used elsewhere (see
                      // ProjectGallery.tsx's computeImagePriorityFlags).
                      priority={index === 0}
                    />
                  </div>
                )}
              </div>
            </section>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
