import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
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
  // RootLayout DEVUELVE un <html>, y para montarlo hay que dárselo a jsdom
  // dentro del <html> que ya existe. React avisa de eso en cada ejecución
  // -- «In HTML, <html> cannot be a child of <html>» -- y el aviso es un
  // artefacto del banco de pruebas, no un defecto del layout: en Next este
  // componente ES la raíz del documento y no está anidado en nada.
  //
  // Se silencia ESE mensaje y solo ese: cualquier otro `console.error` sigue
  // saliendo. Un aviso que se repite en cada `npm test` y que todo el mundo
  // aprende a ignorar es justo la forma en que acaba pasando desapercibido
  // uno de verdad.
  const original = console.error;
  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('cannot be a child of')) return;
      original(...args);
    };
  });
  afterAll(() => {
    console.error = original;
  });

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
