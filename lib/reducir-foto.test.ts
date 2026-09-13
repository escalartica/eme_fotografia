import { describe, it, expect, vi, afterEach } from 'vitest';
import { LADO_LARGO, reducirFoto } from './reducir-foto';

const FOTO = new File([new Uint8Array(3_000_000)], 'JD6A2648.jpg', { type: 'image/jpeg' });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('reducirFoto', () => {
  /**
   * LA GARANTÍA QUE IMPORTA. Encoger es una mejora, no un requisito: un
   * navegador que no sepa hacerlo, un fichero que el decodificador no entienda
   * o un canvas sin memoria no pueden costarle a eme la subida entera de una
   * boda. En jsdom no hay `createImageBitmap`, así que esta prueba recorre
   * justo ese camino.
   */
  it('devuelve el original si el navegador no sabe encoger', async () => {
    expect(await reducirFoto(FOTO)).toBe(FOTO);
  });

  it('devuelve el original si decodificar la foto falla', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('formato raro')));
    expect(await reducirFoto(FOTO)).toBe(FOTO);
  });

  it('2560, que es el escalón más alto que llega a servir el sitio', () => {
    expect(LADO_LARGO).toBe(2560);
  });
});
