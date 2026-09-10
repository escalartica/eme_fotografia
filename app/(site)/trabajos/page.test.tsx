import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from './page';
import { projects } from '@/content/projects';

// Page is an async server component (it awaits `searchParams`); resolve it
// first, then render the returned element.
const renderPage = async (categoria?: string) =>
  render(await Page({ searchParams: Promise.resolve(categoria ? { categoria } : {}) }));

// TrabajosIndex (rendered by Page) calls next/navigation's useRouter for
// withPageTransition click handling, which requires an App Router context
// that jsdom/RTL render() doesn't provide. Stub it.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('/trabajos page', () => {
  it('lists every project by default', async () => {
    await renderPage();
    expect(screen.getAllByRole('link', { name: /ver reportaje/i })).toHaveLength(projects.length);
  });

  it('lands pre-filtered when linked with ?categoria= (deep link from /servicios)', async () => {
    await renderPage('video');
    const expected = projects.filter((p) => p.category === 'video').length;
    expect(screen.getAllByRole('link', { name: /ver reportaje/i })).toHaveLength(expected);
    expect(screen.getByRole('button', { name: /^vídeo$/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters by category on filter-button click', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(screen.getByRole('button', { name: /^vídeo$/i }));
    // The filter change now runs a GSAP fade+scale re-flow (exit, then
    // enter) before the DOM swaps to the newly filtered cards. Cards matching
    // the query exist throughout, so `findBy*` alone would
    // resolve immediately on the stale count — poll with `waitFor` instead
    // until the count itself settles. A generous timeout gives the real
    // (unmocked) GSAP tween, driven by jsdom's requestAnimationFrame
    // polyfill, room to complete both legs.
    await waitFor(
      () => {
        expect(screen.getAllByRole('link', { name: /ver reportaje/i })).toHaveLength(
          projects.filter((p) => p.category === 'video').length
        );
      },
      { timeout: 3000 }
    );
  });
});
