import { describe, it, expect } from 'vitest';
import { site } from './site';

/**
 * LOS DATOS QUE LA LEY OBLIGA A PUBLICAR.
 *
 * La LSSI-CE (art. 10) exige que un sitio comercial identifique a su titular
 * con nombre, NIF, domicilio y un medio de contacto. Durante un tiempo el
 * aviso legal y la política de privacidad decían «NIF: pendiente de indicar
 * por el titular» a la vista de cualquiera; esto está para que no vuelva a
 * pasar sin que nadie se entere.
 */
describe('identidad legal del titular', () => {
  it('publica todos los datos que exige la LSSI-CE', () => {
    expect(site.brandName).toBeTruthy();
    expect(site.legalNif).toBeTruthy();
    expect(site.streetAddress).toBeTruthy();
    expect(site.postalCode).toBeTruthy();
    expect(site.addressLocality).toBeTruthy();
    expect(site.email).toContain('@');
  });

  /**
   * La letra de un NIF no es decorativa: sale del número. Una errata al
   * teclearlo produce un documento que no existe, y va impreso en la página
   * que identifica legalmente al estudio.
   *
   * Algoritmo oficial: el número módulo 23 indexa la tabla de abajo. La tabla
   * omite I, Ñ, O y U a propósito, para que no se confundan con 1 y 0.
   */
  it('el NIF tiene la letra de control que le corresponde', () => {
    const TABLA = 'TRWAGMYFPDXBNJZSQVHLCKE';
    expect(site.legalNif).toMatch(/^\d{8}[A-Z]$/);
    const numero = Number(site.legalNif.slice(0, 8));
    expect(site.legalNif.slice(8)).toBe(TABLA[numero % 23]);
  });

  /* El marcador de «dato pendiente» existió y se retiró; que no vuelva
     callando. */
  it('no deja ningún dato legal sin rellenar', () => {
    for (const valor of [site.legalNif, site.streetAddress, site.postalCode, site.addressLocality]) {
      expect(valor).not.toMatch(/pendiente|por indicar|TODO|xxx/i);
    }
  });
});
