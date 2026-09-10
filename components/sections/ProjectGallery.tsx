'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { VideoPreview } from '@/components/motion/VideoPreview';
import { Lightbox } from '@/components/motion/Lightbox';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { coverBoxStyle, focusStyle } from '@/lib/focal';
import { motion } from '@/lib/motion-tokens';
import type { Project, ProjectMedia } from '@/content/types';
import styles from './ProjectGallery.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Span = 'full' | 'wide' | 'half';

const SPAN_CLASS: Record<Span, string> = {
  full: styles.full,
  wide: styles.wide,
  half: styles.half,
};

const SPAN_SIZES: Record<Span, string> = {
  full: '100vw',
  wide: '(max-width: 700px) 100vw, 70vw',
  half: '(max-width: 700px) 100vw, 46vw',
};

// "First two images" (per the A3 spec) means the first two items of type
// 'image' specifically, not the first two gallery entries by raw index --
// several real projects (e.g. boda-real-01) lead with video items, which
// don't take a next/image `priority` prop at all.
function computeImagePriorityFlags(gallery: ProjectMedia[]): boolean[] {
  let imagesSeen = 0;
  return gallery.map((media) => {
    if (media.type !== 'image') return false;
    imagesSeen += 1;
    return imagesSeen <= 2;
  });
}

// State is keyed on the media object itself (not a gallery index) so the
// same Lightbox can be shared with a video cover block rendered by this
// component (see below) as well as the gallery flow -- an index into
// `project.gallery` alone couldn't address the cover.
export function ProjectGallery({ project }: { project: Project }) {
  const [openMedia, setOpenMedia] = useState<ProjectMedia | null>(null);
  const priorityFlags = computeImagePriorityFlags(project.gallery);

  return (
    <>
      {/* Image covers are static and need no client interactivity, so
          Page.tsx (a Server Component) renders those directly. A video
          cover needs the same gated-autoplay + lightbox-opening behavior
          as gallery video items, so it's rendered here — the one client
          component on this page that already owns that Lightbox state —
          rather than lifted into Page.tsx, which can't hold React state. */}
      {project.cover.type === 'video' && (
        <div className={styles.coverWrap} style={coverBoxStyle(project.cover)}>
          <VideoPreview media={project.cover} onOpenFull={() => setOpenMedia(project.cover)} />
          {project.cover.isPlaceholderMedia && (
            <span className="sourceBadge">
              Vídeo de muestra{project.cover.sourceCredit ? ` — ${project.cover.sourceCredit}` : ''}
            </span>
          )}
        </div>
      )}
      {/* Continuous, full-bleed editorial photo-essay flow (A3 pattern,
          docs/PATRONES-AWWWARDS.md): one column, real/near-real aspect
          ratios, alternating full/wide/half widths -- not a uniform
          thumbnail grid. */}
      <div className={styles.flow}>
        {buildFlow(project.gallery).map((row, r) =>
          row.kind === 'duo' ? (
            <div key={`duo-${r}`} className={styles.duo}>
              {row.items.map(({ media, index }) => (
                <GalleryFlowItem key={index} media={media} span="half" side={index % 2 === 0 ? 'left' : 'right'} priority={priorityFlags[index]} onOpenMedia={setOpenMedia} inDuo />
              ))}
            </div>
          ) : (
            <GalleryFlowItem
              key={row.index}
              media={row.media}
              span={row.span}
              side={row.index % 2 === 0 ? 'left' : 'right'}
              priority={priorityFlags[row.index]}
              onOpenMedia={setOpenMedia}
            />
          )
        )}
      </div>
      <Lightbox isOpen={openMedia !== null} onClose={() => setOpenMedia(null)}>
        {openMedia?.type === 'video' && (
          // Cinema letterbox: a fixed widescreen frame (~2.39:1, true
          // "Cinemascope") in place of the video's own raw ratio. Real
          // wedding footage here is 16:9, narrower than the frame, so
          // object-fit: contain leaves genuine black bars above and below
          // rather than cropping anything -- the same effect as watching a
          // widescreen film, not a CSS trick played on the footage itself.
          // Skipped below 700px (see .lightboxVideoWrap): at phone widths
          // the fixed ratio squeezes the video down to a sliver.
          <div className={styles.lightboxVideoWrap}>
            <video src={openMedia.src} controls autoPlay poster={openMedia.poster} aria-label={openMedia.alt} />
          </div>
        )}
        {openMedia?.type === 'image' && (
          <div className={styles.lightboxImageWrap}>
            <Image src={openMedia.src} alt={openMedia.alt} fill sizes="100vw" />
          </div>
        )}
      </Lightbox>
    </>
  );
}


