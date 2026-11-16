import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * El alta de una galería: lo que hace el estudio cada vez que entrega una
 * boda. Se prueba con la subida por tandas DE VERDAD (lib/subir-por-tandas)
 * y solo se sustituye lo que en jsdom no existe: el envío por XHR y el
 * encogido de las fotos en un canvas.
 */

const mocks = vi.hoisted(() => ({
  enviar: vi.fn(),
  router: { push: vi.fn(), refresh: vi.fn() },
}));
vi.mock('next/navigation', () => ({ useRouter: () => mocks.router }));
vi.mock('@/lib/reducir-foto', () => ({ LADO_LARGO: 2560, reducirFoto: async (f: File) => f }));
vi.mock('@/lib/subir-por-tandas', async (original) => ({
  ...(await original<typeof import('@/lib/subir-por-tandas')>()),
  enviarConProgreso: mocks.enviar,
}));

import { NewGalleryForm } from './NewGalleryForm';

function foto(nombre: string, tipo = 'image/jpeg', bytes = 1000): File {
  return new File([new Uint8Array(bytes)], nombre, { type: tipo, lastModified: 1 });
}


beforeEach(() => {
  mocks.enviar.mockReset();
  URL.createObjectURL = vi.fn(() => 'blob:previa');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
});

function elegir(...ficheros: File[]) {
  fireEvent.change(screen.getByLabelText('Fotos de la sesión'), { target: { files: ficheros } });
}

