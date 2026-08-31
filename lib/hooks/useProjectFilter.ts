import { useMemo, useState } from 'react';
import type { Project, ProjectCategory } from '@/content/types';

export function useProjectFilter(projects: Project[]) {
  const [category, setCategory] = useState<ProjectCategory | 'todos'>('todos');
  const filtered = useMemo(
    () => (category === 'todos' ? projects : projects.filter((p) => p.category === category)),
    [projects, category]
  );
  return { category, setCategory, filtered };
}
