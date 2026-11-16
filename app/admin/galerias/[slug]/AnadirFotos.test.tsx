import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({ enviar: vi.fn(), router: { push: vi.fn(), refresh: vi.fn() } }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks.router }));
vi.mock('@/lib/reducir-foto', () => ({ LADO_LARGO: 2560, reducirFoto: async (f: File) => f }));
vi.mock('@/lib/subir-por-tandas', async (original) => ({
  ...(await original<typeof import('@/lib/subir-por-tandas')>()),
  enviarConProgreso: mocks.enviar,
}));

import { AnadirFotos, ProgresoSubida } from './AnadirFotos';

const foto = (n: string, tipo = 'image/jpeg') => new File([new Uint8Array(10)], n, { type: tipo });

beforeEach(() => {
  mocks.enviar.mockReset();
  mocks.router.refresh.mockReset();
});

function elegir(...ficheros: File[]) {
  fireEvent.change(screen.getByLabelText('Elegir fotos para añadir'), { target: { files: ficheros } });
}

describe('AnadirFotos', () => {
  it('sube solo las imágenes elegidas a la galería correcta', async () => {
    mocks.enviar.mockResolvedValue({ ok: true, status: 200, data: { ok: true } });
    render(<AnadirFotos slug="boda-ana" fotosActuales={10} />);
    elegir(foto('a.jpg'), foto('b.webp', 'image/webp'), foto('c.svg', 'image/svg+xml'));
    await userEvent.click(screen.getByRole('button', { name: /Subir 2 fotos/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('2 fotos añadidas.');
    expect(mocks.enviar.mock.calls[0][0]).toBe('/api/admin/galerias/boda-ana/fotos');
    expect((mocks.enviar.mock.calls[0][1] as FormData).getAll('photos')).toHaveLength(2);
    expect(mocks.router.refresh).toHaveBeenCalled();
  });

  it('no deja pasar del máximo de fotos de una galería', () => {
    render(<AnadirFotos slug="boda-ana" fotosActuales={2999} />);
    elegir(foto('a.jpg'), foto('b.jpg'));
    expect(screen.getByRole('alert')).toHaveTextContent('caben 1 más');
    expect(screen.getByRole('button', { name: /1 foto$/ })).toBeInTheDocument();
  });

  it('si el servidor rechaza, deja reintentar las que faltan', async () => {
    mocks.enviar.mockResolvedValue({ ok: false, status: 400, data: { error: 'No es una imagen.' } });
    render(<AnadirFotos slug="boda-ana" fotosActuales={0} fotosIniciales={[foto('a.jpg')]} titulo="Faltan fotos" />);
    expect(screen.getByRole('heading', { name: 'Faltan fotos' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Subir 1 foto/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/No es una imagen\..*Reintentar/);
    expect(screen.getByRole('button', { name: /Reintentar 1 foto/ })).toBeInTheDocument();
  });
});

describe('ProgresoSubida', () => {
  it('dice en qué fase va', () => {
    const { rerender } = render(
      <ProgresoSubida avance={{ fase: 'preparando', subidas: 0, preparadas: 3, enLaTanda: 40, fraccionTanda: 0, total: 100 }} />
    );
    expect(screen.getByLabelText('Progreso de la subida')).toBeInTheDocument();
    rerender(
      <ProgresoSubida avance={{ fase: 'subiendo', subidas: 40, preparadas: 40, enLaTanda: 40, fraccionTanda: 0.5, total: 100 }} />
    );
    expect(screen.getByLabelText('Progreso de la subida')).toHaveAttribute('value', '60');
  });
});
