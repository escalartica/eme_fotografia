import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPreview } from './VideoPreview';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

let intersectCallback: IntersectionObserverCallback | undefined;
beforeEach(() => {
  // Reset per test: when motion is reduced, VideoPreview never constructs an
  // IntersectionObserver, so a stale callback from a prior test (closed over
  // that test's now-unmounted <video>) must not leak into this one.
  intersectCallback = undefined;
  (window as any).IntersectionObserver = vi.fn().mockImplementation(function (cb: IntersectionObserverCallback) {
    intersectCallback = cb;
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  });
  (window.HTMLMediaElement.prototype as any).play = vi.fn().mockResolvedValue(undefined);
  (window.HTMLMediaElement.prototype as any).pause = vi.fn();
});

const media = { type: 'video' as const, src: '/videos/previews/x.mp4', poster: '/videos/posters/x.webp', alt: 'Vista previa', isPlaceholderMedia: true };
const mediaWithDimensions = { ...media, width: 1280, height: 720 };

describe('VideoPreview', () => {
  it('reserves the real aspect ratio via --ar when the media has real dimensions (C3, no layout shift)', () => {
    (useReducedMotion as any).mockReturnValue(false);
    const { container } = render(<VideoPreview media={mediaWithDimensions} onOpenFull={() => {}} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--ar')).toBe('1280 / 720');
  });

  it('falls back to no inline --ar (CSS default takes over) when the media has no measured dimensions', () => {
    (useReducedMotion as any).mockReturnValue(false);
    const { container } = render(<VideoPreview media={media} onOpenFull={() => {}} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--ar')).toBe('');
  });

  it('plays when it enters the viewport', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<VideoPreview media={media} onOpenFull={() => {}} />);
    intersectCallback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('renders a focusable, operable play button even when motion is not reduced', () => {
    (useReducedMotion as any).mockReturnValue(false);
    const onOpenFull = vi.fn();
    render(<VideoPreview media={media} onOpenFull={onOpenFull} />);
    const button = screen.getByRole('button', { name: /reproducir/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onOpenFull).toHaveBeenCalledTimes(1);
  });

  it('pauses when it leaves the viewport', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<VideoPreview media={media} onOpenFull={() => {}} />);
    intersectCallback!([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('never autoplays and shows an explicit play button when motion is reduced', () => {
    (useReducedMotion as any).mockReturnValue(true);
    render(<VideoPreview media={media} onOpenFull={() => {}} />);
    // No IntersectionObserver is constructed in the reduced-motion path, so
    // intersectCallback is undefined here; guard the call rather than assume
    // one was registered.
    intersectCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /reproducir/i })).toBeInTheDocument();
  });

  it('calls onOpenFull when the play button is clicked', () => {
    (useReducedMotion as any).mockReturnValue(true);
    const onOpenFull = vi.fn();
    render(<VideoPreview media={media} onOpenFull={onOpenFull} />);
    fireEvent.click(screen.getByRole('button', { name: /reproducir/i }));
    expect(onOpenFull).toHaveBeenCalled();
  });

  it('calls onOpenFull exactly once when the play button is clicked (no bubbling double-fire)', () => {
    (useReducedMotion as any).mockReturnValue(true);
    const onOpenFull = vi.fn();
    render(<VideoPreview media={media} onOpenFull={onOpenFull} />);
    fireEvent.click(screen.getByRole('button', { name: /reproducir/i }));
    expect(onOpenFull).toHaveBeenCalledTimes(1);
  });
});
