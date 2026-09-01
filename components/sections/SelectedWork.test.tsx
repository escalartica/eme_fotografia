import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { projects } from '@/content/projects';
import { SelectedWork } from './SelectedWork';

// EditorialSpread.module.css class names, camelCase (CSS Modules preserves
// the original ident as a substring of the generated hashed class name in
// the vite/vitest dev pipeline this project uses).
const VARIANT_CLASS_SUBSTRINGS = ['fullBleed', 'panoramic', 'overlapPair', 'diptych'];

describe('SelectedWork', () => {
  it('renders a link to each real project via EditorialSpread', () => {
    render(<SelectedWork />);
    for (const project of projects) {
      expect(screen.getByRole('link', { name: `Ver proyecto ${project.title}` })).toHaveAttribute(
        'href',
        `/trabajos/${project.slug}`
      );
    }
  });

  it('routes the video project (boda-real-01) through EditorialSpread\'s own poster+Reproducir video path, not an inline lightbox', () => {
    render(<SelectedWork />);
    // No lightbox trigger/backdrop -- EditorialSpread's video tile
    // navigates to the detail page instead of opening one on Home.
    expect(screen.queryByTestId('lightbox-backdrop')).not.toBeInTheDocument();
    expect(screen.getAllByText('Reproducir').length).toBeGreaterThan(0);
  });

  it('renders every real project as an EditorialSpread with a valid variant, never repeating consecutively', () => {
    render(<SelectedWork />);
    const links = projects.map((p) => screen.getByRole('link', { name: `Ver proyecto ${p.title}` }));
    const variantOf = (el: HTMLElement) => VARIANT_CLASS_SUBSTRINGS.find((v) => el.className.includes(v)) ?? null;
    const variants = links.map(variantOf);
    // Every project actually got an EditorialSpread variant class (i.e. is
    // rendered via EditorialSpread, not old grid-card markup).
    expect(variants.every((v) => v !== null)).toBe(true);
    for (let i = 1; i < variants.length; i++) {
      expect(variants[i]).not.toBe(variants[i - 1]);
    }
  });
});
