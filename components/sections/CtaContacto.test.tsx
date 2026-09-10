import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CtaContacto } from './CtaContacto';

describe('CtaContacto', () => {
  it('renders a CTA section with heading and a contact link with a clear accessible name', () => {
    render(<CtaContacto />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('una boda por fecha');
    const link = screen.getByRole('link', { name: /consultar nuestra disponibilidad/i });
    expect(link).toHaveAttribute('href', '/contacto');
  });

  it('still renders the full-bleed background photo, now wrapped in the scroll parallax layer', () => {
    const { container } = render(<CtaContacto />);
    // aria-hidden + empty alt: purely decorative, same as before wrapping.
    const bg = container.querySelector('img[aria-hidden="true"]');
    expect(bg).toBeInTheDocument();
    expect(bg).toHaveAttribute('alt', '');
    expect(bg).toHaveAttribute('src', expect.stringContaining(encodeURIComponent('/images/trabajos/rocio-y-juanje/fiesta.webp')));
  });

  it('keeps the lead line and body copy in the DOM (progressive enhancement -- the reveal wrapper never hides content)', () => {
    render(<CtaContacto />);
    expect(screen.getByText('Solo cubrimos')).toBeInTheDocument();
    expect(screen.getByText(/decidnos cuándo y dónde es la vuestra/i)).toBeInTheDocument();
  });
});
