import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
}

beforeEach(() => {
  vi.mocked(usePathname).mockReturnValue('/');
  setScrollY(0);
});

describe('Header', () => {
  it('renders the brand, a persistent desktop nav, the contact link, and the menu toggle', () => {
    render(<Header />);
    expect(screen.getByRole('img', { name: 'EME Fotografía Sevilla' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trabajos' })).toHaveAttribute('href', '/trabajos');
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('href', '/servicios');
    expect(screen.getByRole('link', { name: 'Equipo' })).toHaveAttribute('href', '/sobre-nosotros');
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument();
  });
});

describe('Header — current-route indicator', () => {
  it('marks the matching nav link aria-current="page" for the current route', () => {
    vi.mocked(usePathname).mockReturnValue('/servicios');
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Trabajos' })).not.toHaveAttribute('aria-current');
  });

  it('marks the section link current on nested routes below it (e.g. a project detail page)', () => {
    vi.mocked(usePathname).mockReturnValue('/trabajos/boda-real-01');
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Trabajos' })).toHaveAttribute('aria-current', 'page');
  });

  it('marks no nav link current on the home route', () => {
    render(<Header />);
    for (const name of ['Trabajos', 'Servicios', 'Equipo', 'Contacto']) {
      expect(screen.getByRole('link', { name })).not.toHaveAttribute('aria-current');
    }
  });
});

describe('Header — paper fill on scroll', () => {
  it('has no paper fill at the top of the page', async () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'false');
  });

  it('gains the paper fill once the page scrolls past the threshold', async () => {
    render(<Header />);
    setScrollY(20);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true');
    });
  });

  it('loses the paper fill again when scrolled back to the top', async () => {
    render(<Header />);
    setScrollY(300);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true');
    });

    setScrollY(0);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'false');
    });
  });

  it('never hides on scroll — the nav stays visible the whole page (no data-hidden state)', async () => {
    render(<Header />);
    setScrollY(300);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true');
    });
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });
});

describe('Header — mobile menu toggle', () => {
  it('opens the overlay menu and flips the accessible name to close it', () => {
    render(<Header />);
    const toggle = screen.getByRole('button', { name: 'Abrir menú' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    const closeToggle = screen.getByRole('button', { name: 'Cerrar menú' });
    expect(closeToggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(closeToggle);
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');
  });
});