type FlowRow =
  | { kind: 'single'; media: ProjectMedia; span: Span; index: number }
  | { kind: 'duo'; items: { media: ProjectMedia; index: number }[] };

const isPortrait = (m: ProjectMedia) => Boolean(m.width && m.height && m.height > m.width);

/**
 * Orientation-aware flow. Landscape frames alternate full-bleed and the
 * 70% "wide" letterbox; a portrait never runs full width (a 2:3 frame at
 * 100vw is two screens tall), so two consecutive portraits share one row
 * as a pair of prints and a lone portrait takes the 46% "half" slot.
 * A curated `span` on the media entry always wins.
 */
function buildFlow(gallery: ProjectMedia[]): FlowRow[] {
  const rows: FlowRow[] = [];
  let landscapeCount = 0;
  for (let i = 0; i < gallery.length; i++) {
    const media = gallery[i];
    if (media.span) {
      rows.push({ kind: 'single', media, span: media.span, index: i });
      continue;
    }
    if (media.type === 'image' && isPortrait(media)) {
      const next = gallery[i + 1];
      if (next && next.type === 'image' && isPortrait(next) && !next.span) {
        rows.push({ kind: 'duo', items: [{ media, index: i }, { media: next, index: i + 1 }] });
        i++;
      } else {
        rows.push({ kind: 'single', media, span: 'half', index: i });
      }
      continue;
    }
    rows.push({ kind: 'single', media, span: landscapeCount % 2 === 0 ? 'full' : 'wide', index: i });
    landscapeCount++;
  }
  return rows;
}

