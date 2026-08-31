import { projects } from '@/content/projects';
import { buildMetadata } from '@/lib/seo';
import { TrabajosFilter } from './TrabajosFilter';

export const metadata = buildMetadata({
  title: 'Trabajos',
  description: 'Bodas, vídeos, fotomatón y experiencias 360° en Sevilla, contados con dirección de arte y mirada editorial.',
  path: '/trabajos',
});

export default function Page() {
  return <TrabajosFilter projects={projects} />;
}
