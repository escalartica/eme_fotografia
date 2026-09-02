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

  it('renders the real Facebook and Instagram community numbers, thousands-separator formatted, migrated from the retired Confianza component', () => {
    // Real numbers from content/site.ts (facebookLikes: 2320, instagramFollowers: 1622),
    // formatted with the same '.' thousands-separator approach Confianza used
    // (not Intl.NumberFormat/toLocaleString, which silently no-ops on ICU-less runtimes).
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'false';
    render(<Footer />);
    expect(screen.getByText(/2\.320/)).toBeInTheDocument();
    expect(screen.getByText(/me gusta en Facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/1\.622/)).toBeInTheDocument();
    expect(screen.getByText(/seguidores en Instagram/i)).toBeInTheDocument();
  });

  it('renders the migrated numbers as a secondary detail line, not a headline stat', () => {
    // Guards against a regression that promotes these numbers back into
    // prominent styling (e.g. the retired Confianza's --type-h2 treatment)
    // — the brief is explicit these must read as small/secondary in the Footer.
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'false';
    render(<Footer />);
    const stats = screen.getByText(/2\.320 me gusta en Facebook/i);
    expect(stats.className).toMatch(/stats/i);
  });
});
