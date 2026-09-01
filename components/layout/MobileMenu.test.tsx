import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileMenu } from './MobileMenu';

describe('MobileMenu', () => {
  it('opens on button click and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MobileMenu isOpen onClose={onClose} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('traps Tab navigation to the panel instead of letting focus escape to the rest of the document', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Outside link before</button>
        <MobileMenu isOpen onClose={vi.fn()} />
        <button>Outside link after</button>
      </>
    );
    const links = screen.getAllByRole('link');
    // Initial focus already lands on the first link on open, so tabbing
    // exactly `links.length` times cycles through every remaining link and
    // one step past the last one — focus must wrap back to the first link
    // inside the panel, never escape to either outside button.
    for (let i = 0; i < links.length; i++) {
      await user.tab();
    }
    expect(document.activeElement).toBe(links[0]);
    expect(screen.getByText('Outside link before')).not.toHaveFocus();
    expect(screen.getByText('Outside link after')).not.toHaveFocus();
  });
});
