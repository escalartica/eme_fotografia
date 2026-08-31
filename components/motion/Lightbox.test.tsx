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
    expect(screen.getByText('Contenido').parentElement).toHaveFocus();
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

  it('traps Tab focus within the modal content, cycling from the last focusable element back to the first', async () => {
    const user = userEvent.setup();
    render(
      <Lightbox isOpen onClose={() => {}}>
        <button>Primero</button>
        <button>Segundo</button>
        <button>Último</button>
      </Lightbox>
    );
    screen.getByText('Último').focus();
    await user.tab();
    expect(screen.getByText('Primero')).toHaveFocus();
  });

  it('traps Shift+Tab, cycling from the first focusable element back to the last', async () => {
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
    expect(screen.getByText('Último')).toHaveFocus();
  });

  it('does not throw and still restores focus on close when the content has no conventionally-focusable descendants', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <Lightbox isOpen onClose={() => {}}>
        <video data-testid="clip" />
      </Lightbox>
    );
    expect(trigger).not.toHaveFocus();
    expect(screen.getByTestId('clip').parentElement).toHaveFocus();

    rerender(<Lightbox isOpen={false} onClose={() => {}}><video data-testid="clip" /></Lightbox>);
    expect(trigger).toHaveFocus();

    document.body.removeChild(trigger);
  });
});
