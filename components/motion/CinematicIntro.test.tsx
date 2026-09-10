import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const { timeline, tlPlay } = vi.hoisted(() => {
  const tlPlay = vi.fn();
  const timeline: Record<string, unknown> = { play: tlPlay, kill: vi.fn(), time: () => 1 };
  for (const m of ['set', 'to', 'fromTo', 'from']) timeline[m] = vi.fn(() => timeline);
  return { timeline, tlPlay };
});

vi.mock('gsap', () => ({
  gsap: {
    timeline: vi.fn(() => timeline),
    utils: { selector: () => (sel: string) => Array.from(document.querySelectorAll(sel)) },
  },
}));

import { CinematicIntro } from './CinematicIntro';

describe('CinematicIntro', () => {
  afterEach(() => vi.clearAllMocks());

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
