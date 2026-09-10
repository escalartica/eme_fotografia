import { describe, it, expect } from 'vitest';
import { formatRating } from './format';
import { site } from '@/content/site';

describe('formatRating', () => {
  it('keeps the decimal on a whole-number score, which String() silently drops', () => {
    // The regression this helper exists for: String(5.0) === '5'.
    expect(formatRating(5.0)).toBe('5,0');
  });

  it('uses the Spanish decimal separator', () => {
    expect(formatRating(4.8)).toBe('4,8');
    expect(formatRating(4.9)).toBe('4,9');
  });

  // Deliberately NOT asserted: half-way rounding. This test originally
  // expected formatRating(4.85) === '4,9' and failed, and the code was right.
  // 4.85 is stored as 4.8499999999999996447, so toFixed(1) gives "4.8" -- and
  // it is not even consistent, because 4.15 rounds up to 4.2 while 4.35 rounds
  // down to 4.3, purely by which side of the binary representation each value
  // lands on. Asserting on that would pin floating-point accidents rather than
  // behaviour. It does not matter here: Bodas.net publishes one decimal, so a
  // two-decimal rating never reaches this function.

  it("formats the site's own rating the same way everywhere it is shown", () => {
    expect(formatRating(site.bodasNetRating)).toMatch(/^\d,\d$/);
  });
});
