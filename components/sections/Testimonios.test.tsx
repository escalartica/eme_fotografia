import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Testimonios } from './Testimonios';
import { testimonials } from '@/content/testimonials';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

// The quote marks are real typographic glyphs wrapped around the sentence
// in the component's own template string (`“${quote}”`), not a
// separate decorative element -- so every lookup by quote text has to
// include them.
const quoteText = (i: number) => `“${testimonials[i].quote}”`;
const findBlockquote = (i: number) => screen.getByText(quoteText(i)).closest('blockquote');

describe('Testimonios', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it('renders the section heading', () => {
    render(<Testimonios />);
    expect(screen.getByRole('heading', { name: /lo que dicen de nosotros/i })).toBeInTheDocument();
  });

  it('shows the real Bodas.net Wedding Awards 2025 trust badge', () => {
    render(<Testimonios />);
    // The full alt, not a fragment: the badge strip below this one also
    // carries a "Wedding Awards 2025" badge, so the short regex matched two
    // elements and getByAltText threw before reaching the src assertion.
    const badge = screen.getByAltText(
      'Distintivo Bodas.net Wedding Awards 2025: EME Fotografía Sevilla, 5 estrellas'
    );
    expect(badge).toHaveAttribute('src', expect.stringContaining(encodeURIComponent('/images/trust/bodas-net-wedding-awards-2025.webp')));
  });

  it('keeps all 4 real testimonials reachable in the DOM, not silently dropped to 1', () => {
    render(<Testimonios />);
    testimonials.forEach((t, i) => {
      expect(screen.getByText(quoteText(i))).toBeInTheDocument();
      expect(screen.getByText(t.author)).toBeInTheDocument();
    });
    expect(screen.getAllByText('Opinión verificada en Bodas.net')).toHaveLength(testimonials.length);
  });

  it('marks exactly one testimonial as the current one via aria-current, the rest visually hidden but not aria-hidden', () => {
    render(<Testimonios />);
    const current = testimonials.filter((_, i) => findBlockquote(i)?.getAttribute('aria-current') === 'true');
    expect(current).toHaveLength(1);
    testimonials.forEach((_, i) => {
      expect(findBlockquote(i)).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('wraps the quote in real typographic quote glyphs as part of the sentence, not a separate decorative element', () => {
    render(<Testimonios />);
    const activeText = screen.getByText(quoteText(0));
    expect(activeText.textContent?.startsWith('“')).toBe(true);
    expect(activeText.textContent?.endsWith('”')).toBe(true);
  });

  it('auto-advances to the next testimonial over time when motion is not reduced', () => {
    vi.useFakeTimers();
    render(<Testimonios />);
    expect(findBlockquote(0)).toHaveAttribute('aria-current', 'true');
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(findBlockquote(1)).toHaveAttribute('aria-current', 'true');
  });

  it('does NOT auto-advance under prefers-reduced-motion, even after a long time', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    vi.useFakeTimers();
    render(<Testimonios />);
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(findBlockquote(0)).toHaveAttribute('aria-current', 'true');
  });

  it('provides manual next/prev controls with clear accessible names that are keyboard operable', async () => {
    const user = userEvent.setup();
    render(<Testimonios />);
    const next = screen.getByRole('button', { name: /siguiente/i });
    await user.tab();
    // Tab through to the next-control and activate it with the keyboard.
    next.focus();
    await user.keyboard('{Enter}');
    expect(findBlockquote(1)).toHaveAttribute('aria-current', 'true');

    const prev = screen.getByRole('button', { name: /anterior/i });
    prev.focus();
    await user.keyboard('{Enter}');
    expect(findBlockquote(0)).toHaveAttribute('aria-current', 'true');
  });

  it('manual controls still work under prefers-reduced-motion (manual-only cycling, never auto)', async () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const user = userEvent.setup();
    render(<Testimonios />);
    const next = screen.getByRole('button', { name: /siguiente/i });
    await user.click(next);
    expect(findBlockquote(1)).toHaveAttribute('aria-current', 'true');
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
    expect(findBlockquote(0)).toHaveAttribute('aria-current', 'true');

    fireEvent.click(resumeButton);
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(findBlockquote(1)).toHaveAttribute('aria-current', 'true');
  });

  it('has no pause control under prefers-reduced-motion (nothing to pause)', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<Testimonios />);
    expect(screen.queryByRole('button', { name: /pausar testimonios/i })).not.toBeInTheDocument();
  });
});
