import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page, { generateStaticParams } from './page';
import { projects } from '@/content/projects';

// NextProjectLink (rendered by Page) calls next/navigation's useRouter for
// withPageTransition click handling, which requires an App Router context
// that jsdom/RTL render() doesn't provide. Stub it the same way
// app/trabajos/page.test.tsx does. page.tsx also imports notFound from this
// module, so it must be stubbed too even though no test here triggers it.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  notFound: vi.fn(() => {
    throw new Error('notFound() called');
  }),
}));

describe('generateStaticParams for /trabajos/[slug]', () => {
  it('returns one entry per seed project', async () => {
    const params = await generateStaticParams();
    expect(params.map((p) => p.slug).sort()).toEqual(projects.map((p) => p.slug).sort());
  });
});

describe('/trabajos/[slug] page', () => {
  it('renders the project title, category, and gallery images', async () => {
    const result = await Page({ params: Promise.resolve({ slug: 'clara-y-manuel' }) });
    render(result);
    expect(screen.getByRole('heading', { name: 'Clara y Manuel' })).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('renders prev/next navigation to adjacent projects', async () => {
    const result = await Page({ params: Promise.resolve({ slug: 'lucia-y-jorge' }) });
    render(result);
    expect(screen.getByRole('link', { name: /siguiente proyecto/i })).toBeInTheDocument();
  });
});
