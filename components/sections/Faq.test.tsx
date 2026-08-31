import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Faq } from './Faq';
import { faqs } from '@/content/faq';

describe('Faq', () => {
  it('renders every question as a collapsed disclosure, answer hidden until expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<Faq />);

    // Verify all questions are rendered
    for (const f of faqs) {
      expect(screen.getByText(f.question)).toBeInTheDocument();
    }

    // Verify the first details element is closed initially
    const firstDetails = container.querySelector('details');
    expect(firstDetails).not.toHaveAttribute('open');

    // Click the first question to expand it
    const firstSummary = screen.getByText(faqs[0].question);
    await user.click(firstSummary);

    // Verify the details element is now open
    expect(firstDetails).toHaveAttribute('open');
    expect(screen.getByText(faqs[0].answer)).toBeInTheDocument();
  });
});
