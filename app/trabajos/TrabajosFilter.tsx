'use client';
import Link from 'next/link';
import type { Project } from '@/content/types';
import { useProjectFilter } from '@/lib/hooks/useProjectFilter';

const CATEGORIES: Array<{ value: 'todos' | 'boda' | 'video' | 'fotomaton' | '360'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'boda', label: 'Bodas' },
  { value: 'video', label: 'Vídeo' },
  { value: 'fotomaton', label: 'Fotomatón' },
  { value: '360', label: '360°' },
];

export function TrabajosFilter({ projects }: { projects: Project[] }) {
  const { category, setCategory, filtered } = useProjectFilter(projects);

  return (
    <div>
      <h1>Trabajos</h1>
      <div role="tablist" aria-label="Filtrar trabajos por categoría">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            role="tab"
            aria-selected={category === c.value}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul>
        {filtered.map((project) => (
          <li key={project.slug}>
            <Link href={`/trabajos/${project.slug}`} aria-label={`Ver proyecto ${project.title}`}>
              {project.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
