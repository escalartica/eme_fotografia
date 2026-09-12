import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/content/types';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { focusOf, sinEtalonarStyle } from '@/lib/focal';
import { pickRelated } from '@/lib/related';
import styles from './ProyectosRelacionados.module.css';
import { RevealWords } from '@/components/motion/RevealWords';

/**
 * Three more weddings at the foot of every reportaje.
 *
 * Before this, a project page's only outgoing link to another project was
 * the single "siguiente proyecto" arrow, which chains the 29 reportajes
 * into one long line: every page one link deep from its neighbour and
 * nothing else, so link value never spreads and a crawler walks the whole
 * chain in order to reach the last one. Three contextual links per page
 * turns that line into a mesh.
 *
 * Cuáles son esos tres lo decide `lib/related.ts`, que reparte los 87
 * enlaces sobre los 29 reportajes en lugar de elegir ficha por ficha. El
 * porqué está documentado allí: el criterio de afinidad, a solas, dejaba
 * doce reportajes con cero enlaces entrantes.
 */

function coverSrc(p: Project) {
  return p.cover.type === 'video' ? (p.cover.poster ?? p.cover.src) : p.cover.src;
}

export function ProyectosRelacionados({ project, projects }: { project: Project; projects: Project[] }) {
  const related = pickRelated(project, projects);
  if (related.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="relacionados-heading">
      {/* El titular tiene que decir la verdad sobre lo que hay debajo.
          `pickRelated` puntúa la localización (+4) pero NO la garantiza:
          siempre devuelve 3, coincidan o no. Con los datos actuales el titular
          mentía en 5 fichas -- "Más bodas en Andalucía" sobre tres bodas de
          Sevilla, "Más bodas en Costa de la Luz" sobre tres de Sevilla, y las
          tres de la sierra con una de Sevilla colada. Es un <h2> indexable
          afirmando un hecho falso. */}
      <h2 id="relacionados-heading" className={styles.heading}>
        <RevealWords
          segments={[
            {
              text: related.every((p) => p.location === project.location)
                ? `Más bodas en ${project.location}`
                : 'Otros reportajes',
            },
          ]}
        />
      </h2>
      <ul className={styles.grid}>
        {related.map((p) => {
          const src = coverSrc(p);
          return (
            <li key={p.slug} className={styles.item}>
              <Link href={`/trabajos/${p.slug}`} className={styles.link} data-cursor="ver">
                <span
                  className={styles.frame}
                  style={
                    p.cover.width && p.cover.height
                      ? ({ ['--frame-ar' as string]: `${p.cover.width} / ${p.cover.height}` } as CSSProperties)
                      : undefined
                  }
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 46vw, 30vw"
                    className={styles.image}
                    style={{ ...focusOf(src, p.cover.focus), ...sinEtalonarStyle(p.cover) }}
                  />
                </span>
                <span className={styles.name}>{p.title}</span>
                <span className={styles.meta}>
                  {p.location}, {p.year} · {CATEGORY_LABELS[p.category]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
