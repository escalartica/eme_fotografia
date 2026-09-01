'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/content/projects';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { VideoPreview } from '@/components/motion/VideoPreview';
import { Lightbox } from '@/components/motion/Lightbox';
import styles from './SelectedWork.module.css';

export function SelectedWork() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openProject = projects.find((p) => p.slug === openSlug) ?? null;

  return (
    <section className={styles.section} aria-labelledby="selected-work-heading">
      <h2 id="selected-work-heading">Trabajos seleccionados</h2>
      <div className={styles.grid}>
        {projects.map((project, i) => (
          <ScrollReveal
            key={project.slug}
            className={
              project.cover.type === 'video' ? `${styles.card} ${styles.wide}` : styles.card
            }
            delay={(i % 3) * 0.1}
          >
            {project.cover.type === 'image' ? (
              <Link href={`/trabajos/${project.slug}`} aria-label={project.title} data-cursor="ver">
                <div className={styles.imageWrap}>
                  <Image src={project.cover.src} alt={project.cover.alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
                </div>
                <span className={styles.title}>{project.title}</span>
              </Link>
            ) : (
              <div>
                <VideoPreview media={project.cover} onOpenFull={() => setOpenSlug(project.slug)} />
                <Link href={`/trabajos/${project.slug}`} className={styles.title} data-cursor="ver">{project.title}</Link>
              </div>
            )}
          </ScrollReveal>
        ))}
      </div>
      <Lightbox isOpen={!!openProject} onClose={() => setOpenSlug(null)}>
        {openProject?.cover.type === 'video' && (
          <video src={openProject.cover.src} controls autoPlay poster={openProject.cover.poster} aria-label={openProject.cover.alt} />
        )}
      </Lightbox>
    </section>
  );
}
