import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

import { AdminLoginForm } from './AdminLoginForm';

const fetchMock = vi.fn();

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function respuesta(status: number, cuerpo: unknown) {
  return new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });
}

async function entrar(usuario = 'eme', contra = 'una-contrasena-larga') {
  const user = userEvent.setup();
  render(<AdminLoginForm />);
  const campoUsuario = screen.getByLabelText('Usuario');
  await user.clear(campoUsuario);
  await user.type(campoUsuario, usuario);
  await user.type(screen.getByLabelText('Contraseña'), contra);
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
  return user;
}

describe('AdminLoginForm', () => {
  it('manda usuario y contraseña, recuerda el usuario y entra al panel', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(200, { ok: true }));
    await entrar();
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin'));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/login');
    expect(JSON.parse(init.body)).toEqual({ username: 'eme', password: 'una-contrasena-larga' });
    expect(localStorage.getItem('eme-admin-usuario')).toBe('eme');
  });

  it('rellena el usuario que recordó la última vez', () => {
    localStorage.setItem('eme-admin-usuario', 'estudio');
    render(<AdminLoginForm />);
    expect(screen.getByLabelText('Usuario')).toHaveValue('estudio');
  });

  it('enseña el error del servidor y vacía la contraseña', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(401, { error: 'Usuario o contraseña incorrectos.' }));
    await entrar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
    expect(router.push).not.toHaveBeenCalled();
  });

  it('cuando está bloqueado ofrece recuperar la contraseña por correo', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(429, { error: 'Demasiados intentos.' }));
    await entrar();
    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Demasiados intentos.');
    expect(screen.getByRole('link', { name: 'Recupérala por correo' })).toHaveAttribute('href', '/admin/recuperar');
  });

  it('con una respuesta sin JSON da un mensaje genérico', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));
    await entrar();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo iniciar sesión.');
  });

  it('sin conexión lo dice', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await entrar();
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo conectar/);
  });

  it('el botón Ver enseña la contraseña y la vuelve a ocultar', async () => {
    const user = userEvent.setup();
    render(<AdminLoginForm />);
    const campo = screen.getByLabelText('Contraseña');
    expect(campo).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Ver' }));
    expect(campo).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Ocultar' }));
    expect(campo).toHaveAttribute('type', 'password');
  });

  it('avisa del bloqueo de mayúsculas', async () => {
    const user = userEvent.setup();
    render(<AdminLoginForm />);
    await user.type(screen.getByLabelText('Contraseña'), '{CapsLock}A');
    expect(await screen.findByRole('status')).toHaveTextContent(/mayúsculas/);
  });
});
