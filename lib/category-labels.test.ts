import { describe, it, expect } from 'vitest';
import { CATEGORY_LABELS } from './category-labels';
import { projects } from '@/content/projects';

describe('CATEGORY_LABELS', () => {
  it('has a label for every category actually used by a seed project', () => {
    for (const project of projects) {
      expect(CATEGORY_LABELS[project.category]).toBeTruthy();
    }
  });
});
