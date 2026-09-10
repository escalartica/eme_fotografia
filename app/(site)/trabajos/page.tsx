import { projects } from '@/content/projects';
import { buildMetadata } from '@/lib/seo';
import { TrabajosIndex } from './TrabajosIndex';
import { toProjectFilterValue } from '@/lib/project-filter';

export const metadata = buildMetadata({
  title: 'Reportajes de boda en Sevilla y Andalucía',
  description:
    // 149 caracteres. La anterior medía 116 y dejaba fuera de la SERP el
    // argumento que distingue a esta página de las de la competencia.
    '29 bodas reales en haciendas, cortijos, basílicas y patios de Sevilla y Andalucía. Cada reportaje, publicado entero y no una selección de diez fotos.',
  path: '/trabajos',
});

export default async function Page({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  // `/servicios` deep-links here with `?categoria=boda|video` so a
  // visitor lands on that service's work already filtered.
  const { categoria } = await searchParams;
  // Newest weddings first; ties keep the curated order of content/projects.ts.
  const ordered = [...projects].sort((a, b) => b.year - a.year);
  return <TrabajosIndex projects={ordered} initialCategory={toProjectFilterValue(categoria)} />;
}
