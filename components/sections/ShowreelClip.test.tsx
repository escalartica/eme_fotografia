import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShowreelClip } from './ShowreelClip';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

// El doble del observador, igual que en VideoPreview.test.tsx: guarda la
// llamada de vuelta para poder decidir desde el test si el clip está o no en
// pantalla. El sustituto global de vitest.setup.ts no vale aquí, porque su
// `observe()` no hace nada y entonces NINGÚN test podría ver arrancar el
// vídeo.
let intersectCallback: IntersectionObserverCallback | undefined;

// Y el doble del <video>. jsdom no reproduce nada, así que `play()` y
// `pause()` tienen que mover `paused` y lanzar sus eventos como los movería un
// navegador de verdad: el botón se dibuja a partir de eso, y un doble que sólo
// cuenta llamadas dejaría pasar un botón que dice «Pausar» sobre un vídeo
// parado.
let pausado = true;

beforeEach(() => {
  intersectCallback = undefined;
  pausado = true;
  window.IntersectionObserver = vi.fn().mockImplementation(function (cb: IntersectionObserverCallback) {
    intersectCallback = cb;
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  }) as unknown as typeof IntersectionObserver;
  Object.defineProperty(window.HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get: () => pausado,
  });
  window.HTMLMediaElement.prototype.play = vi.fn(function (this: HTMLMediaElement) {
    pausado = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  window.HTMLMediaElement.prototype.pause = vi.fn(function (this: HTMLMediaElement) {
    pausado = true;
    this.dispatchEvent(new Event('pause'));
  });
});
afterEach(() => vi.clearAllMocks());

const enPantalla = (visible: boolean) =>
  act(() => {
    intersectCallback!([{ isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver);
  });

describe('ShowreelClip', () => {
  it('renders the video with its real src/poster/alt', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<ShowreelClip src="/videos/previews/showreel.mp4" poster="/videos/posters/showreel.webp" alt="Real work montage" />);
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/previews/showreel.mp4');
    expect(video).toHaveAttribute('poster', '/videos/posters/showreel.webp');
    expect(video).toHaveAttribute('aria-label', 'Real work montage');
  });

  it('autoplays once the clip is actually on screen', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    enPantalla(true);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  // LA REGRESIÓN QUE ESTE FICHERO EXISTE PARA IMPEDIR. El componente llamaba a
  // play() al montar, así que `preload="none"` no servía de nada: en
  // /servicios/video-de-boda el clip está tres pantallas por debajo del
  // pliegue y aun así sus 18 MB salían por delante de todo lo que el visitante
  // tenía delante.
  it('does not touch the network before the clip is on screen', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it('pauses again when the clip scrolls out of view', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    enPantalla(true);
    enPantalla(false);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('never autoplays under prefers-reduced-motion, showing only the static poster', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    expect(window.IntersectionObserver).not.toHaveBeenCalled();
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  /* ---------- WCAG 2.2.2: el mecanismo para pararlo ---------- */

  it('trae un botón para parar el vídeo, con nombre accesible', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    enPantalla(true);
    expect(screen.getByRole('button', { name: /pausar el vídeo/i })).toBeInTheDocument();
  });

  it('para el vídeo al pulsarlo y lo vuelve a poner en la segunda pulsación', async () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const user = userEvent.setup();
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    enPantalla(true);

    await user.click(screen.getByRole('button', { name: /pausar el vídeo/i }));
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();

    // Y la etiqueta cuenta la verdad: ahora el botón sirve para reanudar.
    const reanudar = screen.getByRole('button', { name: /reproducir el vídeo/i });
    await user.click(reanudar);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: /pausar el vídeo/i })).toBeInTheDocument();
  });

  /**
   * EL FALLO QUE ESTO EVITA. Un botón de pausa que se deshace solo en cuanto
   * la página se mueve un poco no es un mecanismo para pausar: quien lo ha
   * parado porque el movimiento le molesta al leer se lo encuentra otra vez en
   * marcha al bajar y volver a subir.
   */
  it('no vuelve a arrancar solo un vídeo que se ha parado a mano', async () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const user = userEvent.setup();
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    enPantalla(true);
    await user.click(screen.getByRole('button', { name: /pausar el vídeo/i }));
    vi.mocked(window.HTMLMediaElement.prototype.play).mockClear();

    enPantalla(false);
    enPantalla(true);

    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /reproducir el vídeo/i })).toBeInTheDocument();
  });

  /**
   * Si el navegador lo para por su cuenta -- otra pestaña, ahorro de batería,
   * el sistema -- el botón tiene que enterarse. Decir «Pausar» encima de un
   * vídeo parado es mentir sobre lo que va a pasar al pulsarlo.
   */
  it('el botón sigue lo que hace el vídeo, aunque lo pare el navegador', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    enPantalla(true);
    expect(screen.getByRole('button', { name: /pausar el vídeo/i })).toBeInTheDocument();

    act(() => {
      document.querySelector('video')!.dispatchEvent(new Event('pause'));
    });
    expect(screen.getByRole('button', { name: /reproducir el vídeo/i })).toBeInTheDocument();
  });

  // Con prefers-reduced-motion el clip no arranca solo, pero el botón sigue
  // ahí: es la única manera de verlo para quien quiera verlo.
  it('deja ver el vídeo a mano con prefers-reduced-motion', async () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const user = userEvent.setup();
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    await user.click(screen.getByRole('button', { name: /reproducir el vídeo/i }));
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });
});
