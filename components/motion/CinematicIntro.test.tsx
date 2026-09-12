import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const { timeline, tlPlay } = vi.hoisted(() => {
  const tlPlay = vi.fn();
  const timeline: Record<string, unknown> = { play: tlPlay, kill: vi.fn(), time: () => 1 };
  // 'call' se añade con el resto: la secuencia avisa a Hero en el fotograma
  // en que las barras se abren (CinematicIntro's `onReveal`), y ese aviso se
  // programa con tl.call(). Sin este método en el doble, el efecto lanzaba.
  for (const m of ['set', 'to', 'fromTo', 'from', 'call']) timeline[m] = vi.fn(() => timeline);
  return { timeline, tlPlay };
});

vi.mock('gsap', () => ({
  gsap: {
    timeline: vi.fn(() => timeline),
    utils: { selector: () => (sel: string) => Array.from(document.querySelectorAll(sel)) },
  },
}));

import { CinematicIntro } from './CinematicIntro';
import { mosaicColumns } from '@/content/mosaic';
import { featuredFrames } from '@/content/featured';
import { tamanoWebp } from '@/test-utils/webp';

describe('CinematicIntro', () => {
  afterEach(() => vi.clearAllMocks());

  /**
   * LAS TRES REGLAS DE LOS DOS FOTOGRAMAS DE APERTURA, que hasta ahora sólo
   * vivían en un comentario y ya se han roto dos veces:
   *
   *  1. APAISADAS. La secuencia va a pantalla completa: con una vertical
   *     dentro, `object-fit: cover` se queda con una franja central y la
   *     estira a todo lo ancho del monitor.
   *  2. GRANDES. Menos de 2.400 px y lo primero que ve un visitante nuevo es
   *     la única imagen del sitio ampliada.
   *  3. DE BODAS QUE NO SALEN DEBAJO. El telón se levanta sobre el mosaico y,
   *     un poco más abajo, el carrete. Una boda repetida aquí es la misma
   *     pareja dos veces en tres segundos -- y eso ya pasó con el fotograma
   *     del puente, que no era el mismo fichero que el mosaico pero sí la
   *     misma boda que su segunda columna.
   *
   * Se lee el fichero, no lo declarado: aquí no hay medidas escritas que
   * comprobar.
   */
  it('abre con dos apaisadas grandes de bodas que no se repiten más abajo', () => {
    const enLaPortada = new Set([
      ...mosaicColumns.map((c) => c.projectSlug),
      ...featuredFrames.map((f) => f.projectSlug),
    ]);
    const { container } = render(<CinematicIntro onComplete={() => {}} />);
    const fuentes = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src') ?? '');
    expect(fuentes).toHaveLength(2);

    for (const src of fuentes) {
      const ruta = decodeURIComponent(src).replace(/^.*?(\/images\/)/, '$1').replace(/[?&].*$/, '');
      const { ancho, alto } = tamanoWebp(ruta);
      expect({ ruta, apaisada: ancho > alto, suficiente: ancho >= 2400 }).toEqual({
        ruta,
        apaisada: true,
        suficiente: true,
      });
      const boda = ruta.split('/')[3];
      expect({ ruta, repetidaAbajo: enLaPortada.has(boda) }).toEqual({ ruta, repetidaAbajo: false });
    }
  });

  it('renders the frames, the mark and a skip control', () => {
    render(<CinematicIntro onComplete={() => {}} />);
    expect(screen.getByTestId('intro-sequence')).toBeInTheDocument();
    expect(screen.getByText('eme')).toBeInTheDocument();
    // The skip control's accessible name carries what it skips, for
    // anyone who meets the button without seeing the screen behind it.
    expect(screen.getByRole('button', { name: /saltar/i })).toBeInTheDocument();
    // Two frames, not three: the sequence was cut from 4.6s to 2.2s so it
    // stops being the site's own LCP wall (see CinematicIntro's doc comment).
    expect(document.querySelectorAll('img')).toHaveLength(2);
  });

  it('jumps the timeline to the reveal when skipped or on Escape', () => {
    render(<CinematicIntro onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /saltar/i }));
    expect(tlPlay).toHaveBeenCalledWith(1.45);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(tlPlay).toHaveBeenCalledTimes(2);
  });
});
