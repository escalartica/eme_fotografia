import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './EditorialSpread.module.css';

export interface EditorialSpreadImage {
  src: string;
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
  images: EditorialSpreadImage[];
  title: string;
  /** e.g. "01", "02" — rendered via the `.chapterNumber` ghost-numeral utility. */
  chapterNumber: string;
  href: string;
  /** Optional className applied to the outer ScrollReveal wrapper, for a caller's own grid/list layout (spacing, column placement, etc). */
  className?: string;
  /** Optional stagger delay in seconds, forwarded to ScrollReveal — see ScrollReveal's own doc comment. */
  delay?: number;
}

export function EditorialSpread({
  variant,
  images,
  title,
  chapterNumber,
  href,
  className,
  delay,
}: EditorialSpreadProps) {
  const primary = images[0];
  const secondary = images[1];

  return (
    <ScrollReveal className={className} delay={delay}>
      <Link
        href={href}
        aria-label={`Ver proyecto ${title}`}
        data-cursor="ver"
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
    </ScrollReveal>
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
  image: EditorialSpreadImage;
  title: string;
  chapterNumber: string;
}) {
  return (
    <div className={styles.fullBleedOuter}>
      <div className={styles.fullBleedImageWrap}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 700px) 90vw, 50vw"
          className={styles.fullBleedImage}
        />
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
  image: EditorialSpreadImage;
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
            three variants never crop. */}
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="100vw"
          className={styles.panoramicImage}
        />
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
  primary: EditorialSpreadImage;
  secondary: EditorialSpreadImage;
  title: string;
  chapterNumber: string;
}) {
  return (
    <div className={styles.overlapOuter}>
      <div className={styles.overlapStage}>
        <div className={styles.overlapPrimary}>
          <Image
            src={primary.src}
            alt={primary.alt}
            width={primary.width}
            height={primary.height}
            sizes="(max-width: 700px) 80vw, 55vw"
            className={styles.overlapPrimaryImage}
          />
        </div>
        <div className={styles.overlapSecondary}>
          <Image
            src={secondary.src}
            alt={secondary.alt}
            width={secondary.width}
            height={secondary.height}
            sizes="(max-width: 700px) 55vw, 32vw"
            className={styles.overlapSecondaryImage}
          />
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
  primary: EditorialSpreadImage;
  secondary: EditorialSpreadImage;
  title: string;
  chapterNumber: string;
}) {
  return (
    <div className={styles.diptychOuter}>
      <div className={styles.diptychMain}>
        <Image
          src={primary.src}
          alt={primary.alt}
          width={primary.width}
          height={primary.height}
          sizes="(max-width: 700px) 60vw, 58vw"
          className={styles.diptychImage}
        />
      </div>
      <div className={styles.diptychSecondary}>
        <Image
          src={secondary.src}
          alt={secondary.alt}
          width={secondary.width}
          height={secondary.height}
          sizes="(max-width: 700px) 40vw, 36vw"
          className={styles.diptychImage}
        />
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
