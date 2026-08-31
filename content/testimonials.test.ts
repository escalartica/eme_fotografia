import { describe, it, expect } from 'vitest';
import { testimonials } from './testimonials';

describe('testimonials content', () => {
  it('has exactly 4 real seed testimonials, none flagged as placeholder', () => {
    expect(testimonials).toHaveLength(4);
    for (const t of testimonials) {
      expect(t.isPlaceholder).toBe(false);
      expect(t.quote).toBeTruthy();
      expect(t.author).toBeTruthy();
      expect(t.role).toBeTruthy();
    }
  });

  it('every entry with a photo path has a corresponding placeholder-prefixed filename', () => {
    for (const t of testimonials) {
      if (t.photo) expect(t.photo).toMatch(/\/placeholder-/);
    }
  });
});
