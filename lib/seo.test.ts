import { describe, it, expect } from 'vitest';
import { buildMetadata, DEFAULT_OG_IMAGE } from './seo';

describe('buildMetadata', () => {
  it('builds title, description, canonical, and OG fields', () => {
    const meta = buildMetadata({ title: 'Trabajos', description: 'Portfolio de EME', path: '/trabajos' });
    expect(meta.title).toBe('Trabajos');
    expect(meta.description).toBe('Portfolio de EME');
    expect(meta.alternates?.canonical).toBe('/trabajos');
    expect(meta.openGraph?.title).toBe('Trabajos');
    expect(meta.openGraph?.url).toBe('https://www.emefotografiasevilla.es/trabajos');
  });

  it('falls back to the site-wide default social share image when a page has no real photo of its own', () => {
    const meta = buildMetadata({ title: 'Servicios', description: 'x', path: '/servicios' });
    expect(meta.openGraph?.images).toEqual([{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }]);
  });

  it("uses a project's own real cover photo instead of the default when one is passed", () => {
    const meta = buildMetadata({ title: 'Raquel y Fran', description: 'x', path: '/trabajos/raquel-y-fran', image: '/images/trabajos/raquel-y-fran/cover.webp' });
    expect(meta.openGraph?.images).toEqual([{ url: '/images/trabajos/raquel-y-fran/cover.webp', width: 1200, height: 630 }]);
  });
});
