import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Testimonios } from './Testimonios';

describe('Testimonios', () => {
  it('renders a photo when the testimonial has one, and degrades gracefully when it does not', () => {
    render(<Testimonios />);
    // Current seed data has zero photos — confirm no <img> is rendered and nothing crashes.
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.getByText(/lo que dicen de nosotros/i)).toBeInTheDocument();
  });
});

describe('testimonial photo conditional render', () => {
  // Testimonios reads `testimonials` from a module-level import
  // (`@/content/testimonials`). To exercise the REAL Testimonios component's
  // conditional photo render (not a hand-copied stand-in) without attaching a
  // fabricated photo to any of the real named seed testimonials, mock the
  // content module for just this one test via vi.doMock, then dynamically
  // re-import ./Testimonios so it picks up the mocked module graph.
  // vi.resetModules() before and after ensures this mock never leaks into
  // the other test in this file (or other files), which rely on the real
  // seed data. This mirrors the pattern used in
  // app/trabajos/[slug]/page.test.tsx for content-swap scenarios.
  afterEach(() => {
    vi.doUnmock('@/content/testimonials');
    vi.resetModules();
  });

  it("renders a photo with the author's name as alt text when present", async () => {
    vi.resetModules();
    vi.doMock('@/content/testimonials', () => ({
      testimonials: [
        {
          id: 'x',
          quote: 'Cita',
          author: 'Ana',
          role: 'Pareja',
          isPlaceholder: true,
          photo: '/images/testimonios/placeholder-01.webp',
        },
      ],
    }));
    const { Testimonios: MockedTestimonios } = await import('./Testimonios');
    render(<MockedTestimonios />);
    expect(screen.getByRole('img', { name: 'Ana' })).toBeInTheDocument();
  });
});
