import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { projects } from '@/content/projects';
import { TrabajosFilter } from './TrabajosFilter';

// TrabajosFilter calls next/navigation's useRouter for withPageTransition
// click handling, which requires an App Router context that jsdom/RTL
// render() doesn't provide. Stub it the same way page.test.tsx does.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('TrabajosFilter', () => {
  it('renders a cover image for each image-cover project', () => {
    render(<TrabajosFilter projects={projects} />);
    const imageCoverCount = projects.filter((p) => p.cover.type === 'image').length;
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(imageCoverCount);
  });
});
