'use client';
import { useState } from 'react';
import Image from 'next/image';
import { VideoPreview } from '@/components/motion/VideoPreview';
import { Lightbox } from '@/components/motion/Lightbox';
import type { Project } from '@/content/types';

export function ProjectGallery({ project }: { project: Project }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openMedia = openIndex !== null ? project.gallery[openIndex] : null;

  return (
    <>
      <div>
        {project.gallery.map((media, i) =>
          media.type === 'image' ? (
            <Image key={i} src={media.src} alt={media.alt} width={1600} height={1200} />
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
