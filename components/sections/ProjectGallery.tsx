'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { VideoPreview } from '@/components/motion/VideoPreview';
import { Lightbox } from '@/components/motion/Lightbox';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
import type { Project, ProjectMedia } from '@/content/types';
import styles from './ProjectGallery.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Span = 'full' | 'wide' | 'half';

// Deterministic fallback for gallery items with no curated `span` in
// content/projects.ts (currently all real items -- see ProjectMedia.span's
// doc comment in content/types.ts for why this data file doesn't invent
// per-photo curatorial decisions). Cycling through all three values by
// index still produces genuine visual variety rather than one rigid width.
const SPAN_PATTERN: Span[] = ['full', 'wide', 'half'];

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
        <div className={styles.coverWrap}>
          <VideoPreview media={project.cover} onOpenFull={() => setOpenMedia(project.cover)} />
        </div>
      )}
      {/* Continuous, full-bleed editorial photo-essay flow (A3 pattern,
          docs/PATRONES-AWWWARDS.md): one column, real/near-real aspect
          ratios, alternating full/wide/half widths -- not a uniform
          thumbnail grid. */}
      <div className={styles.flow}>
        {project.gallery.map((media, i) => (
          <GalleryFlowItem
            key={i}
            media={media}
            span={media.span ?? SPAN_PATTERN[i % SPAN_PATTERN.length]}
            priority={priorityFlags[i]}
            onOpenMedia={setOpenMedia}
          />
        ))}
      </div>
      <Lightbox isOpen={openMedia !== null} onClose={() => setOpenMedia(null)}>
        {openMedia?.type === 'video' && (
          <video src={openMedia.src} controls autoPlay poster={openMedia.poster} aria-label={openMedia.alt} />
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

function GalleryFlowItem({
  media,
  span,
  priority,
  onOpenMedia,
}: {
  media: ProjectMedia;
  span: Span;
  priority: boolean;
  onOpenMedia: (media: ProjectMedia) => void;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !itemRef.current) return;
    const ctx = gsap.context(() => {
      // Entrance reveal: opacity-only, on itemRef -- the SAME element used
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
      gsap.set(itemRef.current, { opacity: 0 });
      gsap.to(itemRef.current, {
        opacity: 1,
        duration: motion.duration.slow,
        ease: motion.ease.standard,
        scrollTrigger: { trigger: itemRef.current, start: 'top 90%' },
      });

      if (parallaxRef.current) {
        // Light per-image parallax: transform-only (`yPercent`), scrubbed
        // directly to scroll position (no easing lag) rather than timed.
        gsap.fromTo(
          parallaxRef.current,
          { yPercent: -8 },
          {
            yPercent: 8,
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
  }, [reducedMotion]);

  // Real intrinsic aspect ratio when this media item has been measured
  // (content/types.ts's ProjectMedia.width/height doc comment -- currently
  // only boda-real-01's videos), overriding the span's own CSS default via
  // higher-specificity inline style. Most real photos in this project
  // haven't been measured yet, so they fall back to the span's default
  // ratio -- same "reserve a box, don't guess exact numbers" convention
  // VideoPreview already uses for its own `--ar` custom property.
  const ratioStyle = media.width && media.height ? { aspectRatio: `${media.width} / ${media.height}` } : undefined;

  return (
    <div ref={itemRef} className={`${styles.item} ${SPAN_CLASS[span]}`} style={ratioStyle} data-span={span}>
      <div ref={parallaxRef} className={styles.parallaxInner}>
        {media.type === 'image' ? (
          <button
            type="button"
            className={styles.imageButton}
            onClick={() => onOpenMedia(media)}
            aria-label={`Ver ${media.alt} en tamaño completo`}
            data-cursor="ver"
          >
            <Image src={media.src} alt={media.alt} fill sizes={SPAN_SIZES[span]} priority={priority} />
          </button>
        ) : (
          <VideoPreview media={media} onOpenFull={() => onOpenMedia(media)} />
        )}
      </div>
    </div>
  );
}
