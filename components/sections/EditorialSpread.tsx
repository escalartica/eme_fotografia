import type { MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ScrollParallax } from '@/components/motion/ScrollParallax';
import styles from './EditorialSpread.module.css';

export interface EditorialSpreadMedia {
  /**
   * Matches `ProjectMedia['type']` (content/types.ts) — this component
   * renders photo and video tiles through the same code path (one
   * conditional in `MediaFrame` below), not divergent per-variant
   * branches. Adding a future media kind (360°, fotomatón) is one more
   * case in that single function, not a new component per variant.
   */
  type: 'image' | 'video';
  src: string;
  /** Required for `type: 'video'` — the frame shown in the tile (this
   * component never autoplays inline, see MediaFrame's own doc comment). */
  poster?: string;
  alt: string;
  /** Real intrinsic width in px, from the source file — never guessed. */
  width: number;
  /** Real intrinsic height in px, from the source file — never guessed. */
  height: number;
}

export type EditorialSpreadVariant = 'full-bleed' | 'overlap-pair' | 'panoramic' | 'diptych';

export interface EditorialSpreadProps {
  variant: EditorialSpreadVariant;
  /**
   * `full-bleed` and `panoramic` use `images[0]` only; `overlap-pair` and
   * `diptych` use `images[0]` (the primary/wide image) and `images[1]` (the
   * secondary/detail image). The caller decides which two images from a
   * project's gallery pair well for the two-image variants — this
   * component has no content of its own.
   */
  images: EditorialSpreadMedia[];
  title: string;
  /** e.g. "01", "02" — rendered via the `.chapterNumber` ghost-numeral utility. */
  chapterNumber: string;
  href: string;
  /** Optional className applied to the outer wrapper (ScrollReveal, or a plain div when `reveal={false}`), for a caller's own grid/list layout (spacing, column placement, etc). */
  className?: string;
  /** Optional stagger delay in seconds, forwarded to ScrollReveal — see ScrollReveal's own doc comment. Ignored when `reveal={false}`. */
  delay?: number;
  /**
   * Whether to wrap this spread in its own scroll-triggered `ScrollReveal`
   * entrance (default `true`). Set `false` when the caller already runs its
   * OWN entrance/exit animation over the same list (e.g.
   * `TrabajosFilter.tsx`'s filter-change fade+scale re-flow, keyed off
   * category changes rather than scroll position) — nesting ScrollReveal's
   * own `gsap.set(opacity: 0)`-on-mount inside a parent that's
   * independently animating opacity on the SAME re-mounted subtree is
   * exactly the nested-ScrollReveal conflict this project hit once already
   * (prior plan's Task 7/9): the two systems fight over the same property,
   * producing a visible flash. `reveal={false}` renders a plain div in
   * ScrollReveal's place instead, so the caller's own animation is the only
   * one touching this subtree's opacity.
   */
  reveal?: boolean;
  /** Optional click handler forwarded to the outer `<Link>` — for a caller
   * that intercepts navigation (e.g. `TrabajosFilter.tsx`'s
   * router.push-inside-a-view-transition click handling). */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function EditorialSpread({
  variant,
  images,
  title,
  chapterNumber,
  href,
  className,
  delay,
  reveal = true,
  onClick,
}: EditorialSpreadProps) {
  const primary = images[0];
  const secondary = images[1];

  const link = (
    <Link
      href={href}
      aria-label={`Ver proyecto ${title}`}
      data-cursor="ver"
      onClick={onClick}
      className={`${styles.spread} ${variantClass(variant)}`}
    >
      {variant === 'full-bleed' && primary && (
        <FullBleed image={primary} title={title} chapterNumber={chapterNumber} />
      )}
      {variant === 'panoramic' && primary && (
        <Panoramic image={primary} title={title} chapterNumber={chapterNumber} />
      )}
      {variant === 'overlap-pair' && primary && secondary && (
        <OverlapPair primary={primary} secondary={secondary} title={title} chapterNumber={chapterNumber} />
      )}
      {variant === 'diptych' && primary && secondary && (
        <Diptych primary={primary} secondary={secondary} title={title} chapterNumber={chapterNumber} />
      )}
    </Link>
  );

  if (!reveal) {
    return <div className={className}>{link}</div>;
  }

  return (
    <ScrollReveal className={className} delay={delay} clipReveal>
      {link}
    </ScrollReveal>
  );
}

/**
 * The C1 "media-agnostic tile" engine (docs/PATRONES-AWWWARDS.md, applied
 * as the underlying renderer only — NOT as a uniform tile grid, which
 * would undo this component's whole reason for existing: replacing the
 * uniform card grid the design audit flagged). Every variant below calls
 * this once instead of duplicating an <Image>/<video> conditional four
 * times — adding a future media kind (360°, fotomatón) is one more branch
 * here, not a new component per variant.
 *
 * Video never autoplays inline here: this whole spread is one <Link> to
 * the project detail page (or, for overlap-pair/diptych, one of a pair of
 * images), not a video player — restructuring that to open an in-place
 * lightbox (like SelectedWork.tsx's video card does) would break the
 * single-link invariant every variant is tested against. Instead: show
 * the poster frame with a "Reproducir" visual cue (a nested
 * data-cursor="reproducir" wins over the outer Link's data-cursor="ver"
 * via closest()'s nearest-match behavior) and let the project detail page
 * — already built to handle cover-video playback — do the actual playing
 * once the visitor lands there.
 */
function MediaFrame({
  media,
  className,
  sizes,
}: {
  media: EditorialSpreadMedia;
  className?: string;
  sizes: string;
}) {
  const image = (
    <Image
      src={media.type === 'video' ? (media.poster ?? media.src) : media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      className={className}
    />
  );
  if (media.type !== 'video') return image;
  return (
    <div className={styles.videoFrame} data-cursor="reproducir">
      {image}
      <span className={styles.playLabel} aria-hidden="true">
        Reproducir
      </span>
    </div>
  );
}

function variantClass(variant: EditorialSpreadVariant) {
  switch (variant) {
    case 'full-bleed':
      return styles.fullBleed;
    case 'panoramic':
      return styles.panoramic;
    case 'overlap-pair':
      return styles.overlapPair;
    case 'diptych':
      return styles.diptych;
  }
}

function FullBleed({
  image,
  title,
  chapterNumber,
}: {
  image: EditorialSpreadMedia;
  title: string;
  chapterNumber: string;
}) {
  return (
    <div className={styles.fullBleedOuter}>
      <div className={styles.fullBleedImageWrap}>
        <div className={styles.fullBleedKenBurns}>
          <MediaFrame media={image} sizes="(max-width: 700px) 90vw, 50vw" className={styles.fullBleedImage} />
        </div>
      </div>
      <div className={styles.fullBleedMeta}>
        <span className={styles.chapterNumber} aria-hidden="true">
          {chapterNumber}
        </span>
        <span className={styles.title}>{title}</span>
      </div>
    </div>
  );
}

function Panoramic({
  image,
  title,
  chapterNumber,
}: {
  image: EditorialSpreadMedia;
  title: string;
  chapterNumber: string;
}) {
  return (
    <div className={styles.panoramicOuter}>
      <div className={styles.panoramicImageWrap}>
        {/* Panoramic is the one variant in this system that deliberately
            crops (object-fit: cover, see .module.css) — a wide real photo
            spanning the full viewport width AND held to a short "letterbox"
            height can't hold its exact source ratio in both dimensions at
            once. This is a single, intentional per-variant choice driven by
            an already-wide source image, not the uniform aspect-ratio: 3/2
            forced on every card that the design audit flagged — the other
            three variants never crop. Since it already crops, it's also the
            only variant that gets the new scroll parallax (B4,
            docs/PATRONES-AWWWARDS.md): adding an oversized, scroll-scrubbed
            inner layer to the other three would force them to start
            cropping too, undoing the guarantee above. Skipped for video
            media specifically — ScrollParallax's inner layer is a
            positioned ancestor, and MediaFrame's video-case `.playLabel`
            positions itself absolutely against its nearest positioned
            ancestor; nesting it inside the parallax layer would drag the
            "Reproducir" label along with the background motion instead of
            keeping it fixed. */}
        {image.type === 'video' ? (
          <MediaFrame media={image} sizes="100vw" className={styles.panoramicImage} />
        ) : (
          <ScrollParallax>
            <MediaFrame media={image} sizes="100vw" className={styles.panoramicImage} />
          </ScrollParallax>
        )}
        {/* Explicit scrim element (rather than a ::after pseudo-element on
            panoramicImageWrap) so it paints between the image and the meta
            text in DOM/paint order — a pseudo-element on the wrap would
            always paint last (on top of the meta text too), obscuring it. */}
        <div className={styles.panoramicScrim} aria-hidden="true" />
        <div className={styles.panoramicMeta}>
          <span className={styles.chapterNumberOnPhoto} aria-hidden="true">
            {chapterNumber}
          </span>
          <span className={styles.titleOnPhoto}>{title}</span>
        </div>
      </div>
    </div>
  );
}

function OverlapPair({
  primary,
  secondary,
  title,
  chapterNumber,
}: {
  primary: EditorialSpreadMedia;
  secondary: EditorialSpreadMedia;
  title: string;
  chapterNumber: string;
}) {
  return (
    <div className={styles.overlapOuter}>
      <div className={styles.overlapStage}>
        <div className={styles.overlapPrimary}>
          <div className={styles.pairKenBurns}>
            <MediaFrame media={primary} sizes="(max-width: 700px) 80vw, 55vw" className={styles.overlapPrimaryImage} />
          </div>
        </div>
        <div className={styles.overlapSecondary}>
          <div className={`${styles.pairKenBurns} ${styles.pairKenBurnsSecondary}`}>
            <MediaFrame media={secondary} sizes="(max-width: 700px) 55vw, 32vw" className={styles.overlapSecondaryImage} />
          </div>
        </div>
      </div>
      <div className={styles.overlapMeta}>
        <span className={styles.chapterNumber} aria-hidden="true">
          {chapterNumber}
        </span>
        <span className={styles.title}>{title}</span>
      </div>
    </div>
  );
}

function Diptych({
  primary,
  secondary,
  title,
  chapterNumber,
}: {
  primary: EditorialSpreadMedia;
  secondary: EditorialSpreadMedia;
  title: string;
  chapterNumber: string;
}) {
  return (
    <div className={styles.diptychOuter}>
      <div className={styles.diptychMain}>
        <div className={styles.pairKenBurns}>
          <MediaFrame media={primary} sizes="(max-width: 700px) 60vw, 58vw" className={styles.diptychImage} />
        </div>
      </div>
      <div className={styles.diptychSecondary}>
        <div className={`${styles.pairKenBurns} ${styles.pairKenBurnsSecondary}`}>
          <MediaFrame media={secondary} sizes="(max-width: 700px) 40vw, 36vw" className={styles.diptychImage} />
        </div>
      </div>
      <div className={styles.diptychMeta}>
        <span className={styles.chapterNumber} aria-hidden="true">
          {chapterNumber}
        </span>
        <span className={styles.title}>{title}</span>
      </div>
    </div>
  );
}
