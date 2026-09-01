'use client';
import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import type { Project } from '@/content/types';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { useProjectFilter } from '@/lib/hooks/useProjectFilter';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
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
  const reducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLUListElement>(null);
  const [renderedProjects, setRenderedProjects] = useState(filtered);
  const prevCategoryRef = useRef(category);
  const isFirstRenderRef = useRef(true);

  // Exit step: when the category actually changes, fade+scale out whatever
  // cards are currently on screen, then swap to the newly filtered set. If
  // there's nothing on screen to animate (empty-state -> category, or
  // reduced motion), skip straight to the instant swap — the fallback
  // required when the user prefers reduced motion.
  useLayoutEffect(() => {
    if (prevCategoryRef.current === category) return;
    prevCategoryRef.current = category;

    if (reducedMotion || !gridRef.current) {
      setRenderedProjects(filtered);
      return;
    }
    const cards = gridRef.current.querySelectorAll('[data-project-card]');
    if (cards.length === 0) {
      setRenderedProjects(filtered);
      return;
    }
    let cancelled = false;
    const tween = gsap.to(cards, {
      opacity: 0,
      scale: 0.96,
      duration: motion.duration.fast,
      ease: motion.ease.exit,
      stagger: 0.02,
      onComplete: () => {
        if (!cancelled) setRenderedProjects(filtered);
      },
    });
    return () => {
      cancelled = true;
      tween.kill();
    };
  }, [category, filtered, reducedMotion]);

  // Enter step: fade+scale in whatever cards just landed in the DOM.
  // Skipped on first mount (nothing is "entering", the page is just
  // loading) and under reduced motion (renderedProjects is already final).
  useLayoutEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (reducedMotion || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('[data-project-card]');
    if (cards.length === 0) return;
    const tween = gsap.fromTo(
      cards,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: motion.duration.fast, ease: motion.ease.enter, stagger: 0.02 }
    );
    return () => {
      tween.kill();
    };
  }, [renderedProjects, reducedMotion]);

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
      {renderedProjects.length === 0 ? (
        <p className={styles.empty} aria-live="polite">Todavía no hay trabajos en esta categoría — vuelve pronto.</p>
      ) : (
        <ul className={styles.grid} ref={gridRef} aria-live="polite">
          {renderedProjects.map((project) => (
            <li key={project.slug} className={styles.card} data-project-card>
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
