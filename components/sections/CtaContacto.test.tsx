import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CtaContacto } from './CtaContacto';
import { tamanoWebp } from '@/test-utils/webp';

const FONDO = '/images/trabajos/eva-y-rafa/fiesta.webp';

describe('CtaContacto', () => {
  it('renders a CTA section with heading and a contact link with a clear accessible name', () => {
    render(<CtaContacto />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Vuestra boda merece toda nuestra atención.',
    );
    const link = screen.getByRole('link', { name: /consultar vuestra fecha/i });
    expect(link).toHaveAttribute('href', '/contacto');
  });

  it('still renders the full-bleed background photo, now wrapped in the scroll parallax layer', () => {
    const { container } = render(<CtaContacto />);
    // aria-hidden + empty alt: purely decorative, same as before wrapping.
    const bg = container.querySelector('img[aria-hidden="true"]');
    expect(bg).toBeInTheDocument();
    expect(bg).toHaveAttribute('alt', '');
    expect(bg).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(FONDO)));
  });

  /**
   * LA REGRESIÓN QUE ESTO IMPIDE: volver a poner aquí un retrato vertical.
   *
   * Esta banda mide unos 2,31:1. Con un vertical dentro, `object-fit: cover`
   * se queda con una franja de la anchura ENTERA del fichero y la estira a
   * todo lo ancho de la ventana: el retrato de 1707x2560 que había antes
   * acababa ampliado casi al doble en un portátil de 1440 px a 2x, y así es
   * como el cierre de la portada -- la última fotografía que ve quien está
   * a punto de escribir -- se veía blando en una web de fotógrafos.
   *
   * Se comprueba el fichero, no lo declarado, porque aquí no hay nada
   * declarado que pueda mentir.
   */
  it('uses a landscape photograph big enough for a full-bleed band', () => {
    const { ancho, alto } = tamanoWebp(FONDO);
    expect(ancho).toBeGreaterThan(alto);
    expect(ancho).toBeGreaterThanOrEqual(2400);
  });

  it('keeps the lead line and body copy in the DOM (progressive enhancement -- the reveal wrapper never hides content)', () => {
    render(<CtaContacto />);
    expect(screen.getByText('Con la fecha y el lugar basta')).toBeInTheDocument();
    expect(screen.getByText(/os decimos si seguimos libres y qué pack encaja/i)).toBeInTheDocument();
  });
});
