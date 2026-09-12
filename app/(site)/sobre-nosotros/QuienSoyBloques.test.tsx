import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuienSoyBloques } from './QuienSoyBloques';

/**
 * Las dos formas del capítulo 01, y por qué hay dos: ver la cabecera de
 * QuienSoyBloques.tsx. Aquí se fija lo que no puede romperse.
 */

/** Pone `window.matchMedia` a devolver `matches` para cualquier consulta. */
function anchoDe(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const original = window.matchMedia;
afterEach(() => {
  window.matchMedia = original;
  vi.restoreAllMocks();
});

describe('QuienSoyBloques', () => {
  it('en un ordenador sirve los tres tramos abiertos, sin nada que pulsar', () => {
    anchoDe(false);
    const { container } = render(<QuienSoyBloques />);
    expect(container.querySelectorAll('details')).toHaveLength(0);
    for (const rotulo of ['El origen y la escuela', 'Quince años después', '¿Dónde estamos?']) {
      expect(screen.getByRole('heading', { name: rotulo })).toBeInTheDocument();
    }
    // El estudio lo dijo con todas las letras cuando aquí hubo tarjetas:
    // «no quiero tener que darle al botón + para verla».
    expect(screen.getByText(/documental/)).toBeVisible();
  });

  it('en un teléfono es un acordeón CON EL PRIMERO YA ABIERTO', () => {
    anchoDe(true);
    const { container } = render(<QuienSoyBloques />);
    const paneles = container.querySelectorAll('details');
    expect(paneles).toHaveLength(3);
    // Lo que separa este acordeón del que el estudio rechazó: nadie tiene que
    // pulsar nada para empezar a leer.
    expect(paneles[0]).toHaveAttribute('open');
    expect(paneles[1]).not.toHaveAttribute('open');
    expect(paneles[2]).not.toHaveAttribute('open');
  });

  it('es excluyente: abrir uno cierra el que estaba abierto', async () => {
    anchoDe(true);
    const user = userEvent.setup();
    const { container } = render(<QuienSoyBloques />);
    const paneles = container.querySelectorAll('details');

    await user.click(screen.getByText('Quince años después'));

    // Si se pudieran tener los tres a la vez se volvería a la pantalla y
    // media de scroll que este acordeón venía a evitar.
    expect(paneles[1]).toHaveAttribute('open');
    expect(paneles[0]).not.toHaveAttribute('open');
  });

  it('los tres rótulos siguen siendo encabezados de verdad en las dos formas', () => {
    anchoDe(true);
    render(<QuienSoyBloques />);
    // WCAG 1.3.1: se ven como encabezados, así que tienen que serlo, y el
    // rotor de encabezados del lector de pantalla sigue sirviendo de índice.
    expect(screen.getByRole('heading', { name: 'Quince años después' })).toBeInTheDocument();
  });

  it('no publica el domicilio fiscal en el relato', () => {
    anchoDe(false);
    const { container } = render(<QuienSoyBloques />);
    // La localidad es dato legal y su sitio son /aviso-legal y /privacidad,
    // donde la LSSI obliga a publicarla. Aquí decía «Partimos de La Algaba».
    expect(container.textContent).not.toMatch(/Algaba/);
    expect(container.textContent).toMatch(/Partimos de Sevilla y recorremos toda Andalucía/);
  });
});
