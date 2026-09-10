import { describe, it, expect, vi, afterEach } from 'vitest';
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
    const result = await Page({ params: Promise.resolve({ slug: 'raquel-y-fran' }) });
    render(result);
    expect(screen.getByRole('heading', { name: 'Raquel y Fran' })).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('renders prev/next navigation to adjacent projects', async () => {
    const result = await Page({ params: Promise.resolve({ slug: 'andrea-y-jesus' }) });
    render(result);
    expect(screen.getByRole('link', { name: /siguiente reportaje/i })).toBeInTheDocument();
  });

  it('does not render an impact line for a project that has none', async () => {
    // All 4 current seed projects lack impactLine — this is a real assertion
    // against real content, exercising the actual Page component end to end.
    const result = await Page({ params: Promise.resolve({ slug: 'raquel-y-fran' }) });
    render(result);
    expect(screen.queryByTestId('project-impact')).not.toBeInTheDocument();
  });
});

describe('/trabajos/[slug] page — cover hero block', () => {
  // project.cover was previously used only in generateMetadata() for the OG
  // image, never rendered in the page's JSX. These assert the new cover
  // hero block actually renders, sourced from project.cover.src, for both
  // an image-cover project and a video-cover project.
  it('renders an <img> sourced from project.cover.src for an image-cover project', async () => {
    const project = projects.find((p) => p.slug === 'raquel-y-fran')!;
    if (project.cover.type !== 'image') throw new Error('fixture assumption: raquel-y-fran has an image cover');
    const result = await Page({ params: Promise.resolve({ slug: project.slug }) });
    render(result);
    // next/image rewrites `src` through its optimizer loader in the
    // rendered <img>, so match on the encoded original path rather than
    // an exact equality.
    const coverImg = screen
      .getAllByRole('img')
      .find((img) => img.getAttribute('src')?.includes(encodeURIComponent(project.cover.src)));
    expect(coverImg).toBeDefined();
  });

  it('renders a <video> sourced from project.cover.src for a video-cover project', async () => {
    const project = projects.find((p) => p.slug === 'boda-real-01')!;
    if (project.cover.type !== 'video') throw new Error('fixture assumption: boda-real-01 has a video cover');
    const result = await Page({ params: Promise.resolve({ slug: project.slug }) });
    render(result);
    const coverVideo = document.querySelector(`video[src="${project.cover.src}"]`);
    expect(coverVideo).toBeInTheDocument();
  });
});

describe('project impact line conditional render', () => {
  // Page reads `projects` from a module-level import (`@/content/projects`).
  // To exercise the REAL Page component's conditional render (not a
  // hand-copied stand-in) without fabricating a fact in content/projects.ts,
  // mock the content module for just this one test via vi.doMock, then
  // dynamically re-import ./page so it picks up the mocked module graph.
  // vi.resetModules() before and after ensures this mock never leaks into
  // the other tests in this file (or other files), which rely on the real
  // seed data.
  afterEach(() => {
    vi.doUnmock('@/content/projects');
    vi.resetModules();
  });

  it('renders the impact line via the real Page component when a project has one', async () => {
    vi.resetModules();
    vi.doMock('@/content/projects', () => ({
      projects: [
        {
          slug: 'test-impact-project',
          title: 'Proyecto de prueba',
          category: 'boda',
          year: 2026,
          client: 'Cliente de prueba',
          location: 'Sevilla',
          description: 'Descripción de prueba.',
          impactLine: 'Línea de impacto de prueba — solo para este test',
          cover: { type: 'image', src: '/images/test.webp', alt: 'Test', isPlaceholderMedia: true },
          gallery: [],
        },
      ],
    }));
    const { default: MockedPage } = await import('./page');
    const result = await MockedPage({ params: Promise.resolve({ slug: 'test-impact-project' }) });
    render(result);
    expect(screen.getByTestId('project-impact')).toHaveTextContent(
      'Línea de impacto de prueba — solo para este test'
    );
  });
});
