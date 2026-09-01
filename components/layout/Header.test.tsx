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
  it('renders the brand name and primary nav links', () => {
    render(<Header />);
    expect(screen.getByRole('img', { name: 'EME Fotografía Sevilla' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trabajos' })).toHaveAttribute('href', '/trabajos');
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
  });
});

describe('Header — active route', () => {
  it('marks the current route with aria-current', () => {
    (usePathname as any).mockReturnValue('/servicios');
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Trabajos' })).not.toHaveAttribute('aria-current');
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
});
