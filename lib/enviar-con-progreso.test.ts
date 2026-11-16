import { describe, it, expect, vi, afterEach } from 'vitest';
import { enviarConProgreso, mensajeDeError } from './subir-por-tandas';

/** Un XMLHttpRequest de mentira que deja disparar sus eventos a mano. */
class XhrFalso {
  static ultimo: XhrFalso;
  status = 0;
  responseText = '';
  metodo = '';
  url = '';
  enviado: unknown;
  private oyentes: Record<string, ((e: unknown) => void)[]> = {};
  upload = {
    oyentes: [] as ((e: unknown) => void)[],
    addEventListener: (_tipo: string, fn: (e: unknown) => void) => this.upload.oyentes.push(fn),
  };
  constructor() {
    XhrFalso.ultimo = this;
  }
  open(metodo: string, url: string) {
    this.metodo = metodo;
    this.url = url;
  }
  addEventListener(tipo: string, fn: (e: unknown) => void) {
    (this.oyentes[tipo] ??= []).push(fn);
  }
  send(cuerpo: unknown) {
    this.enviado = cuerpo;
  }
  emitir(tipo: string) {
    for (const fn of this.oyentes[tipo] ?? []) fn({});
  }
  progreso(loaded: number, total: number, lengthComputable = true) {
    for (const fn of this.upload.oyentes) fn({ loaded, total, lengthComputable });
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('enviarConProgreso', () => {
  it('manda el formulario por POST, avisa del progreso y lee la respuesta', async () => {
    vi.stubGlobal('XMLHttpRequest', XhrFalso);
    const form = new FormData();
    const progreso: number[] = [];
    const promesa = enviarConProgreso('/api/admin/galerias', form, (f) => progreso.push(f));
    const xhr = XhrFalso.ultimo;
    expect(xhr.metodo).toBe('POST');
    expect(xhr.url).toBe('/api/admin/galerias');
    expect(xhr.enviado).toBe(form);

    xhr.progreso(50, 100);
    xhr.progreso(10, 0); // total desconocido: no se avisa
    xhr.progreso(5, 10, false);
    xhr.status = 200;
    xhr.responseText = '{"slug":"ana"}';
    xhr.emitir('load');

    expect(await promesa).toEqual({ ok: true, status: 200, data: { slug: 'ana' } });
    expect(progreso).toEqual([0.5]);
  });

  it('una respuesta que no es JSON (el 413 de nginx) llega con data null', async () => {
    vi.stubGlobal('XMLHttpRequest', XhrFalso);
    const promesa = enviarConProgreso('/x', new FormData(), () => {});
    XhrFalso.ultimo.status = 413;
    XhrFalso.ultimo.responseText = '<html>413 Request Entity Too Large</html>';
    XhrFalso.ultimo.emitir('load');
    const res = await promesa;
    expect(res).toEqual({ ok: false, status: 413, data: null });
    expect(mensajeDeError(res)).toMatch(/subida tan grande/);
  });

  it('un fallo de red rechaza la promesa', async () => {
    vi.stubGlobal('XMLHttpRequest', XhrFalso);
    const promesa = enviarConProgreso('/x', new FormData(), () => {});
    XhrFalso.ultimo.emitir('error');
    await expect(promesa).rejects.toThrow('red');
  });
});

describe('mensajeDeError', () => {
  it('traduce cada caso a algo que se entiende', () => {
    expect(mensajeDeError({ ok: false, status: 0, data: null })).toMatch(/No se pudo conectar/);
    expect(mensajeDeError({ ok: false, status: 400, data: { error: 'No es una imagen.' } })).toBe('No es una imagen.');
    expect(mensajeDeError({ ok: false, status: 500, data: null })).toMatch(/no ha aceptado/);
  });
});
