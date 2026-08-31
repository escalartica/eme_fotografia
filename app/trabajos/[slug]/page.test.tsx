import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page, { generateStaticParams } from './page';
import { projects } from '@/content/projects';
import type { Project } from '@/content/types';
import styles from './page.module.css';

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

  it('does not render an impact line for a project that has none', async () => {
    // All 4 current seed projects lack impactLine — this is a real assertion
    // against real content, exercising the actual Page component end to end.
    const result = await Page({ params: Promise.resolve({ slug: 'clara-y-manuel' }) });
    render(result);
    expect(screen.queryByTestId('project-impact')).not.toBeInTheDocument();
  });
});

describe('project impact line conditional render', () => {
  // Page reads `projects` from a module-level import (`@/content/projects`),
  // so there is no seam to inject a one-off fake project into the real Page
  // component without either fabricating a fact in content/projects.ts (not
  // allowed) or mocking the content module (overkill for one optional
  // field, and would risk desyncing from the other tests in this file that
  // rely on the real seed data / real project count). Per the brief's
  // guidance, this is instead a small focused test of the conditional-render
  // JSX itself: a local component mirroring exactly the markup added to
  // page.tsx (className={styles.impact}, data-testid="project-impact"),
  // exercised with a Project-shaped object carrying a clearly fake,
  // test-only impactLine that never touches content/projects.ts.
  function ImpactLine({ project }: { project: Pick<Project, 'impactLine'> }) {
    return (
      <>
        {project.impactLine && (
          <p className={styles.impact} data-testid="project-impact">{project.impactLine}</p>
        )}
      </>
    );
  }

  it('renders the impact line text when impactLine is set', () => {
    const testProject: Pick<Project, 'impactLine'> = {
      impactLine: 'TEST-ONLY FAKE IMPACT LINE — not real content',
    };
    render(<ImpactLine project={testProject} />);
    const impact = screen.getByTestId('project-impact');
    expect(impact).toBeInTheDocument();
    expect(impact).toHaveTextContent('TEST-ONLY FAKE IMPACT LINE — not real content');
  });

  it('renders nothing when impactLine is absent', () => {
    render(<ImpactLine project={{}} />);
    expect(screen.queryByTestId('project-impact')).not.toBeInTheDocument();
  });
});
