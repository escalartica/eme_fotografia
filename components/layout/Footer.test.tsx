import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from './Footer';

// useLenis reads LenisContext, which has no Provider in these tests (no
// SmoothScrollProvider mounted) -- it correctly returns null, and Footer's
// scrollToTop() falls back to window.scrollTo, exercised below.

describe('Footer', () => {
  it('links to the real Instagram and Facebook accounts', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('href', expect.stringContaining('instagram.com'));
    expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute('href', expect.stringContaining('facebook.com'));
  });

  it('has data-cursor="abrir" attribute on external social media links for custom cursor', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('data-cursor', 'abrir');
    expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute('data-cursor', 'abrir');
  });

  it('does not add data-cursor to email link', () => {
    render(<Footer />);
    const emailLink = screen.getByRole('link', { name: /info@emefotografiasevilla.com/i });
    expect(emailLink).not.toHaveAttribute('data-cursor');
  });

  it('renders the real Facebook and Instagram community numbers, thousands-separator formatted', () => {
    render(<Footer />);
    expect(screen.getByText(/2\.320/)).toBeInTheDocument();
    expect(screen.getByText(/me gusta en Facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/1\.622/)).toBeInTheDocument();
    expect(screen.getByText(/seguidores en Instagram/i)).toBeInTheDocument();
  });

  it('renders the migrated numbers as a secondary detail line, not a headline stat', () => {
    render(<Footer />);
    const stats = screen.getByText(/2\.320 me gusta en Facebook/i);
    expect(stats.closest('ul')?.className).toMatch(/stats/i);
  });

  it('repeats the primary nav destinations and adds the two service pages', () => {
    render(<Footer />);
    const nav = screen.getByRole('navigation', { name: /pie de página/i });
    expect(nav).toBeInTheDocument();
    for (const label of ['Trabajos', 'Servicios', 'Equipo', 'Contacto']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
    // El menú de cabecera se queda con el índice de servicios; el pie es el
    // único enlace permanente a las dos páginas hijas, así que si desaparecen
    // de aquí se quedan sin enlace fijo en todo el sitio.
    expect(screen.getByRole('link', { name: 'Fotografía de boda' })).toHaveAttribute(
      'href',
      '/servicios/fotografia-de-boda',
    );
    expect(screen.getByRole('link', { name: 'Vídeo de boda' })).toHaveAttribute(
      'href',
      '/servicios/video-de-boda',
    );
  });

  it('renders the closing wordmark as decorative (hidden from the accessibility tree)', () => {
    render(<Footer />);
    // Scoped to the wordmark. The copyright line also prints the brand
    // name, so the bare regex matched two elements and threw.
    const mark = screen.getByText(/EME Fotografía Sevilla/i, { selector: 'p' });
    expect(mark).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a copyright line with the current year and the real brand name', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`${year}.*EME Fotografía Sevilla`, 'i'))).toBeInTheDocument();
  });

  it('scrolls to top on request, falling back to window.scrollTo when no Lenis instance is mounted', async () => {
    const user = userEvent.setup();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<Footer />);
    await user.click(screen.getByRole('button', { name: /volver arriba/i }));
    expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    scrollToSpy.mockRestore();
  });
});
