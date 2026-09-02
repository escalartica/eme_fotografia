import type { Project, ProjectMedia } from '@/content/types';
import type { EditorialSpreadMedia, EditorialSpreadVariant } from '@/components/sections/EditorialSpread';

export interface ProjectSpread {
  project: Project;
  variant: EditorialSpreadVariant;
  images: EditorialSpreadMedia[];
}

/**
 * Variant-assignment heuristic for `EditorialSpread` (Task 5 of the
 * 2026-09-01-eme-fotografia-editorial-v3 plan).
 *
 * The whole point of this component is replacing the old uniform
 * `aspect-ratio: 3/2` card grid — so the variant a project gets is driven by
 * its own REAL, measured cover-image dimensions (never guessed; see
 * `EditorialSpreadMedia`'s own doc comment), not by the project's name or
 * position. Adding a ninth project tomorrow with no code changes here
 * should still produce a sensible, varied assignment.
 *
 * Classification, by cover aspect ratio (width / height):
 *   - ratio <= 0.85 (portrait, tall)   -> best fit is `full-bleed`, whose
 *     hero image is sized by height, not stretched -- a strong vertical
 *     portrait reads best filling that tall frame.
 *   - ratio >= 1.5  (wide landscape, 3:2 or wider) -> best fit is
 *     `panoramic`, the one variant with a deliberate letterbox crop for an
 *     already-wide source. 1.5 (not a stricter widescreen-only cutoff) is
 *     deliberate: this project's real photo set tops out at exactly 3:2
 *     (1600x1066) — a stricter threshold would make `panoramic` reachable
 *     only by the one video cover in the whole catalog (final whole-branch
 *     review, finding I1: verified live that the stricter 1.6 cutoff left
 *     `ScrollParallax`, panoramic's own scroll effect, rendering nowhere on
 *     the real site).
 *   - otherwise (a "normal" landscape/near-square cover) -> neither a tall
 *     hero nor a wide panorama reads right; shown as a pair instead
 *     (`overlap-pair` preferred for the more dramatic offset composition,
 *     `diptych` as the plainer fallback) alongside a second image pulled
 *     from the gallery.
 *
 * Consecutive projects never repeat the same variant, even when the
 * heuristic above would naturally pick the same one twice (e.g. several
 * real weddings here share near-identical portrait cover crops): each
 * project's classification produces an ordered list of ALL FOUR variants,
 * best-fit first, and assignment walks the page in order picking the first
 * candidate that differs from the immediately preceding project's variant.
 */

const ALL_VARIANTS: EditorialSpreadVariant[] = ['full-bleed', 'panoramic', 'overlap-pair', 'diptych'];

function hasMeasuredDimensions(media: ProjectMedia): media is ProjectMedia & { width: number; height: number } {
  return typeof media.width === 'number' && typeof media.height === 'number';
}

function orientation(media: ProjectMedia): 'portrait' | 'landscape' | 'unknown' {
  if (!hasMeasuredDimensions(media)) return 'unknown';
  return media.width / media.height < 1 ? 'portrait' : 'landscape';
}

function toSpreadMedia(media: ProjectMedia): EditorialSpreadMedia | null {
  if (!hasMeasuredDimensions(media)) return null;
  return {
    type: media.type,
    src: media.src,
    poster: media.poster,
    alt: media.alt,
    width: media.width,
    height: media.height,
  };
}

/** Ordered, best-fit-first list of every variant for one project — see the
 * module doc comment above for the classification rule. Two-image variants
 * are only offered when the project actually has a usable (measured)
 * secondary image in its gallery. */
function candidateVariants(project: Project): EditorialSpreadVariant[] {
  const hasSecondary = project.gallery.some((m) => toSpreadMedia(m) !== null);
  const twoImage: EditorialSpreadVariant[] = hasSecondary ? ['overlap-pair', 'diptych'] : [];

  if (!hasMeasuredDimensions(project.cover)) {
    // No measured cover dimensions -- shouldn't happen for real content
    // (see toSpreadMedia's caller, which throws loudly for this case), but
    // if it ever does, prefer a two-image variant (doesn't depend on the
    // cover's own proportions as tightly as a single hero image does).
    return [...twoImage, ...ALL_VARIANTS.filter((v) => !twoImage.includes(v))];
  }

  const ratio = project.cover.width! / project.cover.height!;
  if (ratio <= 0.85) {
    return dedupe(['full-bleed', ...twoImage, 'panoramic']);
  }
  if (ratio >= 1.5) {
    return dedupe(['panoramic', ...twoImage, 'full-bleed']);
  }
  return dedupe([...twoImage, 'full-bleed', 'panoramic']);
}

function dedupe(list: EditorialSpreadVariant[]): EditorialSpreadVariant[] {
  const seen = new Set<EditorialSpreadVariant>();
  const out: EditorialSpreadVariant[] = [];
  for (const v of list) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  // Guarantee every variant is present as a last-resort fallback, in case a
  // future edge case produces a shorter list than 4.
  for (const v of ALL_VARIANTS) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

/** Assigns each project (in page order) the first candidate variant that
 * differs from the immediately preceding project's variant. */
function assignVariants(projects: Project[]): EditorialSpreadVariant[] {
  const variants: EditorialSpreadVariant[] = [];
  let prev: EditorialSpreadVariant | null = null;
  for (const project of projects) {
    const candidates = candidateVariants(project);
    const chosen = candidates.find((v) => v !== prev) ?? candidates[0];
    variants.push(chosen);
    prev = chosen;
  }
  return variants;
}

/** Picks the secondary image for a two-image variant: the first gallery
 * image whose orientation (portrait/landscape, from its own real measured
 * dimensions) CONTRASTS with the cover's -- a wide establishing cover paired
 * with a tall detail shot (or vice versa) reads as a deliberate editorial
 * pairing rather than two near-identical crops side by side. Falls back to
 * the first usable gallery image if no contrasting orientation is
 * available. */
function pickSecondary(project: Project): ProjectMedia | null {
  const usable = project.gallery.filter((m) => toSpreadMedia(m) !== null);
  if (usable.length === 0) return null;
  const coverOrientation = orientation(project.cover);
  const contrasting = usable.find((m) => {
    const o = orientation(m);
    return o !== 'unknown' && o !== coverOrientation;
  });
  return contrasting ?? usable[0];
}

/** Builds the full render-ready spread list for a set of real projects, in
 * the order given -- the single source of truth both `SelectedWork.tsx`
 * (Home) and `TrabajosFilter.tsx` (/trabajos) wire into `EditorialSpread`. */
export function buildProjectSpreads(projects: Project[]): ProjectSpread[] {
  const variants = assignVariants(projects);
  return projects.map((project, i) => {
    const variant = variants[i];
    const primary = toSpreadMedia(project.cover);
    if (!primary) {
      throw new Error(
        `Project "${project.slug}" has no measured cover width/height -- cannot render EditorialSpread without guessing real asset dimensions.`
      );
    }
    if (variant === 'overlap-pair' || variant === 'diptych') {
      const secondaryMedia = pickSecondary(project);
      const secondary = secondaryMedia ? toSpreadMedia(secondaryMedia) : null;
      if (secondary) {
        return { project, variant, images: [primary, secondary] };
      }
      // candidateVariants() only offers a two-image variant when a usable
      // secondary exists, so this is unreachable for real content -- but
      // fail safe rather than crash if that invariant is ever violated.
      return { project, variant: 'full-bleed', images: [primary] };
    }
    return { project, variant, images: [primary] };
  });
}
