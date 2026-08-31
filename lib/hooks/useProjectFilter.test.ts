import { describe, it, expect } from 'vitest';
import { useProjectFilter } from './useProjectFilter';
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
});
