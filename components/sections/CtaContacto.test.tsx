import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CtaContacto } from './CtaContacto';

describe('CtaContacto', () => {
  it('renders a CTA section with heading and a contact link with a clear accessible name', () => {
    render(<CtaContacto />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('¿Celebras algo importante?');
    // Accessible name comes from aria-label, not raw text content -- the
    // badge's visible text is decorative (repeated in an SVG textPath),
    // aria-hidden, and not the thing a screen reader announces for the
    // link itself.
    const link = screen.getByRole('link', { name: /empezar un proyecto/i });
    expect(link).toHaveAttribute('href', '/contacto');
  });
});
