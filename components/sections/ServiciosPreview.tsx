'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { services } from '@/content/services';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { focusOf } from '@/lib/focal';
import styles from './ServiciosPreview.module.css';
import { RevealWords } from '@/components/motion/RevealWords';

const servicesWithPreview = services.filter((service) => service.previewImage);
const defaultActiveSlug = servicesWithPreview[0]?.slug ?? null;

export function ServiciosPreview() {
  const [activeSlug, setActiveSlug] = useState<typeof services[number]['slug'] | null>(defaultActiveSlug);

  return (
    <section className={styles.section} aria-labelledby="servicios-heading">
      {/* Same mixed-case device as the other section headings: an italic
          lowercase word against an uppercase roman one, one family. */}
      <h2 id="servicios-heading" className={styles.heading}>
        <RevealWords
          segments={[{ text: 'Nuestros', em: true }, { text: ' servicios' }]}
          emClassName={styles.emphasis}
        />
      </h2>
      <div className={styles.layout}>
        {/* One reveal for the whole list, not one per row. Per-row
            instances each waited for their own trigger, so half the list
            sat at low opacity while the other half was solid, which read
            as a hierarchy nobody intended. */}
        <ScrollReveal className={styles.listWrap}>
        <ol className={styles.list}>
          {services.map((service, index) => (
            <li key={service.slug} className={styles.item}>
              <Link
                href={service.route}
                className={styles.link}
                onMouseEnter={() => setActiveSlug(service.slug)}
                onFocus={() => setActiveSlug(service.slug)}
              >
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.textGroup}>
                  <span className={styles.name}>{service.name}</span>
                  <span className={styles.tagline}>{service.tagline}</span>
                </span>
                <span className={styles.arrow} aria-hidden="true">&#8599;</span>
              </Link>
            </li>
          ))}
        </ol>
        </ScrollReveal>
        <div className={styles.imageStage} aria-hidden="true">
          {/* next/image `fill` wants a relative/absolute parent, not the sticky stage itself. */}
          <div className={styles.imageFrame}>
          {servicesWithPreview.map((service) => (
            <Image
              key={service.slug}
              data-testid={`preview-image-${service.slug}`}
              data-active={service.slug === activeSlug}
              src={service.previewImage!}
              alt=""
              fill
              style={focusOf(service.previewImage)}
              sizes="(max-width: 900px) 0px, 40vw"
              className={`${styles.image} ${service.slug === activeSlug ? styles.imageActive : ''}`}
            />
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
