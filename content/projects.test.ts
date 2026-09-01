import { describe, it, expect } from 'vitest';
import { projects } from './projects';
import { services } from './services';

describe('projects content', () => {
  it('has exactly 8 seed projects with unique slugs', () => {
    expect(projects).toHaveLength(8);
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('flags every seed media item as placeholder, except real media explicitly marked otherwise', () => {
    // 'boda-real-01', 'raquel-y-fran', and 'andrea-y-jesus' all carry
    // genuine client photos/footage (provided 2026-08-31 and 2026-09-01,
    // organized by the client into per-couple folders) — every other seed
    // project is still stock/placeholder content.
    const realSlugs = ['boda-real-01', 'raquel-y-fran', 'andrea-y-jesus', 'andrea-y-enrique', 'marta-y-alvaro', 'maria-y-francisco-manuel', 'rocio-y-juanje'];
    for (const project of projects) {
      const expectPlaceholder = !realSlugs.includes(project.slug);
      expect(project.cover.isPlaceholderMedia).toBe(expectPlaceholder);
      for (const media of project.gallery) {
        expect(media.isPlaceholderMedia).toBe(expectPlaceholder);
        if (media.type === 'video') {
          expect(media.poster).toBeTruthy();
        }
      }
    }
  });

  it('includes at least one video-led project', () => {
    expect(projects.some((p) => p.category === 'video')).toBe(true);
  });
});

describe('services content', () => {
  it('covers all four real EME services', () => {
    const slugs = services.map((s) => s.slug).sort();
    expect(slugs).toEqual(['360', 'boda', 'fotomaton', 'video']);
  });
});
