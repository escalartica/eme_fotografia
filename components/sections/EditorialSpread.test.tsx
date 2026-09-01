import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditorialSpread } from './EditorialSpread';

const portrait = { src: '/images/portrait.jpg', alt: 'Retrato de novia', width: 1200, height: 1800 };
const landscape = { src: '/images/landscape.jpg', alt: 'Vista panorámica de la finca', width: 2400, height: 1350 };
const detail = { src: '/images/detail.jpg', alt: 'Detalle de las alianzas', width: 1000, height: 1500 };

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
