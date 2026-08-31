import { describe, it, expect } from 'vitest';
import { projects } from './projects';
import { services } from './services';

describe('projects content', () => {
  it('has exactly 4 seed projects with unique slugs', () => {
    expect(projects).toHaveLength(4);
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('flags every seed media item as placeholder', () => {
    for (const project of projects) {
      expect(project.cover.isPlaceholderMedia).toBe(true);
      for (const media of project.gallery) {
        expect(media.isPlaceholderMedia).toBe(true);
        if (media.type === 'video') expect(media.poster).toBeTruthy();
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
