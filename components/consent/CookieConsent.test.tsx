import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CookieConsent } from './CookieConsent';

/**
 * EL AVISO NO PUEDE PINTARSE MIENTRAS LA PÁGINA ESTÁ INERTE.
 *
 * La secuencia de apertura marca con `inert` todo lo que hay fuera de ella
 * mientras se reproduce, y eso alcanza a este aviso. Durante 2,25 s los
 * botones se veían y no respondían; quien los pulsaba tenía que insistir
 * hasta que la secuencia terminaba. Esto fija que no aparezca hasta que se
 * pueda usar.
 */
describe('CookieConsent y las capas que inertizan la página', () => {
  beforeEach(() => {
    localStorage.clear();
    document.querySelectorAll('[data-capa]').forEach((el) => el.remove());
  });
  afterEach(() => {
    document.querySelectorAll('[data-capa]').forEach((el) => el.remove());
  });

  it('se pinta cuando no hay ninguna capa por encima', async () => {
    render(<CookieConsent />);
    expect(await screen.findByRole('button', { name: /aceptar/i })).toBeInTheDocument();
  });

  it('no se pinta mientras un hijo de <body> está inerte', async () => {
    const capa = document.createElement('div');
    capa.setAttribute('data-capa', '');
    capa.setAttribute('inert', '');
    document.body.appendChild(capa);

    render(<CookieConsent />);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /aceptar/i })).not.toBeInTheDocument();
    });
  });

  /* El caso que de verdad fallaba: la secuencia de apertura se monta DESPUÉS
     que el aviso, porque decide si se reproduce leyendo sessionStorage tras
     el primer render. Una comprobación al montar no la vería. */
  it('desaparece si la capa inerte llega después, y vuelve al quitarla', async () => {
    render(<CookieConsent />);
    expect(await screen.findByRole('button', { name: /aceptar/i })).toBeInTheDocument();

    const capa = document.createElement('div');
    capa.setAttribute('data-capa', '');
    capa.setAttribute('inert', '');
    document.body.appendChild(capa);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /aceptar/i })).not.toBeInTheDocument();
    });

    capa.removeAttribute('inert');
    expect(await screen.findByRole('button', { name: /aceptar/i })).toBeInTheDocument();
  });
});
