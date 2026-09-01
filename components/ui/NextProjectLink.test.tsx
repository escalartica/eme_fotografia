import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextProjectLink } from './NextProjectLink';

// NextProjectLink calls next/navigation's useRouter for withPageTransition
// click handling, which requires an App Router context that jsdom/RTL
// render() doesn't provide. Stub it the same way TrabajosFilter.test.tsx does.
const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

afterEach(() => {
  delete (document as any).startViewTransition;
  push.mockClear();
});

describe('NextProjectLink', () => {
  it('navigates via router.push inside a view transition on click', () => {
    (document as any).startViewTransition = vi.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve() };
    });
    render(<NextProjectLink href="/trabajos/lucia-y-jorge" label="Siguiente proyecto: Lucía y Jorge" />);
    const link = screen.getByRole('link', { name: /siguiente proyecto/i });
    fireEvent.click(link, { button: 0 });
    expect((document as any).startViewTransition).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/trabajos/lucia-y-jorge');
  });

  it('does not intercept modifier-key clicks', () => {
    render(<NextProjectLink href="/trabajos/lucia-y-jorge" label="Siguiente proyecto: Lucía y Jorge" />);
    const link = screen.getByRole('link', { name: /siguiente proyecto/i });
    const event = fireEvent.click(link, { button: 0, ctrlKey: true });
    // fireEvent.click returns false when preventDefault() was called
    expect(event).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });

  it('applies an optional className to the underlying link', () => {
    render(
      <NextProjectLink
        href="/trabajos/lucia-y-jorge"
        label="Siguiente proyecto: Lucía y Jorge"
        className="nextLink"
      />
    );
    const link = screen.getByRole('link', { name: /siguiente proyecto/i });
    expect(link).toHaveClass('nextLink');
  });

  it('has data-cursor="explorar" attribute for custom cursor', () => {
    render(<NextProjectLink href="/trabajos/lucia-y-jorge" label="Siguiente proyecto: Lucía y Jorge" />);
    const link = screen.getByRole('link', { name: /siguiente proyecto/i });
    expect(link).toHaveAttribute('data-cursor', 'explorar');
  });
});
