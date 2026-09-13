import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { GalleryPhoto, Selection } from '@/lib/gallery-store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

import { GalleryClient } from './GalleryClient';

const FOTOS: GalleryPhoto[] = [
  { id: 'a', filename: 'a.webp', alt: 'La corbata del novio' },
  { id: 'b', filename: 'b.webp', alt: 'La novia junto a la ventana' },
  { id: 'c', filename: 'c.webp', alt: 'Los novios por la galería' },
];

const YA_MARCADAS: Selection = {
  items: [
    { photoId: 'a', liked: true, comment: '' },
    { photoId: 'c', liked: true, comment: '' },
  ],
  submittedAt: '',
  draft: true,
};

function pintar(initialSelection: Selection | null = null) {
  return render(
    <GalleryClient
      slug="jesus-y-andrea"
      clientName="Jesús y Andrea"
      photos={FOTOS}
      initialSelection={initialSelection}
    />
  );
}

/** El visor es el único `role="dialog"` de la pantalla. */
function visor() {
  return screen.getByRole('dialog');
}

describe('GalleryClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('cuenta las fotos marcadas', async () => {
    const user = userEvent.setup();
    pintar();
    expect(screen.getByText('Todavía no habéis marcado ninguna')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Me gusta esta foto' })[0]);
    expect(screen.getByText('1 foto favorita')).toBeInTheDocument();
  });

  it('el filtro de favoritas deja solo las marcadas', async () => {
    const user = userEvent.setup();
    pintar(YA_MARCADAS);

    await user.click(screen.getByRole('button', { name: /Favoritas/ }));
    expect(screen.getByRole('button', { name: /Ver La corbata del novio en grande/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Ver La novia junto a la ventana en grande/ })
    ).not.toBeInTheDocument();
  });

  /**
   * LA REGRESIÓN QUE ESTO IMPIDE. El visor recorría la lista ya filtrada, así
   * que con el filtro en «favoritas» quitarle el corazón a la foto que se
   * estaba mirando la sacaba de la lista al instante: la fotografía cambiaba
   * sola debajo del dedo y, si era la última, el visor se cerraba de golpe.
   *
   * Y repasar las favoritas quitando corazones es justo lo que hace una
   * pareja antes de enviar.
   */
  it('quitar el corazón desde el visor no cambia la foto ni lo cierra', async () => {
    const user = userEvent.setup();
    pintar(YA_MARCADAS);

    await user.click(screen.getByRole('button', { name: /Favoritas/ }));
    // La última de las dos favoritas: la que hacía desaparecer el visor.
    await user.click(screen.getByRole('button', { name: /Ver Los novios por la galería en grande/ }));

    expect(within(visor()).getByText('2 de 2')).toBeInTheDocument();
    await user.click(within(visor()).getByRole('button', { name: /Me gusta/ }));

    // Sigue abierto, sigue la misma foto, y ya no está marcada.
    expect(within(visor()).getByText('2 de 2')).toBeInTheDocument();
    expect(within(visor()).getByRole('button', { name: /Marcar/ })).toBeInTheDocument();
    expect(screen.getByText('1 foto favorita')).toBeInTheDocument();
  });

  it('guarda solo un rato después de marcar, y como borrador', async () => {
    const user = userEvent.setup();
    pintar();
    await user.click(screen.getAllByRole('button', { name: 'Me gusta esta foto' })[0]);

    await vi.waitFor(
      () => {
        expect(fetch).toHaveBeenCalled();
      },
      { timeout: 4000 }
    );

    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/galeria/jesus-y-andrea/seleccion');
    expect(JSON.parse(init.body).borrador).toBe(true);
  });
});
