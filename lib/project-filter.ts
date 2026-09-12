import type { Project, ProjectCategory } from '@/content/types';

export type ProjectFilterValue = ProjectCategory | 'todos';

const VALID: ProjectFilterValue[] = ['todos', 'boda', 'video'];

/**
 * Narrows an arbitrary string (e.g. a `?categoria=` query value) to a
 * filter value; anything else means "todos". Lives outside the hook module
 * so server components (app/(site)/trabajos/page.tsx) can import it without
 * pulling React client hooks into the RSC graph.
 */
export function toProjectFilterValue(value: string | undefined | null): ProjectFilterValue {
  return VALID.includes(value as ProjectFilterValue) ? (value as ProjectFilterValue) : 'todos';
}

/**
 * ¿Este reportaje pertenece a esta categoría?
 *
 * Un único sitio donde se decide, porque la pregunta se hace desde cuatro
 * (el filtro de /trabajos, el gancho que lo respalda, el esquema JSON-LD y
 * llms.txt) y una comparación suelta `p.category === x` repartida por ahí es
 * justo como se pierde la segunda pertenencia en una de ellas.
 */
export function perteneceA(project: Pick<Project, 'category' | 'alsoIn'>, category: ProjectCategory): boolean {
  return project.category === category || (project.alsoIn?.includes(category) ?? false);
}

/** La lista filtrada, con 'todos' incluido. */
export function filtrarPorCategoria(projects: Project[], value: ProjectFilterValue): Project[] {
  return value === 'todos' ? projects : projects.filter((p) => perteneceA(p, value));
}
