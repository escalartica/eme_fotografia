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

  it('does not repeat the header navigation', () => {
    // La cabecera es fija y sigue visible cuando el lector llega al pie, así
    // que las seis entradas de aquí abajo eran la misma navegación dos veces
    // en la misma pantalla. Las dos páginas hijas de servicios siguen
    // enlazadas desde el índice /servicios y desde la guía de la home.
    render(<Footer />);
    expect(screen.queryByRole('navigation', { name: /pie de página/i })).not.toBeInTheDocument();
    for (const label of ['Trabajos', 'Servicios', 'Equipo', 'Contacto']) {
      expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument();
    }
  });

  it('shows the email as a plain contact detail, not a section-sized heading', () => {
    render(<Footer />);
    const emailLink = screen.getByRole('link', { name: /info@emefotografiasevilla.com/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:info@emefotografiasevilla.com');
    // Su clase es la del correo discreto, no la de las pastillas de redes ni
    // la del antiguo enlace a tamaño de titular.
    expect(emailLink.className).toMatch(/email/i);
  });

  it('closes with the logo itself, decorative and out of the accessibility tree', () => {
    const { container } = render(<Footer />);
    // El cierre pasó de ser el nombre compuesto en tipografía a ser el
    // logotipo. Sigue siendo decorativo: el nombre ya lo dan el <title>, el
    // logotipo de la cabecera con su nombre accesible y la línea de
    // copyright de abajo, así que anunciarlo una cuarta vez es ruido.
    const mark = container.querySelector('img[aria-hidden="true"]');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveAttribute('alt', '');
    expect(mark?.getAttribute('src')).toContain(encodeURIComponent('/images/logo/eme-mark-light.png'));
  });

  /* La línea la dictó el estudio palabra por palabra. Lo único que NO es
     literal es el año, que se calcula: escrito a mano envejece solo, y en
     una web de bodas se nota porque media clientela entra a contratar para
     el año siguiente. */
  it('cierra con la línea de copyright que pidió el estudio, con el año al día', () => {
    const { container } = render(<Footer />);
    const year = new Date().getFullYear().toString();
    const linea = container.textContent ?? '';
    expect(linea).toContain(`© ${year} Eme Fotografía. All rights reserved.`);
    expect(linea).toContain('Designed & Developed by Escalârtica.');
  });

  /* Una sola línea de copyright, no dos: aquí convivía «Todos los derechos
     reservados» con el lema del estudio, que ya está en la cabecera de cada
     página. Si alguien la reintroduce, esto lo dice. */
  it('no repite el copyright en castellano ni el lema', () => {
    const { container } = render(<Footer />);
    expect(container.textContent).not.toMatch(/todos los derechos reservados/i);
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
