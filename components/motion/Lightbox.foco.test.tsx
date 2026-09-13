import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const activar = vi.fn();
const desactivar = vi.fn();
const crearTrampa = vi.fn(() => ({ activate: activar, deactivate: desactivar }));

vi.mock('focus-trap', () => ({ createFocusTrap: () => crearTrampa() }));

import { Lightbox } from './Lightbox';

/**
 * Un uso normal del componente: el `onClose` se escribe ahí mismo en el JSX
 * --así lo usan la galería privada y ProjectGallery--, así que es una función
 * distinta en cada renderizado, y dentro hay un campo que provoca un
 * renderizado por cada tecla.
 */
function VisorConNota() {
  const [texto, setTexto] = useState('');
  return (
    <Lightbox isOpen onClose={() => setTexto('')}>
      <textarea aria-label="Nota" value={texto} onChange={(e) => setTexto(e.target.value)} />
    </Lightbox>
  );
}

describe('Lightbox, la trampa de foco', () => {
  beforeEach(() => {
    crearTrampa.mockClear();
    activar.mockClear();
    desactivar.mockClear();
  });

  /**
   * LA REGRESIÓN QUE ESTO IMPIDE. El efecto que monta la trampa de foco
   * dependía de `onClose`. Como casi nadie pasa una función estable, cada
   * renderizado la desmontaba y la volvía a montar -- y `focus-trap`, al
   * activarse, lleva el foco al primer elemento enfocable.
   *
   * En jsdom eso no se ve (el campo vuelve a recibir el foco porque es el
   * único enfocable), pero en un iPhone cada `focus()` después de un blur
   * cierra el teclado: escribir una nota en el visor de la galería privada
   * era imposible, se cerraba con cada letra. Por eso lo que se comprueba
   * aquí es el churn, que es el defecto de verdad.
   */
  it('se monta una sola vez aunque quien la usa se renderice con cada tecla', async () => {
    const user = userEvent.setup();
    render(<VisorConNota />);
    const campo = screen.getByLabelText('Nota');
    await user.click(campo);
    await user.type(campo, 'preciosa');

    expect(campo).toHaveValue('preciosa');
    expect(crearTrampa).toHaveBeenCalledTimes(1);
    expect(activar).toHaveBeenCalledTimes(1);
    expect(desactivar).not.toHaveBeenCalled();
  });
});
