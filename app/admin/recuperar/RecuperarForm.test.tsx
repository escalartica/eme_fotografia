import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecuperarForm } from './RecuperarForm';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function pedir() {
  const user = userEvent.setup();
  render(<RecuperarForm buzon="info@emefotografiasevilla.com" />);
  await user.click(screen.getByRole('button', { name: 'Enviarme el enlace' }));
}

describe('RecuperarForm', () => {
  it('pide el enlace y dice a qué buzón ha ido', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));
    await pedir();
    expect(await screen.findByRole('heading', { name: 'Mira tu correo' })).toBeInTheDocument();
    expect(screen.getByText('info@emefotografiasevilla.com')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/recuperar', { method: 'POST' });
  });

  it('enseña el error del servidor y deja volver a intentarlo', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"error":"Ya se ha pedido un enlace hace poco."}', { status: 429 }));
    await pedir();
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya se ha pedido un enlace hace poco.');
    expect(screen.getByRole('button', { name: 'Enviarme el enlace' })).toBeEnabled();
  });

  it('con una respuesta sin JSON da un mensaje genérico', async () => {
    fetchMock.mockResolvedValueOnce(new Response('x', { status: 500 }));
    await pedir();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido enviar el enlace.');
  });

  it('sin conexión lo dice', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await pedir();
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo conectar/);
  });
});
