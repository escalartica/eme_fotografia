import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from './page';

// TrabajosFilter (rendered by Page) calls next/navigation's useRouter for
// withPageTransition click handling, which requires an App Router context
// that jsdom/RTL render() doesn't provide. Stub it.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('/trabajos page', () => {
  it('lists all 8 seed projects by default', () => {
    render(<Page />);
    expect(screen.getAllByRole('link', { name: /ver proyecto/i })).toHaveLength(8);
  });

  it('filters by category on tab click', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('tab', { name: /^vídeo$/i }));
    // The filter change now runs a GSAP fade+scale re-flow (exit, then
    // enter) before the DOM swaps to the newly filtered cards. Cards matching
    // the query exist throughout (4, then 1), so `findBy*` alone would
    // resolve immediately on the stale count — poll with `waitFor` instead
    // until the count itself settles. A generous timeout gives the real
    // (unmocked) GSAP tween, driven by jsdom's requestAnimationFrame
    // polyfill, room to complete both legs.
    await waitFor(
      () => {
        expect(screen.getAllByRole('link', { name: /ver proyecto/i })).toHaveLength(1);
      },
      { timeout: 3000 }
    );
  });

  it('shows the empty-state message after animating out to a category with zero projects', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('tab', { name: /^fotomatón$/i }));
    // Same animated exit as above (this time the "entering" side is the
    // empty-state message rather than a new set of cards, since no seed
    // project has category "fotomaton") — poll until the cards are gone and
    // the message is in the DOM, rather than asserting synchronously.
    await waitFor(
      () => {
        expect(screen.queryAllByRole('link', { name: /ver proyecto/i })).toHaveLength(0);
        expect(
          screen.getByText('Todavía no hay trabajos en esta categoría — vuelve pronto.')
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
