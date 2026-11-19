import { faqs } from '@/content/faq';
import { projects } from '@/content/projects';
import type { FaqEntry, Project, Service } from '@/content/types';
import { perteneceA } from '@/lib/project-filter';

/**
 * Las preguntas frecuentes que responde la página de un servicio, en el orden
 * de `service.faqIds`.
 *
 * Un único sitio para la página y para su FAQPage: lo que se marca para Google
 * tiene que ser exactamente lo que se ve. Las entradas pendientes de
 * confirmar por el estudio (`isPendingConfirmation`) se quedan fuera de las
 * dos cosas, y un id que ya no exista en content/faq.ts se ignora en vez de
 * pintar un hueco.
 */
export function preguntasDelServicio(service: Pick<Service, 'faqIds'>): FaqEntry[] {
  return (service.faqIds ?? [])
    .map((id) => faqs.find((f) => f.id === id))
    .filter((f): f is FaqEntry => Boolean(f) && !f!.isPendingConfirmation);
}

/**
 * Las bodas publicadas de la categoría del servicio, de la más reciente a la
 * más antigua, para enlazarlas desde la página del servicio.
 *
 * Solo bodas: las prebodas y postbodas tienen sus propias fichas, pero en un
 * capítulo que dice «las bodas que hemos contado» serían otra cosa. El orden
 * de content/projects.ts desempata dentro del mismo año.
 */
export function bodasDelServicio(service: Pick<Service, 'relatedCategory'>, max = 8): Project[] {
  const categoria = service.relatedCategory;
  if (!categoria) return [];
  return projects
    .filter((p) => perteneceA(p, categoria))
    .filter((p) => !/^(pre|post)boda/i.test(p.title))
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.year - a.p.year || a.i - b.i)
    .slice(0, max)
    .map(({ p }) => p);
}
