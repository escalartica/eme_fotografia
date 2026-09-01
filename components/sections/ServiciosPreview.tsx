'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { services } from '@/content/services';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './ServiciosPreview.module.css';

const servicesWithPreview = services.filter((service) => service.previewImage);
const defaultActiveSlug = servicesWithPreview[0]?.slug ?? null;

export function ServiciosPreview() {
  const [activeSlug, setActiveSlug] = useState<typeof services[number]['slug'] | null>(defaultActiveSlug);

  return (
    <section className={styles.section} aria-labelledby="servicios-heading">
      <h2 id="servicios-heading" className={styles.heading}>Servicios</h2>
      <div className={styles.layout}>
        <ol className={styles.list}>
          {services.map((service, index) => (
            <li key={service.slug} className={styles.item}>
              <ScrollReveal delay={index * 0.08}>
                <Link
                  href={`/servicios#${service.slug}`}
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
                </Link>
              </ScrollReveal>
            </li>
          ))}
        </ol>
        <div className={styles.imageStage} aria-hidden="true">
          {servicesWithPreview.map((service) => (
            <Image
              key={service.slug}
              data-testid={`preview-image-${service.slug}`}
              data-active={service.slug === activeSlug}
              src={service.previewImage!}
              alt=""
              fill
              sizes="(max-width: 900px) 0px, 40vw"
              className={`${styles.image} ${service.slug === activeSlug ? styles.imageActive : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
