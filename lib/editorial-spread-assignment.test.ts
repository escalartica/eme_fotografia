import { describe, it, expect } from 'vitest';
import { projects } from '@/content/projects';
import { buildProjectSpreads } from './editorial-spread-assignment';

const ALL_VARIANTS = ['full-bleed', 'panoramic', 'overlap-pair', 'diptych'];

describe('buildProjectSpreads', () => {
  const spreads = buildProjectSpreads(projects);

  it('produces one spread per real project, in the same order', () => {
    expect(spreads).toHaveLength(projects.length);
    spreads.forEach((s, i) => expect(s.project.slug).toBe(projects[i].slug));
  });

  it('assigns every project a valid variant', () => {
    for (const s of spreads) {
      expect(ALL_VARIANTS).toContain(s.variant);
    }
  });

  it('never repeats the same variant on two consecutive real projects', () => {
    for (let i = 1; i < spreads.length; i++) {
      expect(spreads[i].variant).not.toBe(spreads[i - 1].variant);
    }
  });

  it('gives full-bleed and panoramic exactly one real image with real measured dimensions', () => {
    for (const s of spreads) {
      if (s.variant === 'full-bleed' || s.variant === 'panoramic') {
        expect(s.images).toHaveLength(1);
      } else {
        expect(s.images).toHaveLength(2);
      }
      for (const img of s.images) {
        expect(img.width).toBeGreaterThan(0);
        expect(img.height).toBeGreaterThan(0);
      }
    }
  });

  it('uses the project cover as the primary image for every variant', () => {
    for (const s of spreads) {
      expect(s.images[0].src).toBe(s.project.cover.src);
    }
  });

  it('routes the video project (boda-real-01) through its own cover media, not a still substitute', () => {
    const videoSpread = spreads.find((s) => s.project.slug === 'boda-real-01');
    expect(videoSpread).toBeDefined();
    expect(videoSpread!.images[0].type).toBe('video');
    expect(videoSpread!.images[0].src).toBe('/videos/previews/real-boda-01-preview.mp4');
  });

  it('picks a secondary image from the gallery, with different src from the primary, for two-image variants', () => {
    for (const s of spreads) {
      if (s.images.length === 2) {
        expect(s.images[1].src).not.toBe(s.images[0].src);
        const gallerySrcs = s.project.gallery.map((m) => m.src);
        expect(gallerySrcs).toContain(s.images[1].src);
      }
    }
  });
});