function GalleryFlowItem({
  media,
  span,
  side,
  priority,
  onOpenMedia,
  inDuo = false,
}: {
  media: ProjectMedia;
  span: Span;
  /** Rendered inside a two-up row: no side offset, no overlap. */
  inDuo?: boolean;
  // Which viewport edge a narrower (wide/half) item leans toward, and the
  // direction its scroll-drift travels: alternates per item so consecutive
  // frames stagger left/right and overlap the previous one at an angle
  // instead of stacking dead-center (the "superpuestas" layering).
  side: 'left' | 'right';
  priority: boolean;
  onOpenMedia: (media: ProjectMedia) => void;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !itemRef.current) return;
    const ctx = gsap.context(() => {
      // ONE entrance, not two. There used to be an opacity fade at
      // `top 90%` and this clip-path iris at `top 88%` on the same
      // element: two reveals two percent apart, which the eye reads as a
      // single reveal that stutters. The iris is the more distinctive of
      // the two and it already hides the frame until it opens, so the
      // fade was doing nothing the clip was not.
      //
      // Historical note on why it is clip-path and not translate: on itemRef -- the SAME element used
      // below as the ScrollTrigger `trigger` for the parallax tween.
      // Deliberately NOT a translateY reveal here: opacity never changes an
      // element's own layout/bounding rect the way a transform does, so it
      // can't desync the parallax ScrollTrigger's measurement of itemRef
      // (the historical bug class documented on ScrollReveal, where a
      // nested ancestor's own translateY shifted a descendant's measured
      // trigger position mid-animation and got it stuck). The initial state
      // is set via gsap.set, never CSS -- if this JS never runs, itemRef
      // has no default-hidden style and stays fully visible. Mirrors
      // Hero.tsx's heroRef (stable trigger) / imageRef (parallax target)
      // split: one element for measurement, a different one for the
      // scroll-scrubbed transform.
      // Cinematic reveal on the frame itself: the photo is unmasked from a
      // narrower inset (a curtain/iris feel, like a shot fading up on a
      // projector) while the picture inside settles from a slight push-in.
      // clip-path never changes the element's bounding rect either, so the
      // trigger measurement stays stable (same reasoning as the opacity
      // reveal above).
      gsap.fromTo(
        itemRef.current,
        { clipPath: 'inset(10% 6% 10% 6%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: motion.duration.intro,
          ease: motion.ease.standard,
          scrollTrigger: { trigger: itemRef.current, start: 'top 88%' },
        }
      );

      if (parallaxRef.current) {
        // Per-image parallax: a modest vertical travel, a sideways drift
        // whose direction alternates per item (so neighbouring frames slide
        // past each other) and a slow push-in from 1.04 to 1.0. Kept small
        // on purpose -- and starting with the layer shifted DOWN, so the
        // first thing revealed is the top of the photograph (the faces),
        // never a crop that beheads the couple while the frame settles.
        // The travel is covered by .parallaxInner's enlarged inset in the
        // CSS module.
        //
        // The numbers are a head-room budget, not taste: every gallery item
        // sizes its box to the photograph's own aspect ratio, so the image
        // fills .parallaxInner's height exactly and `object-position` has
        // nothing left to give. Whatever the inset plus the travel add up to
        // is a band of the photograph the viewer never sees at the top --
        // 7% + 5% used to be 12%, enough to take the top off a head in the
        // frames where someone stands high. 3% + 2.5% keeps it under 6%,
        // clear of every face measured across the published galleries.
        const drift = side === 'left' ? -2 : 2;
        gsap.fromTo(
          parallaxRef.current,
          { yPercent: 2.5, xPercent: drift, scale: 1.04 },
          {
            yPercent: -2.5,
            xPercent: -drift,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: itemRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    }, itemRef);
    return () => ctx.revert();
  }, [reducedMotion, side]);

  // Real intrinsic aspect ratio when this media item has been measured
  // (content/types.ts's ProjectMedia.width/height doc comment -- currently
  // only boda-real-01's videos), overriding the span's own CSS default via
  // higher-specificity inline style. Most real photos in this project
  // haven't been measured yet, so they fall back to the span's default
  // ratio -- same "reserve a box, don't guess exact numbers" convention
  // VideoPreview already uses for its own `--ar` custom property.
  const ratioStyle = media.width && media.height ? { aspectRatio: `${media.width} / ${media.height}` } : undefined;

  return (
    <div ref={itemRef} className={`${styles.item} ${SPAN_CLASS[span]}`} style={ratioStyle} data-span={span} data-side={side} data-duo={inDuo || undefined}>
      <div ref={parallaxRef} className={styles.parallaxInner}>
        {media.type === 'image' ? (
          <button
            type="button"
            className={styles.imageButton}
            onClick={() => onOpenMedia(media)}
            aria-label={`Ver ${media.alt} en tamaño completo`}
            data-cursor="ver"
          >
            <Image src={media.src} alt={media.alt} fill sizes={SPAN_SIZES[span]} priority={priority} style={focusStyle(media)} />
          </button>
        ) : (
          <VideoPreview media={media} onOpenFull={() => onOpenMedia(media)} />
        )}
      </div>
      {media.isPlaceholderMedia && (
        <span className="sourceBadge">
          {media.type === 'video' ? 'Vídeo de muestra' : 'Imagen de muestra'}
          {media.sourceCredit ? ` — ${media.sourceCredit}` : ''}
        </span>
      )}
    </div>
  );
}
