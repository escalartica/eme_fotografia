import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Testimonios } from './Testimonios';
import { testimonials } from '@/content/testimonials';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

describe('Testimonios', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it('renders the section heading', () => {
    render(<Testimonios />);
    expect(screen.getByRole('heading', { name: /lo que dicen de nosotros/i })).toBeInTheDocument();
  });

  it('keeps all 4 real testimonials reachable in the DOM, not silently dropped to 1', () => {
    render(<Testimonios />);
    for (const t of testimonials) {
      expect(screen.getByText(t.quote)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${t.author} — ${t.role}`))).toBeInTheDocument();
    }
  });

  it('marks exactly one testimonial as the current one via aria-current, the rest visually hidden but not aria-hidden', () => {
    render(<Testimonios />);
    const current = testimonials.filter((t) =>
      screen.getByText(t.quote).closest('blockquote')?.getAttribute('aria-current') === 'true'
    );
    expect(current).toHaveLength(1);
    for (const t of testimonials) {
      const bq = screen.getByText(t.quote).closest('blockquote');
      expect(bq).not.toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders real typographic quote glyphs as separate decorative graphic elements, not inline characters glued to the quote text', () => {
    render(<Testimonios />);
    const activeText = screen.getByText(testimonials[0].quote);
    // The quote paragraph's own text must not start/end with a literal quote
    // character -- the glyph is a sibling decorative element, not part of
    // this string.
    expect(activeText.textContent?.trim().startsWith('"')).toBe(false);
    expect(activeText.textContent?.trim().startsWith('“')).toBe(false);
  });

  it('auto-advances to the next testimonial over time when motion is not reduced', () => {
    vi.useFakeTimers();
    render(<Testimonios />);
    expect(screen.getByText(testimonials[0].quote).closest('blockquote')).toHaveAttribute('aria-current', 'true');
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.getByText(testimonials[1].quote).closest('blockquote')).toHaveAttribute('aria-current', 'true');
  });

  it('does NOT auto-advance under prefers-reduced-motion, even after a long time', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    vi.useFakeTimers();
    render(<Testimonios />);
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(screen.getByText(testimonials[0].quote).closest('blockquote')).toHaveAttribute('aria-current', 'true');
  });

  it('provides manual next/prev controls with clear accessible names that are keyboard operable', async () => {
    const user = userEvent.setup();
    render(<Testimonios />);
    const next = screen.getByRole('button', { name: /siguiente/i });
    await user.tab();
    // Tab through to the next-control and activate it with the keyboard.
    next.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(testimonials[1].quote).closest('blockquote')).toHaveAttribute('aria-current', 'true');

    const prev = screen.getByRole('button', { name: /anterior/i });
    prev.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(testimonials[0].quote).closest('blockquote')).toHaveAttribute('aria-current', 'true');
  });

  it('manual controls still work under prefers-reduced-motion (manual-only cycling, never auto)', async () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const user = userEvent.setup();
    render(<Testimonios />);
    const next = screen.getByRole('button', { name: /siguiente/i });
    await user.click(next);
    expect(screen.getByText(testimonials[1].quote).closest('blockquote')).toHaveAttribute('aria-current', 'true');
  });

  it('stops auto-advancing once paused (WCAG 2.2.2) and resumes on a second click', () => {
    vi.useFakeTimers();
    render(<Testimonios />);
    fireEvent.click(screen.getByRole('button', { name: /pausar testimonios/i }));
    const resumeButton = screen.getByRole('button', { name: /reanudar testimonios/i });
    expect(resumeButton).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    // Still on the first testimonial after 30s paused -- prev/next merely
    // restarting the timer would not catch a regression here.
    expect(screen.getByText(testimonials[0].quote).closest('blockquote')).toHaveAttribute('aria-current', 'true');

    fireEvent.click(resumeButton);
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.getByText(testimonials[1].quote).closest('blockquote')).toHaveAttribute('aria-current', 'true');
  });

  it('has no pause control under prefers-reduced-motion (nothing to pause)', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<Testimonios />);
    expect(screen.queryByRole('button', { name: /pausar testimonios/i })).not.toBeInTheDocument();
  });
});
