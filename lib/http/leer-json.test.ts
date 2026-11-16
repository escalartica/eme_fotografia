// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { leerJson, CuerpoDemasiadoGrande, MAX_JSON_PEQUENO } from './leer-json';

function peticion(cuerpo: BodyInit | null, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/x', { method: 'POST', body: cuerpo, headers });
}

/** Un cuerpo que llega a trozos y NO declara Content-Length, como un
 *  `Transfer-Encoding: chunked` de verdad. */
function enTrozos(trozos: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(ctrl) {
      if (i < trozos.length) ctrl.enqueue(enc.encode(trozos[i++]));
      else ctrl.close();
    },
  });
}

describe('leerJson', () => {
  it('devuelve el JSON cuando cabe', async () => {
    expect(await leerJson(peticion(JSON.stringify({ a: 1, b: 'ñ' })), 1024)).toEqual({ a: 1, b: 'ñ' });
  });

  it('acepta un cuerpo que mide exactamente el tope', async () => {
    const cuerpo = JSON.stringify('x'.repeat(98)); // 100 bytes con las comillas
    expect(await leerJson(peticion(cuerpo), 100)).toBe('x'.repeat(98));
  });

  it('rechaza sin leer nada cuando Content-Length ya pasa del tope', async () => {
    const req = peticion('{}', { 'content-length': String(MAX_JSON_PEQUENO + 1) });
    await expect(leerJson(req, MAX_JSON_PEQUENO)).rejects.toBeInstanceOf(CuerpoDemasiadoGrande);
    // No ha consumido el cuerpo: sigue sin usar.
    expect(req.bodyUsed).toBe(false);
  });

  it('corta mientras llega si el cuerpo no declara su tamaño', async () => {
    const req = new Request('http://localhost/api/x', {
      method: 'POST',
      body: enTrozos(['{"a":"', 'x'.repeat(60), 'x'.repeat(60), '"}']),
      // @ts-expect-error -- `duplex` hace falta en Node para mandar un stream
      duplex: 'half',
    });
    const err = await leerJson(req, 100).catch((e) => e);
    expect(err).toBeInstanceOf(CuerpoDemasiadoGrande);
    expect((err as CuerpoDemasiadoGrande).maxBytes).toBe(100);
  });

  it('lee bien un cuerpo en varios trozos que cabe', async () => {
    const req = new Request('http://localhost/api/x', {
      method: 'POST',
      body: enTrozos(['{"a":', '[1,2', ',3]}']),
      // @ts-expect-error -- ver arriba
      duplex: 'half',
    });
    expect(await leerJson(req, 100)).toEqual({ a: [1, 2, 3] });
  });

  it('lanza con un cuerpo vacío', async () => {
    await expect(leerJson(peticion(null), 100)).rejects.toThrow();
  });

  it('lanza con JSON roto', async () => {
    await expect(leerJson(peticion('{roto'), 100)).rejects.toBeInstanceOf(SyntaxError);
  });

  it('ignora un Content-Length que no es un número', async () => {
    const req = new Request('http://localhost/api/x', { method: 'POST', body: '[1]' });
    req.headers.set?.('content-length', 'abc');
    expect(await leerJson(req, 100)).toEqual([1]);
  });
});
