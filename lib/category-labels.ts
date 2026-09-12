import type { ProjectCategory } from '@/content/types';

/**
 * «Fotos» y «Vídeo», no «Bodas» y «Vídeo».
 *
 * El par anterior no era un par: comparaba un TIPO DE EVENTO con un FORMATO,
 * así que al lado del filtro «Todos» parecía que «Bodas» excluía algo -- y
 * todo lo que hay en este archivo son bodas, incluidas las de la pestaña de
 * vídeo. Lo que de verdad separa a los dos grupos es en qué se entrega el
 * reportaje. Así la fila de filtros se lee de un vistazo: todos, los de
 * fotografía, los de película.
 */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  boda: 'Fotos',
  video: 'Vídeo',
};
