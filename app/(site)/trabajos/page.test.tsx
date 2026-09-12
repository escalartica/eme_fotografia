import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from './page';
import { projects } from '@/content/projects';
import { perteneceA } from '@/lib/project-filter';

// Page is an async server component (it awaits `searchParams`); resolve it
// first, then render the returned element.
const renderPage = async (categoria?: string) =>
  render(await Page({ searchParams: Promise.resolve(categoria ? { categoria } : {}) }));

// TrabajosIndex (rendered by Page) calls next/navigation's useRouter for
// withPageTransition click handling, which requires an App Router context
// that jsdom/RTL render() doesn't provide. Stub it.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('/trabajos page', () => {
  it('lists every project by default', async () => {
    await renderPage();
    expect(screen.getAllByRole('link', { name: /ver reportaje/i })).toHaveLength(projects.length);
  });

  it('lands pre-filtered when linked with ?categoria= (deep link from /servicios)', async () => {
    await renderPage('video');
    const expected = projects.filter((p) => perteneceA(p, 'video')).length;
    expect(screen.getAllByRole('link', { name: /ver reportaje/i })).toHaveLength(expected);
    expect(screen.getByRole('button', { name: /^vídeo$/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps a real space in a couple name split across two lines', async () => {
    // Los nombres se parten por la «y» para que caigan en dos líneas en la
    // rejilla («Carmen / y Alberto», como bellephoto.com.au). El espacio
    // entre los dos tramos tiene que ser texto de verdad: si se sustituye
    // por un margen o se pierde en el corte, en la vista índice -- donde los
    // tramos son elementos en línea -- se lee «Carmeny Alberto», y eso es
    // lo que copia quien copie el nombre y lo que dice un lector de
    // pantalla. Ya ha pasado dos veces en este proyecto con otros titulares.
    await renderPage();
    const conY = projects.find((p) => p.title.includes(' y '))!;
    const fila = screen.getByText((_t, node) => node?.textContent === conY.title && node.tagName === 'SPAN');
    expect(fila).toBeInTheDocument();
  });

  it('opens on the index view, which is the layout that distinguishes this archive from a plain grid', async () => {
    await renderPage();
    expect(screen.getByRole('button', { name: /^índice$/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^rejilla$/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches the view by flipping one attribute, without rebuilding the list', async () => {
    const user = userEvent.setup();
    const { container } = await renderPage();
    await user.click(screen.getByRole('button', { name: /^rejilla$/i }));
    expect(screen.getByRole('button', { name: /^rejilla$/i })).toHaveAttribute('aria-pressed', 'true');
    // Las dos vistas comparten marcado: lo único que cambia es `data-view`,
    // que es lo que gobierna el CSS. Si alguien parte esto en dos listas, el
    // trabajo de accesibilidad hay que hacerlo dos veces.
    expect(container.querySelector('[data-view="rejilla"]')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /ver reportaje/i })).toHaveLength(projects.length);
    });
  });

  it('stops tracking the pointer in grid view, where there is no pinned frame to update', async () => {
    const user = userEvent.setup();
    const { container } = await renderPage();
    const first = screen.getAllByRole('link', { name: /ver reportaje/i })[0];
    await user.click(screen.getByRole('button', { name: /^rejilla$/i }));
    await waitFor(() => expect(container.querySelector('[data-view="rejilla"]')).toBeInTheDocument());
    const links = screen.getAllByRole('link', { name: /ver reportaje/i });
    await user.hover(links[3]);
    // En índice esto movería el estado activo (y con él una capa nueva y dos
    // tweens de GSAP por cada fila que el puntero cruza). En rejilla no hay
    // marco anclado que actualizar, así que no se mueve nada.
    const active = container.querySelectorAll('li[data-active]');
    expect(active).toHaveLength(1);
    // El ENLACE de la fila activa contra el enlace de la primera fila, no el
    // <li> contra el <a>: la fila que abre temporada lleva además el año como
    // separador del archivo, así que el texto del <li> nunca iba a coincidir
    // con el del enlace. Comparaba dos cosas distintas y colaba por
    // casualidad mientras la primera fila no abría año.
    expect(active[0].querySelector('a')?.textContent).toBe(first.textContent);
  });

  it('asks for the same image candidates in both views, so switching costs no new requests', async () => {
    const user = userEvent.setup();
    const { container } = await renderPage();
    const coverSizes = () => container.querySelector('img[sizes*="46vw"]')?.getAttribute('sizes');
    const before = coverSizes();
    // El último tramo es fijo, no un `vw`: `.page` está topada a 75rem, así
    // que por encima de ~1350 px la columna deja de crecer.
    expect(before).toContain('384px');
    await user.click(screen.getByRole('button', { name: /^rejilla$/i }));
    await waitFor(() => expect(container.querySelector('[data-view="rejilla"]')).toBeInTheDocument());
    // Un `sizes` distinto por vista cambia también el `srcset`, y el navegador
    // reelige candidato para las 29 portadas justo al pulsar «Rejilla».
    expect(coverSizes()).toBe(before);
  });

  it('keeps the view and the filter independent of each other', async () => {
    const user = userEvent.setup();
    const { container } = await renderPage();
    await user.click(screen.getByRole('button', { name: /^rejilla$/i }));
    await user.click(screen.getByRole('button', { name: /^vídeo$/i }));
    await waitFor(
      () => {
        expect(screen.getAllByRole('link', { name: /ver reportaje/i })).toHaveLength(
          projects.filter((p) => perteneceA(p, 'video')).length
        );
      },
      { timeout: 3000 }
    );
    // Filtrar no devuelve al visitante a la vista índice.
    expect(container.querySelector('[data-view="rejilla"]')).toBeInTheDocument();
  });

  it('filters by category on filter-button click', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(screen.getByRole('button', { name: /^vídeo$/i }));
    // The filter change now runs a GSAP fade+scale re-flow (exit, then
    // enter) before the DOM swaps to the newly filtered cards. Cards matching
    // the query exist throughout, so `findBy*` alone would
    // resolve immediately on the stale count — poll with `waitFor` instead
    // until the count itself settles. A generous timeout gives the real
    // (unmocked) GSAP tween, driven by jsdom's requestAnimationFrame
    // polyfill, room to complete both legs.
    await waitFor(
      () => {
        expect(screen.getAllByRole('link', { name: /ver reportaje/i })).toHaveLength(
          projects.filter((p) => perteneceA(p, 'video')).length
        );
      },
      { timeout: 3000 }
    );
  });
});
