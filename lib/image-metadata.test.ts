import { describe, it, expect } from 'vitest';
import { quitarMetadatosJpeg, quitarMetadatosPng, limpiarMetadatos } from './image-metadata';

/**
 * Estas pruebas construyen los ficheros byte a byte en vez de traer una foto
 * de ejemplo, y es a propósito: lo que hay que comprobar es que el recorte
 * respeta la ESTRUCTURA del formato, y con un fichero fabricado se puede
 * afirmar exactamente qué segmentos había antes y cuáles quedan después.
 * Una foto real sólo diría "pesa menos", que es justo lo que no basta saber
 * cuando lo que se recorta es la entrega de una boda.
 */

/** Un segmento JPEG: FF, marcador, largo de 2 bytes (incluido él mismo), datos. */
function segmento(marcador: number, datos: number[]): number[] {
  const largo = datos.length + 2;
  return [0xff, marcador, (largo >> 8) & 0xff, largo & 0xff, ...datos];
}

function jpegDePrueba(opciones: { exif?: boolean; iptc?: boolean; icc?: boolean } = {}): Uint8Array {
  const bytes: number[] = [0xff, 0xd8]; // SOI
  bytes.push(...segmento(0xe0, [0x4a, 0x46, 0x49, 0x46, 0x00])); // APP0 JFIF
  if (opciones.exif) {
    // APP1 con la cabecera "Exif\0\0" y algo dentro que haga de GPS.
    bytes.push(...segmento(0xe1, [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x47, 0x50, 0x53]));
  }
  if (opciones.icc) {
    bytes.push(...segmento(0xe2, [0x49, 0x43, 0x43, 0x5f])); // APP2 ICC_
  }
  if (opciones.iptc) {
    bytes.push(...segmento(0xed, [0x38, 0x42, 0x49, 0x4d])); // APP13 8BIM
  }
  bytes.push(...segmento(0xdb, [0x00, 0x01])); // tabla de cuantización
  bytes.push(0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00); // SOS
  bytes.push(0x12, 0x34, 0x56, 0x78); // datos comprimidos
  bytes.push(0xff, 0xd9); // EOI
  return new Uint8Array(bytes);
}

describe('quitarMetadatosJpeg', () => {
  it('quita el EXIF y deja el resto del fichero byte a byte', () => {
    const con = jpegDePrueba({ exif: true });
    const sin = jpegDePrueba();
    expect(Array.from(quitarMetadatosJpeg(con))).toEqual(Array.from(sin));
  });

  it('quita también el bloque de Photoshop (IPTC)', () => {
    const con = jpegDePrueba({ exif: true, iptc: true });
    const sin = jpegDePrueba();
    expect(Array.from(quitarMetadatosJpeg(con))).toEqual(Array.from(sin));
  });

  /**
   * El perfil de color NO es un dato personal y sin él los colores se
   * desplazan al abrir la foto en otro programa. En una entrega de boda eso
   * es un defecto visible, así que se queda.
   */
  it('conserva el perfil de color ICC', () => {
    const limpio = quitarMetadatosJpeg(jpegDePrueba({ exif: true, icc: true }));
    expect(Array.from(limpio)).toEqual(Array.from(jpegDePrueba({ icc: true })));
  });

  it('no toca un fichero que ya venía limpio', () => {
    const limpio = jpegDePrueba();
    expect(quitarMetadatosJpeg(limpio)).toBe(limpio);
  });

  /**
   * La regla de oro: ante un fichero que no se entiende, no se recorta a
   * ciegas. Un metadato de más es mejor que una foto rota.
   */
  it('devuelve el original intacto si el fichero no es un JPEG que entienda', () => {
    for (const basura of [
      new Uint8Array([]),
      new Uint8Array([0xff]),
      new Uint8Array([0x89, 0x50, 0x4e, 0x47]), // un PNG
      new Uint8Array([0xff, 0xd8, 0x00, 0x00, 0x00]), // no hay FF donde toca
    ]) {
      expect(quitarMetadatosJpeg(basura)).toBe(basura);
    }
  });

  it('devuelve el original si el fichero se acaba a media cabecera', () => {
    // Termina en FF FF sin llegar nunca al comienzo del barrido.
    const truncado = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x01, 0x02, 0xff, 0xff]);
    expect(quitarMetadatosJpeg(truncado)).toBe(truncado);
  });

  it('devuelve el original si un segmento declara un largo imposible', () => {
    // APP1 diciendo que mide 60.000 bytes en un fichero de veinte.
    const roto = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xea, 0x60, 0x00, 0x00]);
    expect(quitarMetadatosJpeg(roto)).toBe(roto);
  });

  /**
   * EL POLIZÓN. Los móviles y algunas cámaras pegan un SEGUNDO fichero detrás
   * del EOI: el JPEG extra de una ráfaga o de un HDR (MPF), o el vídeo de una
   * foto en movimiento. Ese fichero lleva su propio EXIF con su propio GPS,
   * así que copiar hasta el final del fichero limpiaba la cabecera y
   * arrastraba intacto el escondite.
   */
  it('corta en el EOI y no arrastra lo que venga pegado detrás', () => {
    const principal = jpegDePrueba({ exif: true });
    const segundo = jpegDePrueba({ exif: true });
    const pegados = new Uint8Array(principal.length + segundo.length);
    pegados.set(principal, 0);
    pegados.set(segundo, principal.length);

    // Limpiar los dos pegados tiene que dar exactamente lo mismo que limpiar
    // el primero a solas.
    expect(Array.from(quitarMetadatosJpeg(pegados))).toEqual(
      Array.from(quitarMetadatosJpeg(principal))
    );
  });

  it('conserva los datos comprimidos que van tras el comienzo del barrido', () => {
    const limpio = quitarMetadatosJpeg(jpegDePrueba({ exif: true }));
    const cola = Array.from(limpio.subarray(limpio.length - 6));
    expect(cola).toEqual([0x12, 0x34, 0x56, 0x78, 0xff, 0xd9]);
  });
});