describe('NewGalleryForm', () => {
  it('propone enlace, usuario y contraseña a partir del nombre', async () => {
    const user = userEvent.setup();
    render(<NewGalleryForm />);
    await user.type(screen.getByLabelText('Nombre del cliente'), 'Lucía y Márcos');
    expect(screen.getByLabelText('Enlace de la galería')).toHaveValue('lucia-y-marcos');
    expect(screen.getByLabelText('Usuario de acceso')).toHaveValue('lucia-y-marcos');
    expect((screen.getByLabelText('Contraseña de acceso') as HTMLInputElement).value.length).toBeGreaterThanOrEqual(10);
  });

  it('valida lo obligatorio antes de subir nada', async () => {
    const user = userEvent.setup();
    render(<NewGalleryForm />);
    await user.click(screen.getByRole('button', { name: 'Crear galería' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Indica el nombre del cliente.');

    await user.type(screen.getByLabelText('Nombre del cliente'), 'Ana y Luis');
    await user.click(screen.getByRole('button', { name: 'Crear galería' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Sube al menos una foto.');

    const contra = screen.getByLabelText('Contraseña de acceso');
    await user.clear(contra);
    await user.type(contra, 'corta');
    await user.click(screen.getByRole('button', { name: 'Crear galería' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/contraseña/i);
    expect(mocks.enviar).not.toHaveBeenCalled();
  });

  it('rechaza ficheros que no son fotos y deja quitar las elegidas', async () => {
    const user = userEvent.setup();
    render(<NewGalleryForm />);
    elegir(foto('uno.jpg'), foto('dos.png', 'image/png'), foto('virus.html', 'text/html'));
    expect(screen.getByRole('alert')).toHaveTextContent('"virus.html" no es un formato admitido');
    expect(screen.getByText(/2 fotos listas para subir/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quitar uno.jpg' }));
    expect(screen.getByText(/1 foto lista para subir/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quitar todas' }));
    expect(screen.queryByText(/para subir/)).not.toBeInTheDocument();
  });

  it('acepta fotos arrastradas', () => {
    render(<NewGalleryForm />);
    const zona = screen.getByText(/Arrastra tus fotos aquí/).closest('div')!;
    fireEvent.dragOver(zona);
    expect(zona).toHaveAttribute('data-dragging', 'true');
    fireEvent.dragLeave(zona);
    fireEvent.drop(zona, { dataTransfer: { files: [foto('a.webp', 'image/webp')] } });
    expect(screen.getByText(/1 foto lista para subir/)).toBeInTheDocument();
  });

  it('avisa de una foto enorme', () => {
    render(<NewGalleryForm />);
    const enorme = foto('enorme.jpg');
    Object.defineProperty(enorme, 'size', { value: 200 * 1024 * 1024 });
    elegir(enorme);
    expect(screen.getByRole('alert')).toHaveTextContent('"enorme.jpg" es enorme');
  });

  it('crea la galería, sube por tandas y enseña los datos para la pareja', async () => {
    const user = userEvent.setup();
    mocks.enviar.mockImplementation(async (url: string, _form: FormData, alProgresar: (f: number) => void) => {
      alProgresar(0.5);
      return url === '/api/admin/galerias'
        ? { ok: true, status: 200, data: { slug: 'ana-y-luis' } }
        : { ok: true, status: 200, data: { ok: true } };
    });
    render(<NewGalleryForm />);
    await user.type(screen.getByLabelText('Nombre del cliente'), 'Ana y Luis');
    elegir(...Array.from({ length: 45 }, (_, i) => foto(`f${i}.jpg`)));
    await user.click(screen.getByRole('button', { name: 'Crear galería' }));

    expect(await screen.findByRole('heading', { name: 'Todo listo para Ana y Luis' })).toBeInTheDocument();
    // 45 fotos = una tanda de 40 que crea la galería y otra de 5 que se añade.
    expect(mocks.enviar.mock.calls.map((c) => c[0])).toEqual([
      '/api/admin/galerias',
      '/api/admin/galerias/ana-y-luis/fotos',
    ]);
    const primera = mocks.enviar.mock.calls[0][1] as FormData;
    expect(primera.get('slug')).toBe('ana-y-luis');
    expect(primera.get('username')).toBe('ana-y-luis');
    expect(primera.getAll('photos')).toHaveLength(40);

    // user-event pone su propio portapapeles: se lee de ahí.
    await user.click(screen.getAllByRole('button', { name: 'Copiar' })[1]);
    expect(await navigator.clipboard.readText()).toBe('ana-y-luis');
    expect(await screen.findByText('Usuario copiado al portapapeles')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copiar el mensaje para la pareja' }));
    expect(await navigator.clipboard.readText()).toMatch(/ana-y-luis/);
    expect(screen.getByRole('link', { name: 'Ver galería en el panel' })).toHaveAttribute('href', '/admin/galerias/ana-y-luis');
  });

  it('si el servidor rechaza el alta lo dice y no da la galería por creada', async () => {
    const user = userEvent.setup();
    mocks.enviar.mockResolvedValue({ ok: false, status: 409, data: { error: 'Ya existe una galería con ese enlace.' } });
    render(<NewGalleryForm />);
    await user.type(screen.getByLabelText('Nombre del cliente'), 'Ana y Luis');
    elegir(foto('a.jpg'));
    await user.click(screen.getByRole('button', { name: 'Crear galería' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una galería con ese enlace.');
    expect(screen.queryByText(/Todo listo/)).not.toBeInTheDocument();
  });

  it('si el servidor no devuelve el enlace, no inventa uno', async () => {
    const user = userEvent.setup();
    mocks.enviar.mockResolvedValue({ ok: true, status: 200, data: {} });
    render(<NewGalleryForm />);
    await user.type(screen.getByLabelText('Nombre del cliente'), 'Ana y Luis');
    elegir(foto('a.jpg'));
    await user.click(screen.getByRole('button', { name: 'Crear galería' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/no ha devuelto su enlace/);
  });

  it('el enlace se puede escribir con guiones y el guion sobrante no se envía', async () => {
    const user = userEvent.setup();
    mocks.enviar.mockResolvedValue({ ok: false, status: 400, data: { error: 'x' } });
    render(<NewGalleryForm />);
    await user.type(screen.getByLabelText('Nombre del cliente'), 'Ana');
    const enlace = screen.getByLabelText('Enlace de la galería');
    await user.clear(enlace);
    await user.type(enlace, 'Boda Ña-');
    expect(enlace).toHaveValue('boda-na-');
    elegir(foto('a.jpg'));
    await user.click(screen.getByRole('button', { name: 'Crear galería' }));
    await waitFor(() => expect(mocks.enviar).toHaveBeenCalled());
    expect((mocks.enviar.mock.calls[0][1] as FormData).get('slug')).toBe('boda-na');
  });

  it('se puede cambiar el enlace, el usuario y la contraseña a mano', async () => {
    const user = userEvent.setup();
    render(<NewGalleryForm />);
    await user.type(screen.getByLabelText('Nombre del cliente'), 'Ana y Luis');
    await user.clear(screen.getByLabelText('Enlace de la galería'));
    await user.type(screen.getByLabelText('Enlace de la galería'), 'boda-especial');
    await user.clear(screen.getByLabelText('Usuario de acceso'));
    await user.type(screen.getByLabelText('Usuario de acceso'), 'pareja');
    expect(screen.getByLabelText('Enlace de la galería')).toHaveValue('boda-especial');
    expect(screen.getByLabelText('Usuario de acceso')).toHaveValue('pareja');
    const antes = (screen.getByLabelText('Contraseña de acceso') as HTMLInputElement).value;
    await user.click(screen.getByRole('button', { name: 'Generar' }));
    expect((screen.getByLabelText('Contraseña de acceso') as HTMLInputElement).value).not.toBe(antes);
    await user.click(screen.getByRole('button', { name: 'Ocultar' }));
    expect(screen.getByLabelText('Contraseña de acceso')).toHaveAttribute('type', 'password');
  });
});
