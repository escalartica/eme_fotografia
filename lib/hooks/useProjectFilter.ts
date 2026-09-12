import { useMemo, useState } from 'react';
import type { Project } from '@/content/types';
import { filtrarPorCategoria, type ProjectFilterValue } from '@/lib/project-filter';

export type { ProjectFilterValue } from '@/lib/project-filter';

export function useProjectFilter(projects: Project[], initialCategory: ProjectFilterValue = 'todos') {
  const [category, setCategory] = useState<ProjectFilterValue>(initialCategory);
  const filtered = useMemo(
    () => filtrarPorCategoria(projects, category),
    [projects, category]
  );
  return { category, setCategory, filtered };
}