/** Un trozo PNG: largo (4), tipo (4), datos, crc (4). */
function trozo(tipo: string, datos: number[]): number[] {
  const largo = datos.length;
  return [
    (largo >>> 24) & 0xff, (largo >>> 16) & 0xff, (largo >>> 8) & 0xff, largo & 0xff,
    ...[...tipo].map((c) => c.charCodeAt(0)),
    ...datos,
    0, 0, 0, 0, // crc de mentira: el recorte no lo mira ni lo recalcula
  ];
}

function pngDePrueba(opciones: { exif?: boolean; texto?: boolean } = {}): Uint8Array {
  const bytes: number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  bytes.push(...trozo('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0]));
  if (opciones.exif) bytes.push(...trozo('eXIf', [0x47, 0x50, 0x53]));
  bytes.push(...trozo('iCCP', [0x63, 0x6f, 0x6c]));
  if (opciones.texto) bytes.push(...trozo('tEXt', [0x41, 0x42]));
  bytes.push(...trozo('IDAT', [0x78, 0x9c, 0x63, 0x00]));
  bytes.push(...trozo('IEND', []));
  return new Uint8Array(bytes);
}

describe('quitarMetadatosPng', () => {
  it('quita el trozo eXIf y los de texto, y deja el resto igual', () => {
    const con = pngDePrueba({ exif: true, texto: true });
    const sin = pngDePrueba();
    expect(Array.from(quitarMetadatosPng(con))).toEqual(Array.from(sin));
  });

  it('conserva el perfil de color iCCP', () => {
    const limpio = quitarMetadatosPng(pngDePrueba({ exif: true }));
    const comoTexto = new TextDecoder('latin1').decode(limpio);
    expect(comoTexto).toContain('iCCP');
    expect(comoTexto).not.toContain('eXIf');
  });

  it('no toca un fichero que ya venía limpio', () => {
    const limpio = pngDePrueba();
    expect(quitarMetadatosPng(limpio)).toBe(limpio);
  });

  /**
   * La promesa del módulo es que un fichero sin metadatos sale byte a byte
   * como entró. Sin esto, una cola cualquiera detrás del IEND se perdía --y
   * el fichero cambiaba-- aunque no hubiera nada que limpiar.
   */
  it('no toca lo que venga detrás del IEND', () => {
    const conCola = new Uint8Array([...pngDePrueba(), 1, 2, 3, 4, 5]);
    expect(quitarMetadatosPng(conCola)).toBe(conCola);

    const sucio = new Uint8Array([...pngDePrueba({ exif: true }), 1, 2, 3, 4, 5]);
    const limpio = new Uint8Array([...pngDePrueba(), 1, 2, 3, 4, 5]);
    expect(Array.from(quitarMetadatosPng(sucio))).toEqual(Array.from(limpio));
  });

  it('devuelve el original si un PNG se queda a medias, sin recortarlo a ciegas', () => {
    const truncado = pngDePrueba({ exif: true }).slice(0, 40);
    expect(quitarMetadatosPng(truncado)).toBe(truncado);
  });

  it('devuelve el original si no es un PNG que entienda', () => {
    const basura = new Uint8Array([0xff, 0xd8, 0xff]);
    expect(quitarMetadatosPng(basura)).toBe(basura);
  });
});

describe('limpiarMetadatos', () => {
  /**
   * Lo que de verdad garantiza esta función: pase lo que pase --sharp no está,
   * el fichero es basura, la memoria se acaba-- devuelve bytes. Nunca lanza,
   * porque lo que hay al otro lado es la subida de una boda entera.
   */
  it('nunca lanza y siempre devuelve bytes, aunque el fichero sea basura', async () => {
    const basura = new Uint8Array([1, 2, 3, 4, 5]);
    await expect(limpiarMetadatos(basura, 'jpg')).resolves.toBeInstanceOf(Uint8Array);
    await expect(limpiarMetadatos(basura, 'png')).resolves.toBeInstanceOf(Uint8Array);
    await expect(limpiarMetadatos(basura, 'webp')).resolves.toBeInstanceOf(Uint8Array);
    await expect(limpiarMetadatos(basura, 'avif')).resolves.toBeInstanceOf(Uint8Array);
  });
});
