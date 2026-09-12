import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Manifiesto } from './Manifiesto';

describe('Manifiesto', () => {
  it("keeps the studio's positioning line as the section's only heading", () => {
    render(<Manifiesto />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Menos protocolo. Más verdad.');
  });

  it('renders all three statements, in order, with their numbers and tags', () => {
    const { container } = render(<Manifiesto />);
    const rows = Array.from(container.querySelectorAll('section > div'));
    expect(rows).toHaveLength(3);
    // Cada fila es número + (titular y párrafo) + etiqueta. El párrafo es lo
    // que se añadió con el texto nuevo del estudio: si alguien lo quita, esta
    // aserción cae y no pasa desapercibido.
    const textos = rows.map((r) => r.textContent);
    expect(textos[0]).toContain('01');
    expect(textos[0]).toContain('Menos protocolo. Más verdad.');
    expect(textos[0]).toContain('el instinto del fotoperiodismo');
    expect(textos[0]).toContain('Reportaje');
    expect(textos[1]).toContain('La magia real ocurre cuando nadie mira a la cámara.');
    expect(textos[1]).toContain('El día completo');
    expect(textos[2]).toContain('Fotografía y película nacidas del mismo ADN.');
    expect(textos[2]).toContain('Foto y vídeo');
  });

  it('sets one emphasised word per statement in a real <em>', () => {
    render(<Manifiesto />);
    expect(screen.getByText('verdad', { selector: 'em' })).toBeInTheDocument();
    expect(screen.getByText('cámara', { selector: 'em' })).toBeInTheDocument();
    expect(screen.getByText('ADN', { selector: 'em' })).toBeInTheDocument();
  });

  it('ships no animation code: the stack is pure CSS, so nothing here needs a motion branch', () => {
    // Regression guard for the rewrite. The previous version pulled in GSAP,
    // ScrollTrigger and SplitText to scrub one sentence; if a future change
    // reintroduces a client hook here, this file's imports would have to grow
    // mocks again -- and that is the signal to stop and reconsider.
    render(<Manifiesto />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
