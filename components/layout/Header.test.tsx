import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

beforeEach(() => {
  (usePathname as any).mockReturnValue('/');
});

describe('Header', () => {
  it('renders the brand name and primary nav links', () => {
    render(<Header />);
    expect(screen.getByText('EME Fotografía Sevilla')).toBeInTheDocument();
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
