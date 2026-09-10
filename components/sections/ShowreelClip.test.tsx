import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ShowreelClip } from './ShowreelClip';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

describe('ShowreelClip', () => {
  beforeAll(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  });
  afterEach(() => vi.clearAllMocks());

  it('renders the video with its real src/poster/alt', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<ShowreelClip src="/videos/previews/showreel.mp4" poster="/videos/posters/showreel.webp" alt="Real work montage" />);
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/videos/previews/showreel.mp4');
    expect(video).toHaveAttribute('poster', '/videos/posters/showreel.webp');
    expect(video).toHaveAttribute('aria-label', 'Real work montage');
  });

  it('autoplays when motion is not reduced', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('never autoplays under prefers-reduced-motion, showing only the static poster', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<ShowreelClip src="/a.mp4" poster="/a.webp" alt="x" />);
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });
});
