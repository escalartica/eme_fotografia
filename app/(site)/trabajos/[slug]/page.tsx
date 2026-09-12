import { notFound } from 'next/navigation';
import Image from 'next/image';
import { projects } from '@/content/projects';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { ProjectGallery } from '@/components/sections/ProjectGallery';
import { RevealWords } from '@/components/motion/RevealWords';
import { NextProjectLink } from '@/components/ui/NextProjectLink';
import { ProyectosRelacionados } from '@/components/sections/ProyectosRelacionados';
import { sinEtalonarStyle, coverBoxStyle } from '@/lib/focal';
import { buildMetadata, ogImage } from '@/lib/seo';
import { creativeWorkSchema, breadcrumbSchema, jsonLd } from '@/lib/schema';
import styles from './page.module.css';
import { VolverA } from '@/components/ui/VolverA';

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
  // La proporción de la portada decide la maquetación de la cabecera: con una
  // vertical caben dos columnas de verdad; con una apaisada la foto ya es
  // ancha y meterla en media página la deja en un sello, así que el titular
  // se pone encima y la foto ocupa todo el ancho.
  const orientacionPortada =
    project.cover.width && project.cover.height && project.cover.width > project.cover.height
      ? 'apaisada'
      : 'vertical';
  const totalFotos = project.gallery.filter((m) => m.type === 'image').length;

  return (
    <article className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(creativeWorkSchema(project)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema([
              { name: 'Inicio', path: '/' },
              { name: 'Trabajos', path: '/trabajos' },
              { name: project.title, path: `/trabajos/${project.slug}` },
            ])
          ),
        }}
      />
      {/* LA CABECERA DE LA FICHA, EN DOS COLUMNAS Y CON LA FOTO DENTRO.
          ---------------------------------------------------------------
          Antes era una pila: titular, línea de datos, párrafo de descripción
          y, debajo de todo, la fotografía. O sea, la anatomía exacta de una
          entrada de blog -- que es de donde venía la sensación de plantilla,
          porque es la forma que tiene cualquier plantilla.
          Ahora el nombre de la pareja y la primera fotografía comparten
          encuadre: el titular ocupa la columna izquierda y la foto la
          derecha, con el numeral del archivo detrás del nombre. La foto
          sigue entrando ENTERA -- la caja se corta a su propia proporción,
          que es la corrección que impidió que se decapitaran los retratos --
          y lo que se mueve es el texto, no el recorte.
          En un móvil las dos columnas se apilan y el orden vuelve a ser el
          natural: quién, y luego la foto. */}
      {/* LA SALIDA DE ESTA FICHA. Sin esto, quien entra aquí desde Google -- que
          es como se entra a la ficha de una boda concreta -- no tiene forma de
          llegar al resto del trabajo salvo subir a buscar el menú. Veintiocho
          reportajes detrás de un callejón sin salida. */}
      <VolverA href="/trabajos" nombre="Trabajos" />

      <header className={styles.opener} data-orientacion={orientacionPortada}>
        <div className={styles.openerCopy}>
          <span className={styles.chapter} aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h1 className={styles.title}>
            {/* Palabra a palabra, como el resto de titulares del sitio. Es el
                nombre de una pareja: merece el mismo gesto que el manifiesto
                de la home y no aparecer de golpe. */}
            <RevealWords segments={[{ text: project.title }]} />
          </h1>
          {/* Ninguna ficha lleva `impactLine` hoy, pero el campo existe en el
              tipo y hay pruebas que lo cubren: cuando alguien escriba una,
              tiene que caer aquí -- entre el nombre y la línea de datos --,
              que es donde se lee como el subtítulo de la historia. */}
          {project.impactLine && (
            <p className={styles.impact} data-testid="project-impact">{project.impactLine}</p>
          )}
          <p className={styles.meta}>
            <span>{CATEGORY_LABELS[project.category]}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            <span aria-hidden="true">·</span>
            <span>{project.location}</span>
          </p>
          {/* El recuento de fotografías, que es la promesa de esta web: aquí
              se publica el reportaje entero y no una selección de diez. Decir
              cuántas hay antes de que empiece el scroll es lo que convierte
              esa promesa en algo comprobable de un vistazo. */}
          {totalFotos > 0 && (
            <p className={styles.count}>
              {totalFotos} {totalFotos === 1 ? 'fotografía' : 'fotografías'} del reportaje
            </p>
          )}
        </div>
      {/* The cover-media hero: the opening shot of the story. Image covers
          are static, so they're rendered right here with no client boundary.
          Video covers need gated autoplay + a shared lightbox, so that case
          is handled by ProjectGallery (see
          components/sections/ProjectGallery.tsx). */}
      {project.cover.type === 'image' && (
        <div className={styles.coverWrap} style={coverBoxStyle(project.cover)}>
          {/* No ScrollParallax here, deliberately. A parallax layer is an
              oversized box that slides inside the frame, so it always hides
              a band of the picture at one end of its travel -- fine for the
              gallery flow further down, wrong for the one photograph that
              opens the story. The box is cut to this photo's own ratio
              instead, so the cover is shown whole; the scroll-driven scale
              settle in the CSS module supplies the movement. */}
          {/* 1200px: `.page` está topado a 75rem y la portada nunca se sale de
              ahí (`width: min(100%, --cover-max-w)`). Declarar `100vw` hacía
              que la imagen que MIDE el LCP de esta página se pidiera al
              escalón de 3840 en cualquier pantalla grande. */}
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
            /* `--photo-grade: none` para las piezas marcadas `sinEtalonar`:
               ver el comentario del campo en content/types.ts. */
            style={sinEtalonarStyle(project.cover)}
          />
          {project.cover.isPlaceholderMedia && (
            <span className="sourceBadge">
              Imagen de muestra{project.cover.sourceCredit ? ` — ${project.cover.sourceCredit}` : ''}
            </span>
          )}
        </div>
      )}
      </header>
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
