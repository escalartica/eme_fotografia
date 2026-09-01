import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
}

beforeEach(() => {
  (usePathname as any).mockReturnValue('/');
  setScrollY(0);
});

describe('Header', () => {
  it('renders the brand and the single menu toggle — no persistent nav-link row, at any width', () => {
    render(<Header />);
    expect(screen.getByRole('img', { name: 'EME Fotografía Sevilla' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Trabajos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Contacto' })).not.toBeInTheDocument();
  });
});

describe('Header — current-section label', () => {
  it('shows the label for the current route', () => {
    (usePathname as any).mockReturnValue('/servicios');
    render(<Header />);
    expect(screen.getByText('Servicios')).toBeInTheDocument();
  });

  it('shows the section label on nested routes below a section (e.g. a project detail page)', () => {
    (usePathname as any).mockReturnValue('/trabajos/boda-real-01');
    render(<Header />);
    expect(screen.getByText('Trabajos')).toBeInTheDocument();
  });

  it('omits the label on the home route', () => {
    render(<Header />);
    expect(screen.queryByText('Trabajos')).not.toBeInTheDocument();
    expect(screen.queryByText('Servicios')).not.toBeInTheDocument();
    expect(screen.queryByText('Sobre nosotros')).not.toBeInTheDocument();
    expect(screen.queryByText('Contacto')).not.toBeInTheDocument();
  });
});

describe('Header — scroll visibility', () => {
  it('stays visible near the top of the page', async () => {
    render(<Header />);
    setScrollY(20);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-hidden', 'false');
    });
  });

  it('hides after scrolling down past the threshold', async () => {
    render(<Header />);
    setScrollY(300);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-hidden', 'true');
    });
  });

  it('reappears when scrolling back up', async () => {
    render(<Header />);
    setScrollY(300);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-hidden', 'true');
    });

    setScrollY(150);
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-hidden', 'false');
    });
  });

  it('never hides while the mobile menu is open', async () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    setScrollY(300);
    fireEvent.scroll(window);
    // Give any (unexpected) pending rAF callback a chance to run before asserting.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden', 'false');
  });

  it('does not re-hide from a scroll frame that was already queued when the menu opens', async () => {
    render(<Header />);
    setScrollY(300);
    // Queues a requestAnimationFrame callback bound to the pre-menu-open
    // closure, before the menu has opened.
    fireEvent.scroll(window);
    // Opens the menu synchronously, before that queued frame has run.
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    // Give the queued frame a chance to run (and be cancelled by cleanup)
    // before asserting.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden', 'false');
  });
});
