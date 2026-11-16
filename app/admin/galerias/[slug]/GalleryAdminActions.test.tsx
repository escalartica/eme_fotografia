import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

import { GalleryAdminActions } from './GalleryAdminActions';

const SLUG = 'boda-ana-y-luis';
const fetchMock = vi.fn();

beforeEach(() => {
  router.push.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function json(status: number, cuerpo: unknown) {
  return new Response(JSON.stringify(cuerpo), { status });
}

function pintar() {
  render(<GalleryAdminActions slug={SLUG} clientName="Ana y Luis" />);
  return userEvent.setup();
}

describe('cambiar la contraseña de la galería', () => {
  it('no manda una contraseña floja', async () => {
    const user = pintar();
    await user.type(screen.getByLabelText('Nueva contraseña'), '123');
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
    expect(screen.getAllByRole('alert')[0]).not.toBeEmptyDOMElement();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Generar pone una que el servidor acepta y dice cuántas sesiones se cerraron', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { ok: true, sesionesCerradas: 2 }));
    const user = pintar();
    await user.click(screen.getByRole('button', { name: 'Generar' }));
    const nueva = (screen.getByLabelText('Nueva contraseña') as HTMLInputElement).value;
    expect(nueva.length).toBeGreaterThanOrEqual(10);
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
    expect(await screen.findByText(/han cerrado las 2 sesiones/)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/admin/galerias/${SLUG}`);
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({ password: nueva });
  });

  it('con una sola sesión lo dice en singular', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { ok: true, sesionesCerradas: 1 }));
    const user = pintar();
    await user.click(screen.getByRole('button', { name: 'Generar' }));
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
    expect(await screen.findByText(/ha cerrado la sesión que estaba abierta/)).toBeInTheDocument();
  });

  it('avisa en grande si las sesiones viejas siguen abiertas', async () => {
    fetchMock.mockResolvedValueOnce(json(207, { ok: true, revocacionParcial: true }));
    const user = pintar();
    await user.click(screen.getByRole('button', { name: 'Generar' }));
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
    expect(await screen.findByText(/NO se han podido cerrar las sesiones/)).toBeInTheDocument();
  });

  it('enseña el error del servidor o de la red', async () => {
    fetchMock.mockResolvedValueOnce(json(500, { error: 'Disco lleno' })).mockRejectedValueOnce(new TypeError('x'));
    const user = pintar();
    await user.click(screen.getByRole('button', { name: 'Generar' }));
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
    expect(await screen.findByText('Disco lleno')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
    expect(await screen.findByText(/Inténtalo de nuevo/)).toBeInTheDocument();
  });
});

describe('borrar la galería', () => {
  it('no borra sin escribir el nombre exacto', async () => {
    const user = pintar();
    await user.type(screen.getByLabelText('Nombre de la galería'), 'boda-ana');
    await user.click(screen.getByRole('button', { name: 'Borrar definitivamente' }));
    expect(await screen.findByText(`Escribe exactamente "${SLUG}" para confirmar.`)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('con el nombre exacto borra y vuelve al panel', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }));
    const user = pintar();
    await user.type(screen.getByLabelText('Nombre de la galería'), SLUG);
    await user.click(screen.getByRole('button', { name: 'Borrar definitivamente' }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin'));
    expect(fetchMock).toHaveBeenCalledWith(`/api/admin/galerias/${SLUG}`, { method: 'DELETE' });
  });

  it('si el borrado deja sesiones abiertas, se queda y lo dice', async () => {
    fetchMock.mockResolvedValueOnce(json(207, { ok: true, revocacionParcial: true }));
    const user = pintar();
    await user.type(screen.getByLabelText('Nombre de la galería'), SLUG);
    await user.click(screen.getByRole('button', { name: 'Borrar definitivamente' }));
    expect(await screen.findByText(/no se han podido cerrar todas las sesiones/)).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('enseña el error del servidor o de la red', async () => {
    fetchMock.mockResolvedValueOnce(json(404, { error: 'Galería no encontrada.' })).mockRejectedValueOnce(new TypeError('x'));
    const user = pintar();
    await user.type(screen.getByLabelText('Nombre de la galería'), SLUG);
    await user.click(screen.getByRole('button', { name: 'Borrar definitivamente' }));
    expect(await screen.findByText('Galería no encontrada.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Borrar definitivamente' }));
    expect(await screen.findByText(/No se ha podido borrar/)).toBeInTheDocument();
  });
});
