import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileMenu } from './MobileMenu';

// SIN LA ANIMACIÓN DE ENTRADA, y no por comodidad.
//
// Este fichero comprueba la TRAMPA DE FOCO. La animación de entrada del panel
// es un `gsap.fromTo` con `stagger` que dura más de medio segundo y que, ahí
// dentro, le pone a las cinco filas del menú un `transform` y una `opacity`
// en línea que luego retira con `clearProps`. O sea que durante los primeros
// cientos de milisegundos las filas están en un estado transitorio, y cada
// `await user.tab()` cede al bucle de eventos: lo que hay en el DOM cuando se
// pulsa el tabulador depende del reloj de la máquina.
//
// Eso convirtió esta prueba en intermitente: en una máquina rápida pasaba
// siempre y en una cargada el foco inicial no caía donde se esperaba, con un
// fallo que señalaba al enlace de correo del pie y no decía nada de la causa.
// `prefers-reduced-motion` apaga la animación entera, que no es lo que se
// está comprobando aquí, y deja el panel quieto desde el primer fotograma.
// Mismo motivo por el que app/(site)/page.test.tsx lo simula.
vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

describe('MobileMenu', () => {
  it('opens on button click and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MobileMenu isOpen onClose={onClose} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('pone el foco en el primer enlace del menú al abrirse', () => {
    render(<MobileMenu isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveFocus();
  });

  /**
   * EL CONTRATO ES «EL FOCO NO SE ESCAPA», y eso es lo que se comprueba: en
   * cada parada, no al final.
   *
   * Antes se tabulaba `links.length` veces y se exigía volver EXACTAMENTE al
   * primer enlace. Es aritmética modular sobre un número de paradas que la
   * prueba no controla: basta con que el panel gane o pierda un elemento
   * enfocable --o con que uno esté transitoriamente fuera de la lista-- para
   * que falle señalando un enlace cualquiera, sin que el foco se haya
   * escapado a ningún sitio. Comprobar la pertenencia al panel en cada vuelta
   * es más estricto (no deja pasar una sola fuga) y no depende de cuántas
   * paradas haya.
   */
  it('traps Tab navigation to the panel instead of letting focus escape to the rest of the document', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Outside link before</button>
        <MobileMenu isOpen onClose={vi.fn()} />
        <button>Outside link after</button>
      </>
    );
    const panel = screen.getByRole('dialog');
    const links = screen.getAllByRole('link');

    // Una vuelta entera y una parada más, para cruzar el punto en el que el
    // foco tiene que dar la vuelta en vez de salirse por el final.
    for (let i = 0; i <= links.length; i++) {
      await user.tab();
      expect(panel).toContainElement(document.activeElement as HTMLElement);
    }
    expect(screen.getByText('Outside link before')).not.toHaveFocus();
    expect(screen.getByText('Outside link after')).not.toHaveFocus();
  });

  /**
   * EL PANEL CUELGA DEL <body>, NO DE LA CABECERA. Es la prueba de la
   * regresión que el estudio vio en su teléfono.
   *
   * En el marcado, <MobileMenu> vive dentro de <header>. Y la cabecera se
   * vuelve un cristal esmerilado en cuanto se baja un poco:
   * `backdrop-filter: blur(12px)`. Un `backdrop-filter` crea BLOQUE
   * CONTENEDOR para los descendientes `position: fixed` --igual que `filter`
   * o `transform`--, así que el `inset: 0` del panel dejaba de medirse contra
   * la ventana y pasaba a medirse contra la barra: el menú se encogía al alto
   * de la cabecera, con las cinco filas y el pie amontonados dentro y la
   * página asomando debajo. Desde arriba del todo abría bien --ahí la barra
   * aún no tiene cristal--, y por eso tardó meses en salir.
   *
   * CSS no se ejecuta en jsdom, así que esto no puede comprobar el síntoma;
   * comprueba la causa, que es lo único que hay que conservar: que el panel
   * no esté dentro de su padre de React.
   */
  it('se pinta colgando del <body> y no dentro de la cabecera', () => {
    const { container } = render(
      <header data-cabecera>
        <MobileMenu isOpen onClose={vi.fn()} />
      </header>
    );
    const panel = screen.getByRole('dialog');
    expect(panel.parentElement).toBe(document.body);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(panel.closest('[data-cabecera]')).toBeNull();
  });

  /**
   * Y avisa al resto del sitio de que hay una capa tapando la pantalla, que
   * es de lo que viven el botón de WhatsApp, el de volver arriba y el aviso
   * de cookies para apartarse: los tres flotan por encima de todo y se
   * pintaban por delante de la navegación.
   */
  it('marca el documento mientras está abierto, y lo desmarca al cerrarse', () => {
    const { rerender, unmount } = render(<MobileMenu isOpen onClose={vi.fn()} />);
    expect(document.body.getAttribute('data-capa-completa')).toBe('menu');

    rerender(<MobileMenu isOpen={false} onClose={vi.fn()} />);
    expect(document.body.hasAttribute('data-capa-completa')).toBe(false);

    unmount();
    expect(document.body.hasAttribute('data-capa-completa')).toBe(false);
  });

  /**
   * LA PÁGINA EN LA QUE YA SE ESTÁ. Abrir el menú y no saber dónde estás era
   * la mitad del problema de orientación de este panel; lo pide además la
   * pauta de navegación (WCAG 2.4.8).
   *
   * La ruta llega por props desde la cabecera y NO se lee aquí con
   * `usePathname`: el gancho devuelve `null` fuera del contexto del
   * enrutador, que es exactamente donde se monta este componente en estas
   * pruebas.
   */
  it('marca la página actual, y sólo esa', () => {
    render(<MobileMenu isOpen onClose={vi.fn()} currentPath="/trabajos" />);
    expect(screen.getByRole('link', { name: /^Trabajos/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('marca Trabajos también dentro de un reportaje, pero no marca Inicio en todas partes', () => {
    // `/` es prefijo de todo: sin la excepción, «Inicio» salía marcado en
    // cada página del sitio.
    render(<MobileMenu isOpen onClose={vi.fn()} currentPath="/trabajos/eva-y-rafa" />);
    expect(screen.getByRole('link', { name: /^Trabajos/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  /**
   * EL PANEL YA NO DESAPARECE EN UN FOTOGRAMA. Con movimiento reducido --que
   * es lo que este fichero simula-- sí se desmonta al instante, que es la
   * respuesta correcta para quien ha pedido que no se mueva nada; la
   * animación de salida de los otros SALIDA_MS sólo existe para el resto.
   * Lo que esta prueba fija es que el desmontaje llega, que es de lo que
   * depende que el candado del scroll se suelte y que el foco vuelva al
   * botón de la cabecera.
   */
  it('se desmonta al cerrarse, sin dejar el panel encima de la página', () => {
    const { rerender } = render(<MobileMenu isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<MobileMenu isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Y la página de debajo recupera su scroll.
    expect(document.body.style.overflowY).not.toBe('hidden');
  });

  /**
   * Y en el otro sentido: Mayúsculas+Tab desde el primer enlace tiene que
   * saltar al último del panel, no al botón que hay antes en el documento.
   */
  it('tampoco se escapa hacia atrás con Mayúsculas+Tab', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Outside link before</button>
        <MobileMenu isOpen onClose={vi.fn()} />
        <button>Outside link after</button>
      </>
    );
    const panel = screen.getByRole('dialog');
    await user.tab({ shift: true });
    expect(panel).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByText('Outside link before')).not.toHaveFocus();
  });
});
