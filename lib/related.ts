import type { Project } from '@/content/types';

/**
 * Qué tres reportajes se enlazan al pie de cada ficha.
 *
 * La primera versión de esto puntuaba cada candidato y se quedaba con los
 * tres mejores, ficha por ficha y sin mirar a las demás. El criterio era
 * bueno —misma localización, misma categoría, año cercano— y aun así el
 * resultado fue el contrario del que se buscaba: 24 de los 29 reportajes
 * tienen `location: 'Sevilla'` y 27 de 29 `category: 'boda'`, así que el +4
 * y el +2 son casi constantes, la puntuación la acababa decidiendo el
 * desempate por año, y las 29 fichas repartían sus 87 enlaces sobre 17
 * destinos. Doce reportajes se quedaban con cero enlaces entrantes.
 *
 * Y el reparto salía justo al revés de lo que le conviene a este estudio:
 * siete fichas de 3 a 5 fotos acumulaban 36 de los 87 enlaces (el 41 %),
 * mientras ocho bodas de 15 a 20 fotos —las que demuestran que aquí se
 * publica el reportaje entero— no recibían ninguno. Una pareja que entraba
 * por una ficha corta solo podía ir a otras fichas cortas.
 *
 * El arreglo es mirar el conjunto en lugar de cada ficha por su cuenta: se
 * recorren los reportajes en el orden del fichero y cada uno elige a los que
 * menos enlaces llevan repartidos, restando de la puntuación lo que ya se ha
 * usado a ese candidato. Cuesta muy poca relevancia (23 de 29 fichas siguen
 * enlazando solo a su misma localización, frente a 24 antes) y deja a los 29
 * reportajes entre 2 y 4 enlaces entrantes, sin ninguno a cero.
 */

/**
 * Cuánto penaliza cada enlace ya repartido a un candidato.
 *
 * Es el único número que gobierna el equilibrio. Por debajo de 3 no llega a
 * compensar el +4 de la localización y vuelven a aparecer huérfanos; por
 * encima, la afinidad deja de decidir nada y el bloque se convierte en una
 * lista rotatoria. A 3, un candidato ya usado una vez sigue ganando a uno de
 * otra localización, pero uno usado dos veces no.
 */
const USE_PENALTY = 3;

function affinity(a: Project, b: Project): number {
  return (
    (a.location === b.location ? 4 : 0) +
    (a.category === b.category ? 2 : 0) +
    (Math.abs(a.year - b.year) <= 1 ? 1 : 0)
  );
}

/**
 * Los `count` reportajes relacionados de cada slug, calculados de una vez
 * sobre el conjunto entero. El orden de `all` es el del fichero de contenido
 * y es lo que hace el resultado determinista: la misma lista de proyectos
 * produce siempre el mismo mapa, en servidor y en el test.
 */
export function relatedMap(all: Project[], count = 3): Map<string, Project[]> {
  const used = new Map<string, number>(all.map((p) => [p.slug, 0]));
  const result = new Map<string, Project[]>();

  for (const project of all) {
    const picks: Project[] = [];
    const candidates = all.filter((p) => p.slug !== project.slug);

    // Se elige de uno en uno, y no ordenando la lista entera, porque cada
    // elección cambia el coste de las siguientes: dos fichas de la misma
    // boda no deben irse las dos al mismo destino.
    for (let i = 0; i < count && i < candidates.length; i += 1) {
      let best: Project | null = null;
      let bestKey = -Infinity;
      for (const candidate of candidates) {
        if (picks.includes(candidate)) continue;
        const key = affinity(project, candidate) - USE_PENALTY * (used.get(candidate.slug) ?? 0);
        // Empate: primero el más reciente, y si también empata, el slug, que
        // es estable y único. Sin el segundo criterio el resultado dependería
        // del orden de recorrido y cambiaría al reordenar el fichero.
        if (
          key > bestKey ||
          (key === bestKey &&
            best !== null &&
            (candidate.year > best.year ||
              (candidate.year === best.year && candidate.slug < best.slug)))
        ) {
          best = candidate;
          bestKey = key;
        }
      }
      if (!best) break;
      picks.push(best);
      used.set(best.slug, (used.get(best.slug) ?? 0) + 1);
    }

    result.set(project.slug, picks);
  }

  return result;
}

/**
 * El mapa se calcula una vez por lista de proyectos. Cada una de las 29
 * fichas se renderiza por separado, y sin esto cada render recalcularía el
 * reparto completo de las 29 para leer solo su fila.
 */
const cache = new WeakMap<Project[], Map<string, Project[]>>();

export function pickRelated(project: Project, all: Project[], count = 3): Project[] {
  if (count !== 3) return relatedMap(all, count).get(project.slug) ?? [];
  let map = cache.get(all);
  if (!map) {
    map = relatedMap(all);
    cache.set(all, map);
  }
  return map.get(project.slug) ?? [];
}
