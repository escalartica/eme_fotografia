import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** Los mismos números que GalleryClient.tsx, aquí a la vista. */
const ESPERA = 1500;
const REINTENTO = 15_000;
import { act, render, screen, within } from '@testing-library/react';
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

  /**
   * Con relojes falsos y no con una espera de cuatro segundos: el guardado
   * automático es todo temporizadores, y esperarlos de verdad hace la prueba
   * lenta y frágil justo en la máquina más cargada, que es la de integración.
   */
  describe('el guardado automático', () => {
    function relojesFalsos() {
      // `shouldAdvanceTime`: los relojes son falsos para poder saltar quince
      // segundos de un tirón, pero siguen corriendo solos, que es lo que
      // necesitan `userEvent` y React para no quedarse esperándose el uno al
      // otro.
      vi.useFakeTimers({ shouldAdvanceTime: true });
      return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    }

    afterEach(() => {
      vi.useRealTimers();
    });

    async function pasan(ms: number) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
      });
    }

    it('guarda un rato después de marcar, y como borrador', async () => {
      const user = relojesFalsos();
      const enviado = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
      vi.stubGlobal('fetch', enviado);

      pintar();
      await user.click(screen.getAllByRole('button', { name: 'Me gusta esta foto' })[0]);
      expect(enviado).not.toHaveBeenCalled();

      await pasan(ESPERA + 10);
      expect(enviado).toHaveBeenCalledTimes(1);

      const [url, init] = enviado.mock.calls[0];
      expect(url).toBe('/api/galeria/jesus-y-andrea/seleccion');
      expect(JSON.parse(init.body).borrador).toBe(true);
    });

    /**
     * LO QUE EL AVISO PROMETÍA Y NO HACÍA. Decía «lo reintentamos solo» y sólo
     * se volvía a intentar si la pareja tocaba algo más: quien marcaba su
     * última foto justo cuando se cae el wifi perdía ese cambio creyendo que
     * estaba guardado.
     */
    it('si falla, lo reintenta solo', async () => {
      const user = relojesFalsos();
      const falla = vi.fn().mockRejectedValue(new Error('red'));
      vi.stubGlobal('fetch', falla);

      pintar();
      await user.click(screen.getAllByRole('button', { name: 'Me gusta esta foto' })[0]);
      await pasan(ESPERA + 10);
      expect(falla).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/No hemos podido guardar/)).toBeInTheDocument();

      await pasan(REINTENTO + 10);
      expect(falla).toHaveBeenCalledTimes(2);
    });

    /**
     * Y LA ESPERA CRECE. Reintentar cada quince segundos para siempre son
     * doscientas y pico peticiones al día desde una pestaña olvidada de
     * fondo, y contra un 429 --el limitador del propio servidor-- insistir
     * sólo mantiene el cubo lleno.
     */
    it('cada reintento espera el doble que el anterior', async () => {
      const user = relojesFalsos();
      const falla = vi.fn().mockRejectedValue(new Error('red'));
      vi.stubGlobal('fetch', falla);

      pintar();
      await user.click(screen.getAllByRole('button', { name: 'Me gusta esta foto' })[0]);
      await pasan(ESPERA + 10);
      await pasan(REINTENTO + 10);
      expect(falla).toHaveBeenCalledTimes(2);

      // A los quince segundos del segundo fallo todavía no toca: ahora son
      // treinta.
      await pasan(REINTENTO + 10);
      expect(falla).toHaveBeenCalledTimes(2);

      await pasan(REINTENTO);
      expect(falla).toHaveBeenCalledTimes(3);
    });

    /**
     * Un cuerpo que el servidor rechaza por su forma lo va a rechazar igual
     * dentro de un minuto: insistir sólo gasta batería y datos.
     */
    it('no reintenta lo que el servidor ha rechazado por mal formado', async () => {
      const user = relojesFalsos();
      const rechaza = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Formato de selección no válido.' }),
      });
      vi.stubGlobal('fetch', rechaza);

      pintar();
      await user.click(screen.getAllByRole('button', { name: 'Me gusta esta foto' })[0]);
      await pasan(ESPERA + 10);
      expect(rechaza).toHaveBeenCalledTimes(1);

      await pasan(REINTENTO * 4);
      expect(rechaza).toHaveBeenCalledTimes(1);
    });
  });
});
