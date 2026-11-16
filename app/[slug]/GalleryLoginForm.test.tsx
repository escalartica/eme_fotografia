import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

import { GalleryLoginForm } from './GalleryLoginForm';

const fetchMock = vi.fn();

beforeEach(() => {
  router.refresh.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function entrar() {
  const user = userEvent.setup();
  render(<GalleryLoginForm slug="boda-ana-y-luis" />);
  await user.type(screen.getByLabelText('Usuario'), 'ana');
  await user.type(screen.getByLabelText('Contraseña'), 'secreta-de-la-boda');
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('GalleryLoginForm', () => {
  it('entra en la galería de SU slug y recarga', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));
    await entrar();
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/galeria/boda-ana-y-luis/login');
    expect(JSON.parse(init.body)).toEqual({ username: 'ana', password: 'secreta-de-la-boda' });
  });

  it('el campo de usuario no pone mayúsculas solo (iPhone)', () => {
    render(<GalleryLoginForm slug="x" />);
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('autocapitalize', 'none');
  });

  it('enseña el error del servidor', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"error":"Usuario o contraseña incorrectos."}', { status: 401 }));
    await entrar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.');
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it('con una respuesta rara da un mensaje amable', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 500 }));
    await entrar();
    expect(await screen.findByRole('alert')).toHaveTextContent(/No hemos podido entrar/);
  });

  it('sin conexión lo dice', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await entrar();
    expect(await screen.findByRole('alert')).toHaveTextContent(/No hemos podido conectar/);
  });
});
