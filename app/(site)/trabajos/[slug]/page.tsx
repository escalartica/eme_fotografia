import { notFound } from 'next/navigation';
import Image from 'next/image';
import { projects } from '@/content/projects';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { ProjectGallery } from '@/components/sections/ProjectGallery';
import { NextProjectLink } from '@/components/ui/NextProjectLink';
import { ProyectosRelacionados } from '@/components/sections/ProyectosRelacionados';
import { coverBoxStyle } from '@/lib/focal';
import { buildMetadata, ogImage } from '@/lib/seo';
import { creativeWorkSchema, breadcrumbSchema } from '@/lib/schema';
import styles from './page.module.css';

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/**
 * Caracteres disponibles para el título propio de una ficha.
 *
 * Google corta el <title> alrededor de los 60 y `app/layout.tsx` le añade
 * " · EME Fotografía" (17) a toda página que no sea la home.
 */
const TITULO_MAX = 60 - ' · EME Fotografía'.length;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  // Los títulos descriptivos que salieron del renombrado ("Boda de junio con
  // un Mustang rojo", "Postboda en el Real Alcázar", "Preboda en Santa Cruz")
  // ya llevan la palabra clave dentro. Volver a añadir "fotógrafo de boda"
  // detrás la repetía y subía el título a 90 caracteres, de los que Google se
  // come el final: la marca. Cuando el título ya dice "boda", basta con el
  // lugar.
  //
  // Aun así, 21 de las 29 fichas seguían pasándose. La plantilla de
  // app/layout.tsx añade 17 caracteres a cada título (" · EME Fotografía"),
  // así que el texto propio de la ficha solo tiene 43 antes del corte, y
  // "Nombre y Nombre: fotógrafo de boda en Sierra de Sevilla" mide 56 él
  // solo. En vez de recortar a ciegas, se prueban las variantes de más a
  // menos completa y se sirve la primera que cabe entera: lo que se cae
  // primero es el oficio ("fotógrafo de"), que la ficha de una boda concreta
  // no necesita —lo compite /servicios/fotografia-de-boda— y lo último que
  // se cae es el nombre de la pareja, que es lo que se busca.
  const yaDiceBoda = /boda/i.test(project.title);
  const tipo = project.category === 'video' ? 'vídeo de boda' : 'boda';
  const variantes = yaDiceBoda
    ? [`${project.title}, ${project.location}`, project.title]
    : [
        `${project.title}, ${tipo} en ${project.location}`,
        `${project.title}, ${project.location}`,
        project.title,
      ];
  return buildMetadata({
    title: variantes.find((v) => v.length <= TITULO_MAX) ?? project.title,
    description: project.description,
    path: `/trabajos/${project.slug}`,
    image: ogImage(project.cover.type === 'image' ? project.cover.src : project.cover.poster),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Inicio', path: '/' },
              { name: 'Trabajos', path: '/trabajos' },
              { name: project.title, path: `/trabajos/${project.slug}` },
            ])
          ),
        }}
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
        <div className={styles.coverWrap} style={coverBoxStyle(project.cover)}>
          {/* No ScrollParallax here, deliberately. A parallax layer is an
              oversized box that slides inside the frame, so it always hides
              a band of the picture at one end of its travel -- fine for the
              gallery flow further down, wrong for the one photograph that
              opens the story. The box is cut to this photo's own ratio
              instead, so the cover is shown whole; the scroll-driven scale
              settle in the CSS module supplies the movement. */}
          <Image src={project.cover.src} alt={project.cover.alt} fill sizes="100vw" priority />
          {project.cover.isPlaceholderMedia && (
            <span className="sourceBadge">
              Imagen de muestra{project.cover.sourceCredit ? ` — ${project.cover.sourceCredit}` : ''}
            </span>
          )}
        </div>
      )}
      <ProjectGallery project={project} />
      <ProyectosRelacionados project={project} projects={projects} />
      <NextProjectLink
        href={`/trabajos/${next.slug}`}
        label={`Siguiente reportaje: ${next.title}`}
        className={styles.nextLink}
      />
    </article>
  );
}
