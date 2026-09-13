import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ProteccionDeFotos } from './ProteccionDeFotos';

/**
 * Lo que se comprueba aquí es el LÍMITE de la protección tanto como la
 * protección: que el menú del botón derecho siga funcionando fuera de las
 * fotos. Bloquearlo en toda la página rompe abrir un enlace en otra pestaña o
 * copiar una dirección de correo, y convierte la web en una molestia.
 */
afterEach(cleanup);

function lanzarMenu(destino: Element): boolean {
  const evento = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
  destino.dispatchEvent(evento);
  return evento.defaultPrevented;
}

function lanzarArrastre(destino: Element): boolean {
  const evento = new Event('dragstart', { bubbles: true, cancelable: true });
  destino.dispatchEvent(evento);
  return evento.defaultPrevented;
}

describe('ProteccionDeFotos', () => {
  it('corta el menú del botón derecho sobre una foto', () => {
    render(
      <>
        <ProteccionDeFotos />
        <img src="/x.webp" alt="una foto" data-testid="foto" />
      </>
    );
    expect(lanzarMenu(document.querySelector('img')!)).toBe(true);
  });

  it('corta el arrastre, que en un Mac deja la foto en el escritorio sin avisar', () => {
    render(
      <>
        <ProteccionDeFotos />
        <img src="/x.webp" alt="una foto" />
      </>
    );
    expect(lanzarArrastre(document.querySelector('img')!)).toBe(true);
  });

  /* El evento no llega siempre a la imagen: casi todas las fotos del sitio
     llevan encima una capa de degradado o un botón transparente. */
  it('también cuando el clic cae en la capa que hay encima de la foto', () => {
    render(
      <>
        <ProteccionDeFotos />
        <picture>
          <img src="/x.webp" alt="una foto" />
          <span data-testid="capa">capa</span>
        </picture>
      </>
    );
    expect(lanzarMenu(document.querySelector('[data-testid="capa"]')!)).toBe(true);
  });

  it('NO toca el menú del resto de la página', () => {
    render(
      <>
        <ProteccionDeFotos />
        <p data-testid="texto">
          Escríbenos a <a href="mailto:info@example.com">info@example.com</a>
        </p>
      </>
    );
    expect(lanzarMenu(document.querySelector('[data-testid="texto"]')!)).toBe(false);
    expect(lanzarMenu(document.querySelector('a')!)).toBe(false);
  });

  it('deja de escuchar al desmontarse', () => {
    const { unmount } = render(
      <>
        <ProteccionDeFotos />
        <img src="/x.webp" alt="una foto" />
      </>
    );
    unmount();
    const suelta = document.createElement('img');
    document.body.appendChild(suelta);
    expect(lanzarMenu(suelta)).toBe(false);
    suelta.remove();
  });
});
