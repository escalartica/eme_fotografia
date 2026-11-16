import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

import { NuevaPasswordForm } from './NuevaPasswordForm';

const fetchMock = vi.fn();

beforeEach(() => {
  router.push.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('NuevaPasswordForm', () => {
  it('no deja guardar hasta los 12 caracteres y dice cuántos faltan', async () => {
    const user = userEvent.setup();
    render(<NuevaPasswordForm token="tok" />);
    const boton = screen.getByRole('button', { name: 'Guardar y entrar' });
    expect(screen.getByText('Al menos 12 caracteres')).toBeInTheDocument();
    expect(boton).toBeDisabled();

    await user.type(screen.getByLabelText('Contraseña nueva'), 'corta');
    expect(screen.getByText('Te faltan 7')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña nueva')).toHaveAttribute('aria-invalid', 'true');

    await user.type(screen.getByLabelText('Contraseña nueva'), '-ya-larga');
    expect(screen.getByText('Longitud correcta')).toBeInTheDocument();
    expect(boton).toBeEnabled();
  });

  it('la casilla enseña lo que se escribe', async () => {
    const user = userEvent.setup();
    render(<NuevaPasswordForm token="tok" />);
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByLabelText('Contraseña nueva')).toHaveAttribute('type', 'text');
  });

  it('guarda con el token del enlace y lleva al acceso', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fetchMock.mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<NuevaPasswordForm token="el-token" />);
    await user.type(screen.getByLabelText('Contraseña nueva'), 'lasfotosdelaboda2026');
    await user.click(screen.getByRole('button', { name: 'Guardar y entrar' }));

    expect(await screen.findByRole('heading', { name: 'Contraseña cambiada' })).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ token: 'el-token', password: 'lasfotosdelaboda2026' });
    await act(async () => {
      vi.advanceTimersByTime(2300);
    });
    expect(router.push).toHaveBeenCalledWith('/admin/login');
  });

  it('un enlace caducado enseña el error del servidor', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"error":"Este enlace ya no sirve."}', { status: 400 }));
    const user = userEvent.setup();
    render(<NuevaPasswordForm token="viejo" />);
    await user.type(screen.getByLabelText('Contraseña nueva'), 'lasfotosdelaboda2026');
    await user.click(screen.getByRole('button', { name: 'Guardar y entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Este enlace ya no sirve.');
  });

  it('con una respuesta rara o sin conexión no se queda colgado', async () => {
    fetchMock.mockResolvedValueOnce(new Response('x', { status: 500 })).mockRejectedValueOnce(new TypeError('offline'));
    const user = userEvent.setup();
    render(<NuevaPasswordForm token="t" />);
    await user.type(screen.getByLabelText('Contraseña nueva'), 'lasfotosdelaboda2026');
    await user.click(screen.getByRole('button', { name: 'Guardar y entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido cambiar la contraseña.');
    await user.click(screen.getByRole('button', { name: 'Guardar y entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo conectar/);
  });
});
