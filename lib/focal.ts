import type { CSSProperties } from 'react';
import type { ProjectMedia } from '@/content/types';
import { measuredFocus } from '@/content/focus-points';

/**
 * Where the subject sits in a photograph, as a CSS `object-position`.
 *
 * Every frame on this site is rendered with `object-fit: cover` inside a
 * box whose shape is decided by the layout, not by the photograph. When
 * the two shapes disagree, the browser throws away part of the picture --
 * and with the default `50% 50%` it throws it away from the top and the
 * bottom equally, which on a wedding photograph means the heads. The
 * `focus` field on each media entry is the measured centre of the people
 * in that specific frame (see scripts/measure-focus.py), so the crop is
 * taken from the empty half instead.
 *
 * IMPORTANT: `object-position` only has an effect on the axis that is
 * actually being cropped. A 3:2 photo in a 3:4 box is cropped left/right and
 * its vertical position is fixed no matter what is set here -- which is
 * why the fix for the project covers is the box shape below, not a focal
 * point.
 */
export function focusStyle(media: { src?: string; focus?: string } | undefined): CSSProperties | undefined {
  const value = resolveFocus(media);
  return value ? { objectPosition: value } : undefined;
}

/**
 * A hand-written `focus` on the entry wins; otherwise the measured table.
 * Returns undefined when neither knows, and the browser's 50% 50% applies.
 */
export function resolveFocus(media: { src?: string; focus?: string } | undefined): string | undefined {
  if (!media) return undefined;
  if (media.focus) return media.focus;
  return media.src ? measuredFocus[media.src] : undefined;
}

/** Same, for a plain src/focus pair rather than a media object. */
export function focusOf(src: string | undefined, focus?: string): CSSProperties | undefined {
  const value = focus ?? (src ? measuredFocus[src] : undefined);
  return value ? { objectPosition: value } : undefined;
}

/** Tallest a cover hero is allowed to get, as a share of the viewport. */
const COVER_MAX_VH = 76;

/**
 * Sizes a cover-hero box to the photograph's own aspect ratio, so nothing
 * is cropped at all, and caps how tall it can grow.
 *
 * `--cover-max-w` is `76svh x ratio`: the width at which the height would
 * hit the cap. Paired with `width: min(100%, var(--cover-max-w))` in the
 * CSS module this keeps the ratio exact at every viewport -- a plain
 * `max-height` would leave the width at 100% and start cropping again,
 * which is the bug this replaces.
 *
 * Returns `undefined` when the media has not been measured, and the CSS
 * module's own fallback ratio applies.
 */
export function coverBoxStyle(media: ProjectMedia): CSSProperties | undefined {
  if (!media.width || !media.height) return undefined;
  const ratio = media.width / media.height;
  // The cap exists for portraits, which at full page width would be two
  // screens tall. A landscape frame is already short at 100% width, so
  // capping it there only shrinks the opening shot for no reason -- and on
  // a wide, short screen it shrank it to well under the width of the
  // gallery beneath, which read as a mistake.
  const needsCap = ratio < 1.2;
  return {
    ['--cover-ar' as string]: `${media.width} / ${media.height}`,
    ...(needsCap
      ? { ['--cover-max-w' as string]: `calc(${COVER_MAX_VH}svh * ${ratio.toFixed(4)})` }
      : {}),
  } as CSSProperties;
}
