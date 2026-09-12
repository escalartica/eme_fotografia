import { describe, it, expect } from 'vitest';
import { useProjectFilter } from './useProjectFilter';
import { perteneceA, toProjectFilterValue } from '@/lib/project-filter';
import { renderHook, act } from '@testing-library/react';
import { projects } from '@/content/projects';

describe('useProjectFilter', () => {
  it('defaults to showing all projects', () => {
    const { result } = renderHook(() => useProjectFilter(projects));
    expect(result.current.filtered).toHaveLength(projects.length);
  });

  it('filters by category', () => {
    const { result } = renderHook(() => useProjectFilter(projects));
    act(() => result.current.setCategory('video'));
    expect(result.current.filtered.every((p) => perteneceA(p, 'video'))).toBe(true);
    expect(result.current.filtered.length).toBeGreaterThan(0);
  });

  it('accepts an initial category (deep link from /servicios)', () => {
    const { result } = renderHook(() => useProjectFilter(projects, 'boda'));
    expect(result.current.category).toBe('boda');
    expect(result.current.filtered.every((p) => perteneceA(p, 'boda'))).toBe(true);
  });

  // Un reportaje entregado en las dos cosas sale en las DOS pestañas. Sin
  // esto, la única forma de tener a Virginia y Jorge en su sitio era mentir
  // en la etiqueta o esconderla de una de las dos listas.
  it('shows a project delivered as both photo and film under either tab', () => {
    const doble = projects.find((p) => p.alsoIn && p.alsoIn.length > 0);
    expect(doble, 'ningún reportaje declara alsoIn').toBeDefined();
    for (const cat of [doble!.category, ...doble!.alsoIn!]) {
      const { result } = renderHook(() => useProjectFilter(projects, cat));
      expect(result.current.filtered.map((p) => p.slug)).toContain(doble!.slug);
    }
  });

  it('narrows arbitrary query strings to a valid filter value', () => {
    expect(toProjectFilterValue('video')).toBe('video');
    expect(toProjectFilterValue('360')).toBe('todos');
    expect(toProjectFilterValue('nope')).toBe('todos');
    expect(toProjectFilterValue(undefined)).toBe('todos');
  });
});
