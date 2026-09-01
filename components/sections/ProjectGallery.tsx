'use client';
import { useState } from 'react';
import Image from 'next/image';
import { VideoPreview } from '@/components/motion/VideoPreview';
import { Lightbox } from '@/components/motion/Lightbox';
import type { Project, ProjectMedia } from '@/content/types';
import styles from './ProjectGallery.module.css';

// State is keyed on the media object itself (not a gallery index) so the
// same Lightbox can be shared with a video cover block rendered by this
// component (see below) as well as the gallery grid — an index into
// `project.gallery` alone couldn't address the cover.
export function ProjectGallery({ project }: { project: Project }) {
  const [openMedia, setOpenMedia] = useState<ProjectMedia | null>(null);

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
      <div className={styles.grid}>
        {project.gallery.map((media, i) =>
          media.type === 'image' ? (
            <div key={i} className={i === 0 ? `${styles.imageWrap} ${styles.large}` : styles.imageWrap}>
              <Image src={media.src} alt={media.alt} fill sizes="(max-width: 700px) 100vw, 50vw" />
            </div>
          ) : (
            <VideoPreview key={i} media={media} onOpenFull={() => setOpenMedia(media)} />
          )
        )}
      </div>
      <Lightbox isOpen={openMedia?.type === 'video'} onClose={() => setOpenMedia(null)}>
        {openMedia?.type === 'video' && (
          <video src={openMedia.src} controls autoPlay poster={openMedia.poster} aria-label={openMedia.alt} />
        )}
      </Lightbox>
    </>
  );
}
