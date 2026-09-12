import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));
// HeroMosaic calls useRouter() to prefetch the wedding a column links to.
// Outside the App Router, next/navigation throws "invariant expected app
// router to be mounted" during render, so the page never got far enough for
// a single assertion to run.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Home page', () => {
  it('renders every narrative section in order', () => {
    render(<Page />);
    const headingTexts = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headingTexts).toEqual([
      'Menos protocolo. Más verdad.',
      'Bodas reales, historias irrepetibles.',
      'Fotografía de boda',
      'Vídeo de boda',
      'Cuando llega el gran día, ya no hay desconocidos tras la cámara.',
      'Lo que dicen de nosotros',
      // The home's one block of real prose, added so the page has
      // something for a reader (and a crawler) to read between the
      // photographs. «Antes de escribirnos» sigue estando ahí, pero ahora es
      // el antetítulo: el <h2> dice lo que hay debajo, que son las seis
      // preguntas desplegables. Ver el comentario de GuiaBodasSevilla.
      'Las seis preguntas que nos hacen siempre.',
      'Vuestra boda merece toda nuestra atención.',
    ]);
  });
});
