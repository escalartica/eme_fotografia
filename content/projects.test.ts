import { describe, it, expect } from 'vitest';
import { projects } from './projects';
import { services } from './services';

describe('projects content', () => {
  it('has exactly 29 projects with unique slugs', () => {
    // A tripwire, not a description: the number is here so that losing a
    // wedding to a bad edit fails loudly instead of silently. It was left
    // at 17 while the catalogue grew to 29, so it had been failing for a
    // while and telling nobody anything. Update it deliberately when a
    // real project is added or removed.
    expect(projects).toHaveLength(29);
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('flags every seed media item as placeholder, except real media explicitly marked otherwise', () => {
    // 'boda-real-01', 'raquel-y-fran', and 'andrea-y-jesus' all carry
    // genuine client photos/footage (provided 2026-08-31 and 2026-09-01,
    // organized by the client into per-couple folders) — every other seed
    // project is still stock/placeholder content.
    const realSlugs = [
      'boda-real-01', 'raquel-y-fran', 'andrea-y-jesus', 'andrea-y-enrique', 'marta-y-alvaro', 'maria-y-francisco-manuel', 'rocio-y-juanje',
      'basilica-y-vestido-rojo', 'virginia-y-jorge',
      // 2026-09-07: weddings rebuilt from the studio's "BODAS DEFINITIVAS" folder (named couples).
      'carmen-y-alberto', 'gloria-y-andres', 'angelica-y-jesus', 'miriam-y-alejandro', 'boda-de-junio-con-un-mustang-rojo', 'carmen-y-enrique',
      'reyes-y-francisco', 'dos-novios-en-una-hacienda-sevillana', 'rocio-y-manuel', 'silvia-y-david', 'silvia-y-jordi', 'kuki-y-jose', 'maria-y-alberto',
      'eva-y-jose', 'soledad-y-alejandro',
      // preboda / postboda sessions from EOS_DIGITAL
      'postboda-en-el-real-alcazar', 'preboda-en-un-pueblo-de-la-sierra', 'postboda-entre-casas-blancas', 'preboda-en-la-playa', 'preboda-en-santa-cruz',
    ];
    for (const project of projects) {
      const isReal = realSlugs.includes(project.slug);
      if (isReal) {
        expect(project.cover.isPlaceholderMedia).toBe(false);
        for (const media of project.gallery) expect(media.isPlaceholderMedia).toBe(false);
      } else {
        // No seed project is stock-only any more; any future placeholder
        // entry must still declare itself as such on its cover.
        expect(project.cover.isPlaceholderMedia).toBe(true);
      }
      for (const media of project.gallery) {
        if (media.type === 'video') expect(media.poster).toBeTruthy();
      }
    }
  });

  it('includes at least one video-led project', () => {
    expect(projects.some((p) => p.category === 'video')).toBe(true);
  });
});

describe('services content', () => {
  it('covers the two EME services: photo and video', () => {
    const slugs = services.map((s) => s.slug).sort();
    expect(slugs).toEqual(['boda', 'video']);
  });
});
