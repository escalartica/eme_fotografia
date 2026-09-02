'use client';
import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { gsap } from 'gsap';
import type { Project } from '@/content/types';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { useProjectFilter } from '@/lib/hooks/useProjectFilter';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
import { withPageTransition } from '@/components/motion/PageTransition';
import { EditorialSpread } from '@/components/sections/EditorialSpread';
import { buildProjectSpreads } from '@/lib/editorial-spread-assignment';
import styles from './TrabajosFilter.module.css';

// Featured opener image: the most recently onboarded real wedding with a
// landscape (breakout-friendly) cover -- 'raquel-y-fran' and
// 'andrea-y-jesus' both landed in the same commit (a182947), so there's no
// real "most recent" tiebreaker between them; picked for its wide 1600x1066
// cover (suits a full-bleed letterbox opener better than a portrait crop)
// and its striking, motion-filled frame (couple celebrating in a classic
// convertible). Falls back to the first project defensively, though every
// real project already has a genuine (non-placeholder) cover.
const FEATURED_SLUG = 'raquel-y-fran';

const CATEGORIES: Array<{ value: 'todos' | 'boda' | 'video' | 'fotomaton' | '360'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'boda', label: CATEGORY_LABELS.boda },
  { value: 'video', label: CATEGORY_LABELS.video },
  { value: 'fotomaton', label: CATEGORY_LABELS.fotomaton },
  { value: '360', label: CATEGORY_LABELS['360'] },
];

export function TrabajosFilter({ projects }: { projects: Project[] }) {
  const featured = projects.find((p) => p.slug === FEATURED_SLUG) ?? projects[0];
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
      {/* Bespoke opener: a full-bleed real photo from the portfolio itself
          (not a generic text banner) -- retires the pixel-identical
          serif-h1 partial this page used to share with /servicios. Not an
          EditorialSpread instance (those are clickable project cards; this
          is the page's own header, not a link), but the visual grammar
          deliberately echoes it: .breakout width, a chapterNumber ghost
          numeral, and a scrim-protected title anchored to a photo corner --
          see EditorialSpread.module.css's .panoramic variant, the closest
          existing relative. */}
      {featured && (
        <div className={styles.opener}>
          <Image
            src={featured.cover.src}
            alt={featured.cover.alt}
            fill
            sizes="100vw"
            className={styles.openerImage}
            priority
          />
          <div className={styles.openerScrim} aria-hidden="true" />
          <div className={styles.openerContent}>
            <span className={styles.openerChapter} aria-hidden="true">00</span>
            <div>
              <h1 className={styles.openerTitle}>Trabajos</h1>
              <span className={styles.openerCredit}>
                {featured.title} — {CATEGORY_LABELS[featured.category]}
              </span>
            </div>
          </div>
        </div>
      )}
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
          {/* Variant assignment is recomputed against `renderedProjects` (the
              CURRENTLY FILTERED set) so consecutive spreads never repeat a
              variant within whatever category is actually on screen — see
              lib/editorial-spread-assignment.ts's own doc comment for the
              heuristic itself. Each EditorialSpread renders with
              `reveal={false}`: this page already runs its own filter-driven
              fade+scale re-flow animation (the effects above, keyed off
              category changes) over these same `[data-project-card]`
              elements -- letting EditorialSpread ALSO wrap each one in its
              own scroll-triggered ScrollReveal would stack two animation
              systems fighting over the same subtree's opacity, the
              nested-ScrollReveal conflict this project hit once already
              (prior plan's Task 7/9). */}
          {buildProjectSpreads(renderedProjects).map(({ project, variant, images }, i) => (
            <li key={project.slug} className={styles.card} data-project-card>
              <EditorialSpread
                variant={variant}
                images={images}
                title={project.title}
                chapterNumber={String(i + 1).padStart(2, '0')}
                href={`/trabajos/${project.slug}`}
                reveal={false}
                onClick={(e) => handleProjectClick(e, `/trabajos/${project.slug}`)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
