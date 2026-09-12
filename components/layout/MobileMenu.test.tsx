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
