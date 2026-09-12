import { projects } from '@/content/projects';
import { buildMetadata, ogImage } from '@/lib/seo';
import { TrabajosIndex } from './TrabajosIndex';
import { toProjectFilterValue } from '@/lib/project-filter';

export const metadata = buildMetadata({
  title: 'Reportajes de boda en Sevilla y Andalucía',
  description:
    // 149 caracteres. La anterior medía 116 y dejaba fuera de la SERP el
    // argumento que distingue a esta página de las de la competencia.
    // Sin cifra: era 29 escrita a mano y ya son 28. Una descripción que
    // miente sobre un número comprobable es peor que una sin número.
    'Bodas reales en haciendas, cortijos, basílicas y patios de Sevilla y Andalucía. Cada reportaje, publicado entero y no una selección de diez fotos.',
  path: '/trabajos',
  // LA TARJETA DE ENLACE ES UNA FOTOGRAFÍA, no el logotipo.
  // Todas las páginas menos las fichas de boda compartían la misma tarjeta
  // genérica --la marca sobre fondo oscuro-- así que un estudio de fotografía
  // que se manda por WhatsApp aparecía como un wordmark. La imagen ES el
  // producto y es lo único que se ve en una previsualización antes de decidir
  // si se pincha. `ogImage()` cambia la extensión al derivado JPEG de 1200x630
  // que vive al lado de cada foto (WhatsApp no pinta WebP; ver lib/seo.ts).
  image: ogImage('/images/trabajos/carmen-y-alberto/cover.webp'),
});

export default async function Page({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  // `/servicios` deep-links here with `?categoria=boda|video` so a
  // visitor lands on that service's work already filtered.
  const { categoria } = await searchParams;
  // Newest weddings first; ties keep the curated order of content/projects.ts.
  const ordered = [...projects].sort((a, b) => b.year - a.year);
  return <TrabajosIndex projects={ordered} initialCategory={toProjectFilterValue(categoria)} />;
}
