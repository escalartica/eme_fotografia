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
});
