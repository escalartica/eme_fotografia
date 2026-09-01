import { notFound } from 'next/navigation';
import Image from 'next/image';
import { projects } from '@/content/projects';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { ProjectGallery } from '@/components/sections/ProjectGallery';
import { NextProjectLink } from '@/components/ui/NextProjectLink';
import { buildMetadata } from '@/lib/seo';
import { creativeWorkSchema } from '@/lib/schema';
import styles from './page.module.css';

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: project.description,
    path: `/trabajos/${project.slug}`,
    image: project.cover.type === 'image' ? project.cover.src : project.cover.poster,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <article className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema(project)) }}
      />
      <h1 className={styles.title}>{project.title}</h1>
      <p className={styles.meta}>
        <span>{CATEGORY_LABELS[project.category]}</span>
        <span aria-hidden="true">·</span>
        <span>{project.year}</span>
        <span aria-hidden="true">·</span>
        <span>{project.location}</span>
      </p>
      {project.impactLine && (
        <p className={styles.impact} data-testid="project-impact">{project.impactLine}</p>
      )}
      <p className={styles.description}>{project.description}</p>
      {/* The cover-media hero: the opening shot of the story, dominant
          above the gallery grid. Image covers are static, so they're
          rendered right here with no client boundary. Video covers need
          gated autoplay + a shared lightbox, so that case is handled by
          ProjectGallery (see components/sections/ProjectGallery.tsx). */}
      {project.cover.type === 'image' && (
        <div className={styles.coverWrap}>
          <Image src={project.cover.src} alt={project.cover.alt} fill sizes="100vw" priority />
        </div>
      )}
      <ProjectGallery project={project} />
      <NextProjectLink
        href={`/trabajos/${next.slug}`}
        label={`Siguiente proyecto: ${next.title}`}
        className={styles.nextLink}
      />
    </article>
  );
}
