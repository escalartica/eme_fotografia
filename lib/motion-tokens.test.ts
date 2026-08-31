import { describe, it, expect } from 'vitest';
import { motion } from './motion-tokens';
import { breakpoints } from './breakpoints';

describe('motion tokens', () => {
  it('keeps the intro under the fast-start requirement (<=1.5s)', () => {
    expect(motion.duration.intro).toBeLessThanOrEqual(1.5);
  });
  it('orders breakpoints ascending', () => {
    const values = Object.values(breakpoints);
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });
});
