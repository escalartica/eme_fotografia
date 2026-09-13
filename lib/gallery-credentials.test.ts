import { describe, expect, it } from 'vitest';
import { MIN_PASSWORD_LENGTH, mensajeParaLaPareja, motivoPasswordDebil } from './gallery-credentials';

const EJEMPLO = {
  clientName: 'Jesús y Andrea',
  shareUrl: 'https://www.emefotografiasevilla.com/jesus-y-andrea',
  username: 'jesus-y-andrea',
  password: 'k7m3qr9tzb',
};

describe('motivoPasswordDebil', () => {
  it('rechaza la contraseña que se escribió en la primera galería real', () => {
    expect(motivoPasswordDebil('12345678')).toContain(`${MIN_PASSWORD_LENGTH} caracteres`);
  });

  it('rechaza diez dígitos, que ya pasan el mínimo de longitud', () => {
    expect(motivoPasswordDebil('1234567890')).toContain('solo números');
  });

  it('rechaza una secuencia seguida del teclado', () => {
    expect(motivoPasswordDebil('qwertyuiop')).toContain('secuencia');
    expect(motivoPasswordDebil('abcdefghij')).toContain('secuencia');
  });

  it('rechaza repetir siempre los mismos caracteres', () => {
    expect(motivoPasswordDebil('ababababab')).toContain('mismos caracteres');
  });

  it('acepta una contraseña generada', () => {
    expect(motivoPasswordDebil('k7m3qr9tzb')).toBeNull();
  });

  it('siempre dice qué hacer, no solo que está mal', () => {
    for (const mala of ['12345678', '1234567890', 'qwertyuiop', 'ababababab']) {
      expect(motivoPasswordDebil(mala)).toContain('Generar');
    }
  });
});

describe('mensajeParaLaPareja', () => {
  it('lleva el nombre, el enlace, el usuario y la contraseña', () => {
    const mensaje = mensajeParaLaPareja(EJEMPLO);
    expect(mensaje).toContain('Jesús y Andrea');
    expect(mensaje).toContain(EJEMPLO.shareUrl);
    expect(mensaje).toContain('Usuario: jesus-y-andrea');
    expect(mensaje).toContain('Contraseña: k7m3qr9tzb');
  });

  /**
   * El fallo que este test impide que vuelva: los párrafos estaban
   * partidos a mano y WhatsApp los mostraba con el corte en mitad de la
   * frase. Una línea larga que no termina en punto o en dos puntos es una
   * frase partida.
   */
  it('no parte las frases a mano: el móvil ya ajusta el ancho', () => {
    const lineas = mensajeParaLaPareja(EJEMPLO).split('\n');
    const parrafos = lineas.filter((linea) => linea.length > 60);
    expect(parrafos.length).toBeGreaterThan(0);
    for (const parrafo of parrafos) {
      expect(parrafo).toMatch(/[.:]$/);
    }
  });

  it('explica que se guarda solo, que es lo que hace que vuelvan', () => {
    expect(mensajeParaLaPareja(EJEMPLO)).toContain('Se va guardando solo');
  });
});
