import { describe, it, expect } from 'vitest';
import { relatedMap, pickRelated } from './related';
import { projects } from '@/content/projects';
import type { Project } from '@/content/types';

const map = relatedMap(projects);

function incoming(): Map<string, number> {
  const count = new Map<string, number>(projects.map((p) => [p.slug, 0]));
  for (const picks of map.values()) {
    for (const p of picks) count.set(p.slug, (count.get(p.slug) ?? 0) + 1);
  }
  return count;
}

describe('relatedMap', () => {
  it('gives every reportaje exactly three related, and never itself', () => {
    expect(map.size).toBe(projects.length);
    for (const project of projects) {
      const picks = map.get(project.slug)!;
      expect(picks).toHaveLength(3);
      expect(picks.some((p) => p.slug === project.slug)).toBe(false);
      expect(new Set(picks.map((p) => p.slug)).size).toBe(3);
    }
  });

  it('leaves no reportaje without incoming contextual links', () => {
    // Esta es la invariante que no existía y por la que doce reportajes se
    // quedaban fuera del enlazado interno. Si alguien vuelve a elegir ficha
    // por ficha sin mirar el conjunto, este test cae.
    const orphans = [...incoming()].filter(([, n]) => n === 0).map(([slug]) => slug);
    expect(orphans).toEqual([]);
  });

  it('spreads the links instead of piling them on a handful of pages', () => {
    const counts = [...incoming().values()];
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...counts)).toBeLessThanOrEqual(4);
    // 29 fichas x 3 enlaces, todos repartidos.
    expect(counts.reduce((a, b) => a + b, 0)).toBe(projects.length * 3);
  });

  it('still prefers weddings in the same place', () => {
    // El reparto cuesta relevancia, pero poca: la penalización por uso está
    // calibrada para que la localización siga decidiendo en la gran mayoría.
    const sameLocation = projects.filter(
      (p) => map.get(p.slug)!.every((r) => r.location === p.location),
    );
    expect(sameLocation.length).toBeGreaterThanOrEqual(20);
  });

  it('is deterministic: the same list always yields the same map', () => {
    const again = relatedMap(projects);
    for (const project of projects) {
      expect(again.get(project.slug)!.map((p) => p.slug)).toEqual(
        map.get(project.slug)!.map((p) => p.slug),
      );
    }
  });

  it('pickRelated reads the shared map, so a page sees the balanced result', () => {
    for (const project of projects) {
      expect(pickRelated(project, projects).map((p) => p.slug)).toEqual(
        map.get(project.slug)!.map((p) => p.slug),
      );
    }
  });

  it('copes with a list too short to fill three slots', () => {
    const two: Project[] = projects.slice(0, 2);
    expect(relatedMap(two).get(two[0].slug)).toHaveLength(1);
  });
});
