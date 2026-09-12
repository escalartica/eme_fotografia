import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';
import { CAMPOS_ACTUALES, CAMPOS_HISTORICOS } from '@/lib/contact-store';

/**
 * LA POLÍTICA DE PRIVACIDAD TIENE QUE DECIR LA VERDAD.
 *
 * No es una página de relleno: el art. 13 del RGPD la convierte en una
 * declaración con consecuencias. Estuvo meses enumerando «número de invitados»
 * y «presupuesto» —campos que el formulario ya no pedía— y describiendo a los
 * proveedores como «alojamiento web, correo electrónico y la herramienta de
 * analítica», sin nombrar a ninguno. Ambas cosas son justo lo que una
 * inspección mira.
 *
 * Estos tests existen para que la página no vuelva a desincronizarse del
 * código en silencio.
 */
describe('/privacidad', () => {
  /**
   * JSX parte los párrafos largos en varias líneas y `textContent` conserva el
   * salto y la sangría, así que un patrón de dos palabras no casaría contra el
   * texto crudo. Se aplanan los espacios antes de comparar.
   */
  function textoRenderizado(): string {
    render(<Page />);
    return (document.body.textContent ?? '').replace(/\s+/g, ' ');
  }

  /** Cómo aparece cada campo del formulario redactado en la página. */
  const REDACCION: Record<string, RegExp> = {
    nombre: /nombre/i,
    email: /correo electrónico/i,
    telefono: /teléfono/i,
    fecha: /fecha/i,
    lugar: /lugar/i,
    tipoEvento: /cobertura/i,
    mensaje: /mensaje/i,
    comoNosConociste: /cómo nos conociste/i,
    consentimiento: /consentimiento/i,
  };

  it('declara todos los campos que el formulario recoge hoy', () => {
    // Si alguien añade un campo al formulario y no lo declara aquí, salta.
    expect(Object.keys(REDACCION).sort()).toEqual([...CAMPOS_ACTUALES].sort());

    const texto = textoRenderizado();
    for (const [campo, patron] of Object.entries(REDACCION)) {
      expect(texto, `el campo "${campo}" no está declarado en /privacidad`).toMatch(patron);
    }
  });

  it('no declara como recogidos los campos que ya no se piden', () => {
    const texto = textoRenderizado();
    expect(CAMPOS_HISTORICOS).toContain('numeroInvitados');
    expect(texto).not.toMatch(/número de invitados/i);
    expect(texto).not.toMatch(/presupuesto/i);
  });

  /* Art. 13.1.e: hay que identificar a los destinatarios, no describirlos por
     categorías. */
  it('nombra a los encargados del tratamiento, uno por uno', () => {
    const texto = textoRenderizado();
    expect(texto).toMatch(/IONOS/);
    expect(texto).toMatch(/Google/);
    // Resend se retiró el 13/09/2026 al pasar el correo al SMTP de IONOS. Si
    // alguien vuelve a nombrarlo aquí sin que el código lo use, esto lo dice.
    expect(texto).not.toMatch(/Resend/);
  });

  /* Art. 13.1.f: la transferencia internacional y su garantía.
     Desde que el correo va por el SMTP de IONOS, la ÚNICA salida posible del
     EEE es Google Analytics, y solo si la visitante acepta las cookies. La
     página tiene que decir las dos cosas: qué sale y con qué amparo. */
  it('dice qué sale del Espacio Económico Europeo y con qué garantía', () => {
    const texto = textoRenderizado();
    expect(texto).toMatch(/Espacio Económico Europeo/i);
    expect(texto).toMatch(/Marco de Privacidad de Datos/i);
    expect(texto).toMatch(/si rechazas las cookies, no hay ninguna transferencia internacional/i);
  });

  it('mantiene los apartados que la hacen accionable', () => {
    render(<Page />);
    for (const titulo of [/Responsable del tratamiento/i, /Conservación/i, /Destinatarios/i, /Tus derechos/i, /Seguridad/i]) {
      expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument();
    }
    // El derecho de supresión se ejerce escribiendo: la dirección tiene que
    // estar enlazada, no solo mencionada.
    expect(screen.getAllByRole('link', { name: /@/ }).length).toBeGreaterThan(0);
  });
});
