import { describe, it, expect } from 'vitest';
import { useProjectFilter } from './useProjectFilter';
import { toProjectFilterValue } from '@/lib/project-filter';
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
    expect(result.current.filtered.every((p) => p.category === 'video')).toBe(true);
    expect(result.current.filtered.length).toBeGreaterThan(0);
  });

  it('accepts an initial category (deep link from /servicios)', () => {
    const { result } = renderHook(() => useProjectFilter(projects, 'boda'));
    expect(result.current.category).toBe('boda');
    expect(result.current.filtered.every((p) => p.category === 'boda')).toBe(true);
  });

  it('narrows arbitrary query strings to a valid filter value', () => {
    expect(toProjectFilterValue('video')).toBe('video');
    expect(toProjectFilterValue('360')).toBe('todos');
    expect(toProjectFilterValue('nope')).toBe('todos');
    expect(toProjectFilterValue(undefined)).toBe('todos');
  });
});
