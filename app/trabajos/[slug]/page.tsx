import { notFound } from 'next/navigation';
import { projects } from '@/content/projects';
import { ProjectGallery } from '@/components/sections/ProjectGallery';
import { NextProjectLink } from '@/components/ui/NextProjectLink';
import { buildMetadata } from '@/lib/seo';
import { creativeWorkSchema } from '@/lib/schema';

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
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema(project)) }}
      />
      <h1>{project.title}</h1>
      <p>{project.category} — {project.year} — {project.location}</p>
      <p>{project.description}</p>
      <ProjectGallery project={project} />
      <NextProjectLink href={`/trabajos/${next.slug}`} label={`Siguiente proyecto: ${next.title}`} />
    </article>
  );
}
