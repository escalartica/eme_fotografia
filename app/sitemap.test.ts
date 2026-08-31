import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { projects } from '@/content/projects';

describe('sitemap', () => {
  it('includes every static route and every project detail route', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    for (const path of ['/', '/trabajos', '/servicios', '/sobre-nosotros', '/contacto']) {
      expect(urls.some((u) => u.endsWith(path))).toBe(true);
    }
    for (const project of projects) {
      expect(urls.some((u) => u.endsWith(`/trabajos/${project.slug}`))).toBe(true);
    }
  });
});
