import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ShowreelClip } from './ShowreelClip';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

// El doble del observador, igual que en VideoPreview.test.tsx: guarda la
// llamada de vuelta para poder decidir desde el test si el clip está o no en
// pantalla. El sustituto global de vitest.setup.ts no vale aquí, porque su
// `observe()` no hace nada y entonces NINGÚN test podría ver arrancar el
// vídeo.
let intersectCallback: IntersectionObserverCallback | undefined;
beforeEach(() => {
  intersectCallback = undefined;
  window.IntersectionObserver = vi.fn().mockImplementation(function (cb: IntersectionObserverCallback) {
    intersectCallback = cb;
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  }) as unknown as typeof IntersectionObserver;
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
});
afterEach(() => vi.clearAllMocks());

const enPantalla = (visible: boolean) =>
  intersectCallback!([{ isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver);

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
});
