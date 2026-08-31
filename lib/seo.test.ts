import { describe, it, expect } from 'vitest';
import { buildMetadata } from './seo';

describe('buildMetadata', () => {
  it('builds title, description, canonical, and OG fields', () => {
    const meta = buildMetadata({ title: 'Trabajos', description: 'Portfolio de EME', path: '/trabajos' });
    expect(meta.title).toBe('Trabajos');
    expect(meta.description).toBe('Portfolio de EME');
    expect(meta.alternates?.canonical).toBe('/trabajos');
    expect(meta.openGraph?.title).toBe('Trabajos');
    expect(meta.openGraph?.url).toBe('https://www.emefotografiasevilla.es/trabajos');
  });
});
