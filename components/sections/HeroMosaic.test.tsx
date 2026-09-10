import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroMosaic } from './HeroMosaic';
import { resolveMosaicColumns } from '@/content/mosaic';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));
vi.mock('@/lib/hooks/useLenis', () => ({ useLenis: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('HeroMosaic', () => {
  it('renders one linked column per curated wedding, four 3:4 frames each', () => {
    render(<HeroMosaic />);
    const columns = resolveMosaicColumns();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(columns.length);
    columns.forEach((col) => {
      expect(screen.getByRole('link', { name: new RegExp(col.project.title) })).toHaveAttribute('href', `/trabajos/${col.project.slug}`);
      expect(col.tiles).toHaveLength(4);
    });
  });

  it('keeps every frame described for assistive tech', () => {
    render(<HeroMosaic />);
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => expect(img.getAttribute('alt')).toBeTruthy());
  });
});
