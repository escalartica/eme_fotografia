import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from './Lightbox';

describe('Lightbox', () => {
  it('renders children only when open', () => {
    const { rerender } = render(<Lightbox isOpen={false} onClose={() => {}}><p>Pieza completa</p></Lightbox>);
    expect(screen.queryByText('Pieza completa')).not.toBeInTheDocument();
    rerender(<Lightbox isOpen onClose={() => {}}><p>Pieza completa</p></Lightbox>);
    expect(screen.getByText('Pieza completa')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Lightbox isOpen onClose={onClose}><p>Contenido</p></Lightbox>);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on backdrop click but not on content click', () => {
    const onClose = vi.fn();
    render(<Lightbox isOpen onClose={onClose}><p>Contenido</p></Lightbox>);
    fireEvent.click(screen.getByText('Contenido'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('lightbox-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('moves focus into the modal content when it opens', () => {
    render(<Lightbox isOpen onClose={() => {}}><p>Contenido</p></Lightbox>);
    // With no focusable descendants in `children`, the Lightbox's own
    // always-rendered close button is the sole tabbable node, so it — not
    // the outer content wrapper — receives initial focus.
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  });

  it('restores focus to the previously-focused element when it closes', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(trigger).toHaveFocus();

    const { rerender } = render(<Lightbox isOpen onClose={() => {}}><p>Contenido</p></Lightbox>);
    expect(trigger).not.toHaveFocus();

    rerender(<Lightbox isOpen={false} onClose={() => {}}><p>Contenido</p></Lightbox>);
    expect(trigger).toHaveFocus();

    document.body.removeChild(trigger);
  });

  it('traps Tab focus within the modal content, cycling from the last focusable element (the close button) back to the first', async () => {
    const user = userEvent.setup();
    render(
      <Lightbox isOpen onClose={() => {}}>
        <button>Primero</button>
        <button>Segundo</button>
        <button>Último</button>
      </Lightbox>
    );
    // The Lightbox always renders a "Cerrar" button after its children, so
    // it — not "Último" — is the real last tabbable node in the DOM.
    screen.getByRole('button', { name: 'Cerrar' }).focus();
    await user.tab();
    expect(screen.getByText('Primero')).toHaveFocus();
  });

  it('traps Shift+Tab, cycling from the first focusable element back to the last (the close button)', async () => {
    const user = userEvent.setup();
    render(
      <Lightbox isOpen onClose={() => {}}>
        <button>Primero</button>
        <button>Segundo</button>
        <button>Último</button>
      </Lightbox>
    );
    screen.getByText('Primero').focus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  });

  it('does not swallow Tab when a video is the only content (regression: the video is no longer simultaneously the first and last tabbable node)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Lightbox isOpen onClose={onClose}>
        {/* `tabIndex={0}` here exists only so jsdom will actually let us
            move focus onto this element for the test: unlike real
            browsers, jsdom does not implement native focusability for
            `<video controls>` without an explicit tabindex attribute
            (verified directly — `video.focus()` on a bare
            `<video controls>` in jsdom is a no-op). It does not change
            what `focus-trap`/`tabbable` computes: a `video[controls]`
            node's effective tab index is already treated as 0 either way.
            What this test needs — a single real focusable node in
            `children`, immediately followed by the Lightbox's own close
            button — is exactly the shape production renders. */}
        <video controls tabIndex={0} data-testid="clip" />
      </Lightbox>
    );
    const video = screen.getByTestId('clip');
    video.focus();
    expect(video).toHaveFocus();

    await user.tab();

    // Before the fix (rendering only `{children}` with no close button),
    // focus-trap computed a self-wrap for the lone tabbable node and
    // called preventDefault(), so Tab was fully swallowed and focus never
    // left the video — reproduced directly against the pre-fix component
    // shape while writing this test. With the close button now always
    // rendered after `children`, Tab must move focus onward instead.
    expect(video).not.toHaveFocus();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  });

  it('moves initial focus into the modal and restores it on close, using a real <video controls> element matching production usage', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <Lightbox isOpen onClose={() => {}}>
        <video controls data-testid="clip" />
      </Lightbox>
    );
    expect(trigger).not.toHaveFocus();
    // In a real browser, `video[controls]` is itself a genuinely tabbable
    // node and, being the only one in `children`, would receive initial
    // focus directly. jsdom doesn't implement native focusability for
    // media elements without an explicit `tabindex` attribute, and its
    // selector engine doesn't preserve document order for the `tabbable`
    // library's compound candidate selector when a `video[controls]`
    // precedes a `button` — verified directly (`querySelectorAll` with
    // that combined selector list returns the button before the video
    // despite the video being first in the DOM). So in this test
    // environment specifically, the always-rendered "Cerrar" button (a
    // plain, unambiguously jsdom-focusable <button>) is what actually ends
    // up with initial focus. Either way, focus correctly lands inside the
    // modal content rather than on the outer wrapper.
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();

    rerender(<Lightbox isOpen={false} onClose={() => {}}><video controls data-testid="clip" /></Lightbox>);
    expect(trigger).toHaveFocus();

    document.body.removeChild(trigger);
  });
});
