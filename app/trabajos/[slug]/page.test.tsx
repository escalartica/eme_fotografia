import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page, { generateStaticParams } from './page';
import { projects } from '@/content/projects';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

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
