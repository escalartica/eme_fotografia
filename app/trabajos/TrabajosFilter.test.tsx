import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { projects } from '@/content/projects';
import { TrabajosFilter } from './TrabajosFilter';

// TrabajosFilter calls next/navigation's useRouter for withPageTransition
// click handling, which requires an App Router context that jsdom/RTL
// render() doesn't provide. Stub it the same way page.test.tsx does.
const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

afterEach(() => {
  delete (document as any).startViewTransition;
  push.mockClear();
});

describe('TrabajosFilter', () => {
  it('renders a cover image for each image-cover project', () => {
    render(<TrabajosFilter projects={projects} />);
    const imageCoverCount = projects.filter((p) => p.cover.type === 'image').length;
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(imageCoverCount);
  });

  it('navigates via router.push inside a view transition on project link click', () => {
    (document as any).startViewTransition = vi.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve() };
    });
    render(<TrabajosFilter projects={projects} />);
    const link = screen.getByRole('link', { name: 'Ver proyecto Raquel y Fran' });
    fireEvent.click(link, { button: 0 });
    expect((document as any).startViewTransition).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/trabajos/raquel-y-fran');
  });

  it('does not intercept modifier-key clicks on a project link', () => {
    render(<TrabajosFilter projects={projects} />);
    const link = screen.getByRole('link', { name: 'Ver proyecto Raquel y Fran' });
    const event = fireEvent.click(link, { button: 0, ctrlKey: true });
    // fireEvent.click returns false when preventDefault() was called
    expect(event).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });

  it('has data-cursor="ver" attribute on project card links for custom cursor', () => {
    render(<TrabajosFilter projects={projects} />);
    const link = screen.getByRole('link', { name: 'Ver proyecto Raquel y Fran' });
    expect(link).toHaveAttribute('data-cursor', 'ver');
  });
});
