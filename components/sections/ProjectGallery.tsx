'use client';
import { useState } from 'react';
import Image from 'next/image';
import { VideoPreview } from '@/components/motion/VideoPreview';
import { Lightbox } from '@/components/motion/Lightbox';
import type { Project } from '@/content/types';
import styles from './ProjectGallery.module.css';

export function ProjectGallery({ project }: { project: Project }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openMedia = openIndex !== null ? project.gallery[openIndex] : null;

  return (
    <>
      <div>
        {project.gallery.map((media, i) =>
          media.type === 'image' ? (
            <div key={i} className={styles.imageWrap}>
              <Image src={media.src} alt={media.alt} fill sizes="(max-width: 700px) 100vw, 50vw" />
            </div>
          ) : (
            <VideoPreview key={i} media={media} onOpenFull={() => setOpenIndex(i)} />
          )
        )}
      </div>
      <Lightbox isOpen={openMedia?.type === 'video'} onClose={() => setOpenIndex(null)}>
        {openMedia?.type === 'video' && (
          <video src={openMedia.src} controls autoPlay poster={openMedia.poster} aria-label={openMedia.alt} />
        )}
      </Lightbox>
    </>
  );
}
