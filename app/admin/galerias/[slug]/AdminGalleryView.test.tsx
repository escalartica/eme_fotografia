import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// GalleryAdminActions, que esta vista monta al final, llama a `useRouter`, y
// fuera del App Router next/navigation lanza «invariant expected app router to
// be mounted». No se está probando la navegación, así que basta un doble.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

import { AdminGalleryView } from './AdminGalleryView';
import type { GalleryPhoto, SelectionItem } from '@/lib/gallery-store';

const FOTOS: GalleryPhoto[] = [
  { id: 'a', filename: '4E6A7166.webp', alt: 'La corbata del novio' },
  { id: 'b', filename: '4E6A7548.webp', alt: 'La novia junto a la ventana' },
  { id: 'c', filename: '4E6A8655.webp', alt: 'Los novios por la galería' },
];

const SELECCION: SelectionItem[] = [
  { photoId: 'a', liked: true, comment: '' },
  { photoId: 'b', liked: false, comment: 'Esta en blanco y negro, por favor' },
  { photoId: 'c', liked: true, comment: 'Aquí sale mi abuela' },
];

function pintar(items: SelectionItem[] = SELECCION) {
  return render(
    <AdminGalleryView
      slug="jesus-y-andrea"
      clientName="Jesús y Andrea"
      username="jesus-y-andrea"
      shareUrl="https://www.emefotografiasevilla.com/jesus-y-andrea"
      photos={FOTOS}
      items={items}
      submittedAt="2026-09-13T10:00:00.000Z"
      enCurso={false}
      updatedAt={null}
    />
  );
}

describe('AdminGalleryView', () => {
  it('enseña las tres fotos y marca cuáles gustaron', () => {
    pintar();
    expect(screen.getByRole('button', { name: /La corbata del novio — seleccionada/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'La novia junto a la ventana' })).toBeInTheDocument();
  });

  /**
   * Una boda son ciento ochenta fotos y la pareja marca treinta: sin filtro
   * hay que bajar por las ciento ochenta buscando corazones.
   */
  it('deja ver solo las marcadas', async () => {
    const user = userEvent.setup();
    pintar();
    await user.click(screen.getByRole('button', { name: /Marcadas/ }));

    expect(screen.getByRole('button', { name: /La corbata del novio/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Los novios por la galería/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'La novia junto a la ventana' })).not.toBeInTheDocument();
  });

  it('deja ver solo las que llevan nota, aunque no estén marcadas', async () => {
    const user = userEvent.setup();
    pintar();
    await user.click(screen.getByRole('button', { name: /Con nota/ }));

    expect(screen.getByRole('button', { name: 'La novia junto a la ventana' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /La corbata del novio/ })).not.toBeInTheDocument();
  });

  /**
   * Lo siguiente que pasa después de mirar esto es abrir el revelador y
   * buscar esas fotos en la tarjeta: los nombres de fichero son el puente.
   */
  it('copia los nombres de fichero de las marcadas, uno por línea', async () => {
    const user = userEvent.setup();
    pintar();
    await user.click(screen.getByRole('button', { name: /Copiar los nombres/ }));

    // El portapapeles lo pone `userEvent.setup()`; se le pregunta a él, que
    // es lo que de verdad quedó copiado.
    expect(await navigator.clipboard.readText()).toBe('4E6A7166.webp\n4E6A8655.webp');
    expect(await screen.findByRole('button', { name: 'Nombres copiados' })).toBeInTheDocument();
  });

  it('sin selección todavía, ni filtros ni botón de copiar', () => {
    pintar([]);
    expect(screen.queryByRole('button', { name: /Marcadas/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copiar los nombres/ })).not.toBeInTheDocument();
  });
});
