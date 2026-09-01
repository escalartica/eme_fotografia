import { projects } from '@/content/projects';
import { EditorialSpread } from '@/components/sections/EditorialSpread';
import { buildProjectSpreads } from '@/lib/editorial-spread-assignment';
import styles from './SelectedWork.module.css';

// Real project spreads: variant + primary/secondary images assigned by the
// real-dimension-driven heuristic in lib/editorial-spread-assignment.ts —
// not hardcoded per project. The video project (boda-real-01) goes through
// EditorialSpread's own poster+"Reproducir" video path (click navigates to
// the detail page) rather than the old VideoPreview+Lightbox inline-player
// combo this section used to special-case; see that heuristic module's own
// doc comment for the full rationale.
const spreads = buildProjectSpreads(projects);

export function SelectedWork() {
  return (
    <section className={styles.section} aria-labelledby="selected-work-heading">
      <h2 id="selected-work-heading">Trabajos seleccionados</h2>
      <div className={styles.list}>
        {spreads.map(({ project, variant, images }, i) => (
          <EditorialSpread
            key={project.slug}
            variant={variant}
            images={images}
            title={project.title}
            chapterNumber={String(i + 1).padStart(2, '0')}
            href={`/trabajos/${project.slug}`}
            delay={(i % 3) * 0.1}
          />
        ))}
      </div>
    </section>
  );
}
