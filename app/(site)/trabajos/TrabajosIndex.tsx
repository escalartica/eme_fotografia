'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { gsap } from 'gsap';
import type { Project } from '@/content/types';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { useProjectFilter, type ProjectFilterValue } from '@/lib/hooks/useProjectFilter';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { withPageTransition } from '@/components/motion/PageTransition';
import { ScrollParallax } from '@/components/motion/ScrollParallax';
import { focusOf } from '@/lib/focal';
import styles from './TrabajosIndex.module.css';

/**
 * The banner photograph, chosen for the banner's shape.
 *
 * It used to be whatever the featured project's cover happened to be, and
 * that cover is a 2:3 portrait. In a full-bleed band roughly 2.1:1 a
 * portrait shows 26% of itself -- the page opened on a sliver. A page-wide
 * banner needs a landscape frame picked for it, not a cover borrowed from
 * somewhere the shape was different.
 */
const OPENER = {
  src: '/images/trabajos/dos-novios-en-una-hacienda-sevillana/06.webp',
  alt: 'La entrada de uno de los novios del brazo de su madre, en blanco y negro',
};

const CATEGORIES: Array<{ value: ProjectFilterValue; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'boda', label: CATEGORY_LABELS.boda },
  { value: 'video', label: CATEGORY_LABELS.video },
];

function coverSrc(p: Project) {
  return p.cover.type === 'video' ? (p.cover.poster ?? p.cover.src) : p.cover.src;
}

/**
 * What the fixed 3:4 preview frame shows: the portrait stand-in when the
 * project has one, otherwise the cover. Only the pinned preview needs
 * this -- the grid below adapts to each photograph instead.
 */
function previewMedia(p: Project) {
  if (p.thumb) return { src: p.thumb.src, alt: p.thumb.alt, focus: p.thumb.focus };
  return { src: coverSrc(p), alt: p.cover.alt, focus: p.cover.focus };
}

/**
 * The work as an index, not a scroll: every wedding is one line of a
 * list -- number, names, place, year -- and the photograph lives in a
 * single pinned frame beside it that changes as the pointer moves down
 * the list (the "index + preview" layout of the reference studios).
 * Seventeen projects fit in a screen and a half instead of ten thousand
 * pixels of stacked spreads. On phones the same list renders as a tight
 * two-column grid of covers, since there is no hover to drive a preview.
 */
