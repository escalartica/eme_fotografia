import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/content/projects';
import { ProjectGallery } from '@/components/sections/ProjectGallery';

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <article>
      <h1>{project.title}</h1>
      <p>{project.category} — {project.year} — {project.location}</p>
      <p>{project.description}</p>
      <ProjectGallery project={project} />
      <Link href={`/trabajos/${next.slug}`}>Siguiente proyecto: {next.title}</Link>
    </article>
  );
}
