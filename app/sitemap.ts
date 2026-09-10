import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { services } from '@/content/services';
import { site } from '@/content/site';
import type { Project } from '@/content/types';

const SITE_URL = site.siteUrl;

/** Las rutas de content/ son relativas a public/ ('/images/...'); el sitemap
 *  solo admite URLs absolutas. */
const abs = (path: string) => `${SITE_URL}${path}`;

/**
 * Las fotos de un reportaje, para la extensión de imagen del sitemap.
 *
 * Google descubre hoy muy poco de este sitio: la galería de cada ficha la
 * pinta ProjectGallery, que es un componente de cliente y carga las fotos en
 * diferido según se hace scroll, así que el HTML inicial no las lleva. La
 * extensión de imagen es la vía que no depende de que el rastreador ejecute
 * ese JavaScript ni llegue hasta abajo: le entrega la lista entera junto a la
 * URL en la que vive.
 *
 * Salen del mismo `content/projects.ts` que pinta la página -- portada más
 * galería, sin el `thumb`, que es un recorte de reserva de una foto que casi
 * siempre ya está en la galería. `Set` porque alguna portada se repite dentro
 * de su propia galería y una URL duplicada no aporta nada.
 */
function projectImages(project: Project): string[] {
  const media = [project.cover, ...project.gallery];
  return [...new Set(media.filter((m) => m.type === 'image').map((m) => abs(m.src)))];
}

/**
 * Los vídeos de un reportaje, para la extensión de vídeo del sitemap.
 *
 * Se lista un clip cuando tiene póster Y duración medida (`durationSeconds`,
 * leída con ffprobe sobre el fichero). Esas dos condiciones no son un filtro
 * técnico: `durationSeconds` solo lo llevan los clips que son el contenido
 * principal de su página -- el tráiler de la boda --, así que la lista sale
 * de una decisión editorial escrita en el dato, no de barrer todo lo que sea
 * .mp4. Los planos aéreos de apoyo de 5-14 s sin audio que acompañan al
 * tráiler quedan fuera a propósito: son la textura de la página, no su
 * contenido, y declararlos como vídeos sería relleno.
 *
 * `title`, `description` y `thumbnail_loc` son los tres campos obligatorios y
 * los tres son reales: el título del reportaje, el texto alternativo del clip
 * (que describe ese clip, no la boda en general) y el póster que ya sirve la
 * propia página. La extensión de vídeo NO exige fecha de subida, y por eso
 * estos vídeos se pueden descubrir hoy aunque el `VideoObject` de datos
 * estructurados siga bloqueado esperando un `uploadDate` real (ver
 * lib/schema.ts). `duration` va en segundos enteros, que es lo que admite el
 * formato; el valor medido, con decimales, se queda en content/projects.ts.
 */
function projectVideos(project: Project) {
  const media = [project.cover, ...project.gallery];
  return media.flatMap((m) =>
    m.type === 'video' && m.poster && m.durationSeconds
      ? [
          {
            title: project.title,
            description: m.alt,
            thumbnail_loc: abs(m.poster),
            content_loc: abs(m.src),
            duration: Math.round(m.durationSeconds),
          },
        ]
      : []
  );
}

/**
 * `lastModified` is omitted on purpose.
 *
 * It used to be `new Date()` on every entry, which is a claim that every
 * page on the site changed at the moment of the build -- a signal Google
 * learns to distrust and then ignores, taking the honest entries down with
 * it. Nothing in content/ carries a real per-page modification date yet
 * (projects have a `year`, not a timestamp), so the field is left out
 * rather than filled with a value that is not true. Add it back per route
 * the day the content files carry real dates.
 *
 * `priority` is set, and it is a relative ranking within this site only:
 * the home and the work index are the pages that should be recrawled
 * first, the reportajes next, and the legal pages last.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const primary = ['/', '/trabajos', ...services.map((s) => s.route), '/contacto'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.8,
  }));
  // /servicios es ahora un índice que reparte hacia las dos hijas: las
  // páginas que compiten por una búsqueda son ellas, no él.
  const secondary = ['/servicios', '/sobre-nosotros'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  const legal = ['/aviso-legal', '/privacidad', '/cookies'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'yearly' as const,
    priority: 0.1,
  }));
  const projectRoutes = projects.map((p) => {
    const videos = projectVideos(p);
    return {
      url: `${SITE_URL}/trabajos/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: projectImages(p),
      // Se omite entero cuando no hay ninguno, en vez de emitir una lista
      // vacía: un reportaje de foto no tiene por qué declarar que no tiene
      // vídeos.
      ...(videos.length > 0 ? { videos } : {}),
    };
  });
  return [...primary, ...secondary, ...projectRoutes, ...legal];
}