export function TrabajosIndex({ projects, initialCategory = 'todos' }: { projects: Project[]; initialCategory?: ProjectFilterValue }) {
  const { category, setCategory, filtered } = useProjectFilter(projects, initialCategory);
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Project | null>(filtered[0] ?? null);
  // Two stacked layers so a change is a crossfade, never a blank frame.
  const [layers, setLayers] = useState<[Project | null, Project | null]>([filtered[0] ?? null, null]);
  const [front, setFront] = useState<0 | 1>(0);
  const isFirstRender = useRef(true);

  // Changing the filter resets the preview to the first project of the
  // new set, so the pinned frame never shows a wedding that is not listed.
  const changeCategory = useCallback(
    (value: ProjectFilterValue) => {
      setCategory(value);
      const next = (value === 'todos' ? projects : projects.filter((p) => p.category === value))[0] ?? null;
      setActive(next);
      setLayers([next, null]);
      setFront(0);
    },
    [projects, setCategory]
  );

  // Rows rise in, staggered, whenever the filter changes.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (reducedMotion || !listRef.current) return;
    const rows = listRef.current.querySelectorAll('[data-project-card]');
    const tween = gsap.fromTo(rows, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.035, clearProps: 'transform' });
    return () => {
      tween.kill();
    };
  }, [filtered, reducedMotion]);

  const show = useCallback(
    (p: Project) => {
      if (p === active) return;
      setActive(p);
      setLayers((prev) => {
        const next: [Project | null, Project | null] = [...prev] as [Project | null, Project | null];
        next[front === 0 ? 1 : 0] = p;
        return next;
      });
      setFront((f) => (f === 0 ? 1 : 0));
    },
    [active, front]
  );

  // Crossfade + settle of the incoming layer.
  useEffect(() => {
    if (reducedMotion || !previewRef.current) return;
    const incoming = previewRef.current.querySelector<HTMLElement>(`[data-layer="${front}"]`);
    const outgoing = previewRef.current.querySelector<HTMLElement>(`[data-layer="${front === 0 ? 1 : 0}"]`);
    if (!incoming) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(incoming, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', overwrite: true });
      if (outgoing) gsap.to(outgoing, { opacity: 0, duration: 0.5, ease: 'power2.out', overwrite: true });
    });
    return () => ctx.revert();
  }, [front, reducedMotion]);

  // The pinned frame leans a few pixels towards the pointer.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || reducedMotion) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      xTo(nx * 14);
      yTo(ny * 10);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion]);

  function handleProjectClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    withPageTransition(() => router.push(href));
  }

  const activeIndex = active ? filtered.indexOf(active) : -1;

  return (
    <div className={styles.page}>
      <div className={styles.opener}>
          <ScrollParallax strength={3}>
            <Image src={OPENER.src} alt={OPENER.alt} fill sizes="100vw" className={styles.openerImage} style={focusOf(OPENER.src)} priority />
          </ScrollParallax>
          <div className={styles.openerScrim} aria-hidden="true" />
          <div className={styles.openerContent}>
            <span className={styles.openerChapter} aria-hidden="true">
              00
            </span>
            <div>
              {/* El <h1> dice de qué va la página, no cómo se llama el
                  enlace del menú. "Trabajos" era la única cabecera del
                  sitio que no nombraba su contenido, y es la página que
                  compite por la búsqueda de la pareja. El recuento se baja
                  a la línea de crédito, que es donde ya vivía. */}
              <h1 className={styles.openerTitle}>Reportajes de boda en Sevilla y Andalucía</h1>
              <span className={styles.openerCredit}>
                {projects.length} bodas, prebodas y postbodas
              </span>
            </div>
          </div>
      </div>

      <div className={styles.toolbar}>
        {/* Botones de filtro con aria-pressed, NO un `tablist`. Esto se
            anunciaba como "pestaña 1 de 3" y no lo era: no hay ningún
            `tabpanel` al que llevar, no había `aria-controls`, y el patrón de
            pestañas de ARIA obliga a mover el foco con las flechas y a un
            solo tabulador para todo el grupo (roving tabindex), nada de lo
            cual estaba implementado. Quien navega con lector de pantalla
            oía la promesa de un widget y se encontraba otro. Lo que hay de
            verdad son tres interruptores que filtran una lista: un botón
            nativo con estado pulsado lo dice exactamente, y el recuento de
            al lado (aria-live) confirma el resultado. */}
        <div role="group" aria-label="Filtrar trabajos por categoría" className={styles.tablist}>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-pressed={category === c.value}
              onClick={() => changeCategory(c.value)}
              className={styles.tab}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className={styles.count} aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'reportaje' : 'reportajes'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty} aria-live="polite">
          Todavía no hay reportajes en esta categoría. Pulsad «Todos» para ver las {projects.length} bodas,
          prebodas y postbodas publicadas.
        </p>
      ) : (
        <div className={styles.layout}>
          {/* Pinned preview (desktop). Decorative: the row links carry the semantics. */}
          <div className={styles.previewCol} aria-hidden="true">
            <div ref={previewRef} className={styles.preview}>
              {layers.map((p, i) => (
                <div key={i} data-layer={i} className={styles.layer} style={{ zIndex: front === i ? 2 : 1, opacity: front === i ? 1 : 0 }}>
                  {p && (() => { const m = previewMedia(p); return (
                    <Image src={m.src} alt="" fill sizes="(max-width: 959px) 0px, 42vw" className={styles.previewImage} style={focusOf(m.src, m.focus)} />
                  ); })()}
                </div>
              ))}
              {active && (
                <div className={styles.previewCaption}>
                  <span className={styles.previewIndex}>{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span className={styles.previewTitle}>{active.title}</span>
                  <span className={styles.previewMeta}>
                    {active.location}, {active.year} · {CATEGORY_LABELS[active.category]}
                  </span>
                </div>
              )}
            </div>
          </div>

          <ol ref={listRef} className={styles.list}>
            {filtered.map((p, i) => {
              const href = `/trabajos/${p.slug}`;
              const isActive = p === active;
              return (
                <li key={p.slug} className={styles.row} data-project-card data-active={isActive || undefined}>
                  <a
                    href={href}
                    className={styles.rowLink}
                    aria-label={`Ver reportaje: ${p.title}`}
                    onMouseEnter={() => show(p)}
                    onFocus={() => show(p)}
                    onClick={(e) => handleProjectClick(e, href)}
                    data-cursor="ver"
                  >
                    {/* The photograph's own shape, so a landscape cover is
                        not shown at half its width in a portrait box. */}
                    <span
                      className={styles.thumb}
                      style={
                        p.cover.width && p.cover.height
                          ? ({ ['--thumb-ar' as string]: `${p.cover.width} / ${p.cover.height}` } as CSSProperties)
                          : undefined
                      }
                    >
                      <Image src={coverSrc(p)} alt="" fill sizes="(max-width: 959px) 46vw, 0px" className={styles.thumbImage} style={focusOf(coverSrc(p), p.cover.focus)} />
                    </span>
                    <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.rowTitle}>{p.title}</span>
                    <span className={styles.rowMeta}>
                      <span>{p.location}</span>
                      <span>{p.year}</span>
                      <span className={styles.rowCategory}>{CATEGORY_LABELS[p.category]}</span>
                    </span>
                    <span className={styles.rowArrow} aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
