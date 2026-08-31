import { describe, it, expect } from 'vitest';
import { faqs } from './faq';

describe('faqs', () => {
  it('has at least 5 entries covering the core pre-booking questions', () => {
    expect(faqs.length).toBeGreaterThanOrEqual(5);
    for (const f of faqs) {
      expect(f.question).toBeTruthy();
      expect(f.answer).toBeTruthy();
    }
  });
});
