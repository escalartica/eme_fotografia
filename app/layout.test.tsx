import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// next/font/google and next/font/local rely on Next's SWC build-time
// transform, which isn't available under plain Vite/Vitest. Stub them so
// the layout module can be imported and rendered in jsdom.
vi.mock('next/font/google', () => ({
  Bodoni_Moda: () => ({ variable: '--font-display-loaded' }),
}));
vi.mock('next/font/local', () => ({
  default: () => ({ variable: '--font-sans-loaded' }),
}));

import RootLayout from './layout';

describe('RootLayout', () => {
  it('renders a skip link targeting #main-content', () => {
    render(
      <RootLayout params={Promise.resolve({})}>
        <div id="main-content">contenido</div>
      </RootLayout>,
      { container: document.documentElement },
    );
    const skipLink = screen.getByText('Saltar al contenido');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});
