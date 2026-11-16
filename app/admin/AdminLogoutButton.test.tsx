import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

import { AdminLogoutButton } from './AdminLogoutButton';

const fetchMock = vi.fn();

beforeEach(() => {
  router.push.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AdminLogoutButton', () => {
  it('cierra la sesión en el servidor y vuelve al acceso', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"ok":true}'));
    render(<AdminLogoutButton />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin/login'));
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/logout', { method: 'POST' });
  });

  it('aunque la red falle, saca al usuario del panel', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    render(<AdminLogoutButton />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin/login'));
  });
});
