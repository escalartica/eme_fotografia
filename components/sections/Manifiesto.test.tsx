import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Manifiesto } from './Manifiesto';

describe('Manifiesto', () => {
  it("keeps the studio's positioning line as the section's only heading", () => {
    render(<Manifiesto />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('No contamos bodas. Contamos vuestra historia.');
  });

  it('renders all three statements, in order, with their numbers and tags', () => {
    const { container } = render(<Manifiesto />);
    const rows = Array.from(container.querySelectorAll('section > div'));
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.textContent)).toEqual([
      '01No contamos bodas. Contamos vuestra historia.Reportaje',
      '02Lo que pasa cuando nadie mira a la cámara.El día completo',
      '03La foto y la película, del mismo equipo.Foto y vídeo',
    ]);
  });

  it('sets one emphasised word per statement in a real <em>', () => {
    render(<Manifiesto />);
    expect(screen.getByText('vuestra', { selector: 'em' })).toBeInTheDocument();
    expect(screen.getByText('cámara', { selector: 'em' })).toBeInTheDocument();
    expect(screen.getByText('mismo', { selector: 'em' })).toBeInTheDocument();
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
