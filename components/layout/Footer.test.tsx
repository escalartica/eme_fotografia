import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE;
  afterEach(() => { process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = ORIGINAL_ENV; });

  it('shows the placeholder notice when the flag is on', () => {
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'true';
    render(<Footer />);
    expect(screen.getByText(/contenido de muestra/i)).toBeInTheDocument();
  });

  it('hides the placeholder notice when the flag is off', () => {
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'false';
    render(<Footer />);
    expect(screen.queryByText(/contenido de muestra/i)).not.toBeInTheDocument();
  });

  it('shows the placeholder notice by default when the flag is unset (e.g. fresh clone, CI, prod without .env.local)', () => {
    delete process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE;
    render(<Footer />);
    expect(screen.getByText(/contenido de muestra/i)).toBeInTheDocument();
  });

  it('links to the real Instagram and Facebook accounts', () => {
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'false';
    render(<Footer />);
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('href', expect.stringContaining('instagram.com'));
  });

  it('has data-cursor="abrir" attribute on external social media links for custom cursor', () => {
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'false';
    render(<Footer />);
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('data-cursor', 'abrir');
    expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute('data-cursor', 'abrir');
  });

  it('does not add data-cursor to email link', () => {
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'false';
    render(<Footer />);
    const emailLink = screen.getByRole('link', { name: /info@emefotografiasevilla.es/i });
    expect(emailLink).not.toHaveAttribute('data-cursor');
  });
});
