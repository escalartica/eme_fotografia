import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * EL CONSENTIMIENTO DE COOKIES, que es lo que decide si Google Analytics se
 * carga o no. Lo que no puede pasar nunca: que GA se cargue sin un «Aceptar»
 * explícito, o que siga cargándose después de un «Rechazar».
 */

vi.mock('next/script', () => ({
  default: ({ src, id }: { src?: string; id?: string }) => <i data-testid="script" data-src={src ?? id} />,
}));

async function cargar(gaId: string | undefined) {
  vi.resetModules();
  if (gaId) vi.stubEnv('NEXT_PUBLIC_GA_ID', gaId);
  else vi.stubEnv('NEXT_PUBLIC_GA_ID', '');
  return import('./CookieConsent');
}

const CLAVE = 'eme-consent';

beforeEach(() => {
  localStorage.clear();
  document.body.removeAttribute('data-aviso-cookies');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('CookieConsent', () => {
  it('sin decisión enseña el aviso y NO carga Analytics', async () => {
    const { CookieConsent } = await cargar('G-TEST');
    render(<CookieConsent />);
    expect(await screen.findByRole('region', { name: 'Aviso de cookies' })).toBeInTheDocument();
    expect(screen.queryByTestId('script')).not.toBeInTheDocument();
  });

  it('Aceptar guarda la decisión, quita el aviso y carga Analytics', async () => {
    const { CookieConsent } = await cargar('G-TEST');
    render(<CookieConsent />);
    await userEvent.click(await screen.findByRole('button', { name: 'Aceptar' }));
    expect(screen.queryByRole('region', { name: 'Aviso de cookies' })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CLAVE)!).value).toBe('accepted');
    const scripts = screen.getAllByTestId('script').map((s) => s.getAttribute('data-src'));
    expect(scripts).toContain('https://www.googletagmanager.com/gtag/js?id=G-TEST');
  });

  it('Rechazar no carga nada', async () => {
    const { CookieConsent } = await cargar('G-TEST');
    render(<CookieConsent />);
    await userEvent.click(await screen.findByRole('button', { name: 'Rechazar' }));
    expect(JSON.parse(localStorage.getItem(CLAVE)!).value).toBe('rejected');
    expect(screen.queryByTestId('script')).not.toBeInTheDocument();
  });

  it('sin identificador de GA no carga nada aunque se acepte', async () => {
    const { CookieConsent } = await cargar(undefined);
    localStorage.setItem(CLAVE, JSON.stringify({ value: 'accepted', at: Date.now() }));
    render(<CookieConsent />);
    await act(async () => {});
    expect(screen.queryByTestId('script')).not.toBeInTheDocument();
  });

  it('recuerda la decisión, y la vuelve a pedir pasado un año', async () => {
    const { CookieConsent } = await cargar('G-TEST');
    localStorage.setItem(CLAVE, JSON.stringify({ value: 'accepted', at: Date.now() }));
    const { unmount } = render(<CookieConsent />);
    await waitFor(() => expect(screen.getAllByTestId('script').length).toBeGreaterThan(0));
    expect(screen.queryByRole('region', { name: 'Aviso de cookies' })).not.toBeInTheDocument();
    unmount();

    localStorage.setItem(CLAVE, JSON.stringify({ value: 'accepted', at: Date.now() - 400 * 24 * 3600 * 1000 }));
    render(<CookieConsent />);
    expect(await screen.findByRole('region', { name: 'Aviso de cookies' })).toBeInTheDocument();
  });

  it('un valor guardado roto cuenta como sin decidir', async () => {
    const { CookieConsent } = await cargar('G-TEST');
    localStorage.setItem(CLAVE, '{roto');
    render(<CookieConsent />);
    expect(await screen.findByRole('region', { name: 'Aviso de cookies' })).toBeInTheDocument();
  });

  it('marca el body mientras el aviso está a la vista', async () => {
    const { CookieConsent } = await cargar('G-TEST');
    render(<CookieConsent />);
    await screen.findByRole('region', { name: 'Aviso de cookies' });
    expect(document.body.hasAttribute('data-aviso-cookies')).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }));
    expect(document.body.hasAttribute('data-aviso-cookies')).toBe(false);
  });
});

describe('CookiePreferencesButton (página de cookies)', () => {
  it('deja cambiar de opinión en los dos sentidos y avisa al aviso', async () => {
    const { CookiePreferencesButton, CookieConsent } = await cargar('G-TEST');
    localStorage.setItem(CLAVE, JSON.stringify({ value: 'accepted', at: Date.now() }));
    render(
      <>
        <CookiePreferencesButton />
        <CookieConsent />
      </>
    );
    const boton = await screen.findByRole('button', { name: 'Rechazar cookies analíticas' });
    await waitFor(() => expect(screen.getAllByTestId('script').length).toBeGreaterThan(0));
    await userEvent.click(boton);
    expect(JSON.parse(localStorage.getItem(CLAVE)!).value).toBe('rejected');
    expect(await screen.findByRole('button', { name: 'Aceptar cookies analíticas' })).toBeInTheDocument();
    expect(screen.queryByTestId('script')).not.toBeInTheDocument();
  });
});
