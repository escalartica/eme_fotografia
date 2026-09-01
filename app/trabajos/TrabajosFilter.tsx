'use client';
import type { MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Project } from '@/content/types';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { useProjectFilter } from '@/lib/hooks/useProjectFilter';
import { withPageTransition } from '@/components/motion/PageTransition';
import styles from './TrabajosFilter.module.css';

const CATEGORIES: Array<{ value: 'todos' | 'boda' | 'video' | 'fotomaton' | '360'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'boda', label: CATEGORY_LABELS.boda },
  { value: 'video', label: CATEGORY_LABELS.video },
  { value: 'fotomaton', label: CATEGORY_LABELS.fotomaton },
  { value: '360', label: CATEGORY_LABELS['360'] },
];

export function TrabajosFilter({ projects }: { projects: Project[] }) {
  const { category, setCategory, filtered } = useProjectFilter(projects);
  const router = useRouter();

  function handleProjectClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    withPageTransition(() => router.push(href));
  }

  return (
    <div className={styles.page}>
      <h1>Trabajos</h1>
      <div role="tablist" aria-label="Filtrar trabajos por categoría" className={styles.tablist}>
        {CATEGORIES.map((c) => (
          <button key={c.value} role="tab" aria-selected={category === c.value} onClick={() => setCategory(c.value)} className={styles.tab}>
            {c.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className={styles.empty}>Todavía no hay trabajos en esta categoría — vuelve pronto.</p>
      ) : (
        <ul className={styles.grid}>
          {filtered.map((project) => (
            <li key={project.slug} className={styles.card}>
              <Link
                href={`/trabajos/${project.slug}`}
                aria-label={`Ver proyecto ${project.title}`}
                data-cursor="ver"
                onClick={(e) => handleProjectClick(e, `/trabajos/${project.slug}`)}
              >
                {project.cover.type === 'image' ? (
                  <div className={styles.imageWrap}>
                    <Image src={project.cover.src} alt={project.cover.alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
                  </div>
                ) : (
                  <div className={styles.imageWrap}>
                    <Image src={project.cover.poster ?? project.cover.src} alt={project.cover.alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
                  </div>
                )}
                <span className={styles.title}>{project.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
