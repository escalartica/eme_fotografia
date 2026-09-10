import type { ProjectCategory } from '@/content/types';

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
