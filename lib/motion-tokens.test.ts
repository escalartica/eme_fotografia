import { describe, it, expect } from 'vitest';
import { motion } from './motion-tokens';

describe('motion tokens', () => {
  it('keeps the intro under the fast-start requirement (<=1.5s)', () => {
    expect(motion.duration.intro).toBeLessThanOrEqual(1.5);
  });
});
