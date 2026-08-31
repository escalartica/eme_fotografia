import { describe, it, expect } from 'vitest';
import { projects } from './projects';
import { services } from './services';

describe('projects content', () => {
  it('has exactly 4 seed projects with unique slugs', () => {
    expect(projects).toHaveLength(4);
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('flags every seed media item as placeholder, except real footage explicitly marked otherwise', () => {
    // 'boda-real-01' carries genuine client footage (provided 2026-08-31) —
    // every other seed project is still stock/placeholder content.
    for (const project of projects) {
      const expectPlaceholder = project.slug !== 'boda-real-01';
      expect(project.cover.isPlaceholderMedia).toBe(expectPlaceholder);
      for (const media of project.gallery) {
        if (media.type === 'video') {
          expect(media.isPlaceholderMedia).toBe(expectPlaceholder);
          expect(media.poster).toBeTruthy();
        } else {
          // The gallery's still-placeholder still-image entry, even on the
          // real-footage project, stays flagged until real photos land.
          expect(media.isPlaceholderMedia).toBe(true);
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
