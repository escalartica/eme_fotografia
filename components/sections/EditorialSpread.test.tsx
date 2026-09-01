import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditorialSpread } from './EditorialSpread';

const portrait = { type: 'image' as const, src: '/images/portrait.jpg', alt: 'Retrato de novia', width: 1200, height: 1800 };
const landscape = { type: 'image' as const, src: '/images/landscape.jpg', alt: 'Vista panorámica de la finca', width: 2400, height: 1350 };
const detail = { type: 'image' as const, src: '/images/detail.jpg', alt: 'Detalle de las alianzas', width: 1000, height: 1500 };
const video = {
  type: 'video' as const,
  src: '/videos/previews/real-boda-01-full.mp4',
  poster: '/videos/posters/real-boda-01-full.webp',
  alt: 'Vídeo de la boda de Eva y Rafa',
  width: 1600,
  height: 1066,
};

const base = {
  title: 'Raquel y Fran',
  chapterNumber: '01',
  href: '/trabajos/raquel-y-fran',
};

describe('EditorialSpread', () => {
  describe('full-bleed variant', () => {
    it('renders one image with real dimensions, the title, chapter number, single link and cursor attribute', () => {
      render(<EditorialSpread variant="full-bleed" images={[portrait]} {...base} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(portrait.src)));
      expect(images[0]).toHaveAttribute('alt', portrait.alt);
      expect(images[0]).toHaveAttribute('width', String(portrait.width));
      expect(images[0]).toHaveAttribute('height', String(portrait.height));

      expect(screen.getByText(base.title)).toBeInTheDocument();
      expect(screen.getByText(base.chapterNumber)).toBeInTheDocument();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', base.href);
      expect(links[0]).toHaveAttribute('data-cursor', 'ver');
      expect(links[0]).toContainElement(images[0]);
    });
  });

  describe('video media (C1 media-agnostic tile engine)', () => {
    it('renders the poster frame, a visual "Reproducir" cue, and a nested reproducir cursor hint, without adding a second link', () => {
      render(<EditorialSpread variant="full-bleed" images={[video]} {...base} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(video.poster)));
      expect(images[0]).toHaveAttribute('alt', video.alt);

      expect(screen.getByText('Reproducir')).toBeInTheDocument();

      // Still exactly one <Link> (to the project detail page) -- video
      // tiles do NOT get their own lightbox-opening link/button, unlike
      // SelectedWork.tsx's video card; see MediaFrame's doc comment.
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('data-cursor', 'ver');

      // The nested data-cursor="reproducir" wins over the outer Link's
      // data-cursor="ver" when hovering the video tile specifically
      // (closest() picks the nearer match) -- assert it's present on an
      // element between the image and the outer link.
      const reproducirHint = images[0].closest('[data-cursor="reproducir"]');
      expect(reproducirHint).not.toBeNull();
    });
  });

  describe('panoramic variant', () => {
    it('renders one landscape image, the title, chapter number, single link and cursor attribute', () => {
      render(<EditorialSpread variant="panoramic" images={[landscape]} {...base} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('alt', landscape.alt);
      expect(images[0]).toHaveAttribute('width', String(landscape.width));
      expect(images[0]).toHaveAttribute('height', String(landscape.height));

      expect(screen.getByText(base.title)).toBeInTheDocument();
      expect(screen.getByText(base.chapterNumber)).toBeInTheDocument();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', base.href);
      expect(links[0]).toHaveAttribute('data-cursor', 'ver');
    });
  });

  describe('overlap-pair variant', () => {
    it('renders two images with real dimensions, the title, chapter number, single link and cursor attribute', () => {
      render(<EditorialSpread variant="overlap-pair" images={[landscape, detail]} {...base} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('alt', landscape.alt);
      expect(images[0]).toHaveAttribute('width', String(landscape.width));
      expect(images[0]).toHaveAttribute('height', String(landscape.height));
      expect(images[1]).toHaveAttribute('alt', detail.alt);
      expect(images[1]).toHaveAttribute('width', String(detail.width));
      expect(images[1]).toHaveAttribute('height', String(detail.height));

      expect(screen.getByText(base.title)).toBeInTheDocument();
      expect(screen.getByText(base.chapterNumber)).toBeInTheDocument();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', base.href);
      expect(links[0]).toHaveAttribute('data-cursor', 'ver');
      expect(links[0]).toContainElement(images[0]);
      expect(links[0]).toContainElement(images[1]);
    });
  });

  describe('diptych variant', () => {
    it('renders two images at an uneven split with the title, chapter number, single link and cursor attribute', () => {
      render(<EditorialSpread variant="diptych" images={[portrait, detail]} {...base} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('alt', portrait.alt);
      expect(images[0]).toHaveAttribute('width', String(portrait.width));
      expect(images[0]).toHaveAttribute('height', String(portrait.height));
      expect(images[1]).toHaveAttribute('alt', detail.alt);
      expect(images[1]).toHaveAttribute('width', String(detail.width));
      expect(images[1]).toHaveAttribute('height', String(detail.height));

      expect(screen.getByText(base.title)).toBeInTheDocument();
      expect(screen.getByText(base.chapterNumber)).toBeInTheDocument();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', base.href);
      expect(links[0]).toHaveAttribute('data-cursor', 'ver');
    });
  });
});
