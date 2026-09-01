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

// EditorialSpread.module.css class names, camelCase (CSS Modules preserves
// the original ident as a substring of the generated hashed class name in
// the vite/vitest dev pipeline this project uses).
const VARIANT_CLASS_SUBSTRINGS = ['fullBleed', 'panoramic', 'overlapPair', 'diptych'];

describe('TrabajosFilter', () => {
  it('renders an image for each image-cover project via EditorialSpread', () => {
    render(<TrabajosFilter projects={projects} />);
    const imageCoverCount = projects.filter((p) => p.cover.type === 'image').length;
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(imageCoverCount);
  });

  it('gives every real project a valid EditorialSpread variant, never repeating consecutively', () => {
    render(<TrabajosFilter projects={projects} />);
    const links = projects.map((p) => screen.getByRole('link', { name: `Ver proyecto ${p.title}` }));
    const variantOf = (el: HTMLElement) => VARIANT_CLASS_SUBSTRINGS.find((v) => el.className.includes(v)) ?? null;
    const variants = links.map(variantOf);
    expect(variants.every((v) => v !== null)).toBe(true);
    for (let i = 1; i < variants.length; i++) {
      expect(variants[i]).not.toBe(variants[i - 1]);
    }
  });

  it('shows the video project (boda-real-01) via EditorialSpread\'s poster+Reproducir cue', () => {
    render(<TrabajosFilter projects={projects} />);
    expect(screen.getAllByText('Reproducir').length).toBeGreaterThan(0);
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
