import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

import { DeleteMessageButton } from './DeleteMessageButton';

const fetchMock = vi.fn();

beforeEach(() => {
  router.refresh.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('DeleteMessageButton', () => {
  it('pregunta antes de borrar y no hace nada si se cancela', async () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<DeleteMessageButton id="abc" nombre="Lucía" />);
    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(confirmar).toHaveBeenCalledWith(expect.stringContaining('Lucía'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('borra el mensaje y recarga el listado', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fetchMock.mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));
    render(<DeleteMessageButton id="abc" nombre="Lucía" />);
    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/mensajes/abc', { method: 'DELETE' });
  });

  it('si el servidor falla, avisa y deja reintentar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 })).mockRejectedValueOnce(new TypeError('x'));
    render(<DeleteMessageButton id="abc" nombre="Lucía" />);
    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se ha podido borrar/);
    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se ha podido borrar/);
    expect(router.refresh).not.toHaveBeenCalled();
  });
});
