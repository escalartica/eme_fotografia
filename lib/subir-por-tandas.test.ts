import { describe, it, expect, vi, afterEach } from 'vitest';
import { repartirEnTandas, FOTOS_POR_TANDA } from '@/lib/gallery-limits';
import { subirEnTandas, type RespuestaSubida } from '@/lib/subir-por-tandas';

function foto(i: number, size = 600_000): File {
  const f = new File(['x'], `foto-${i}.jpg`, { type: 'image/jpeg' });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

const ok: RespuestaSubida = { ok: true, status: 200, data: { ok: true } };
const sinEncoger = async (f: File) => f;

afterEach(() => {
  vi.useRealTimers();
});

describe('repartirEnTandas', () => {
  it('splits 1.200 photos into batches of FOTOS_POR_TANDA, keeping the order', () => {
    const fotos = Array.from({ length: 1200 }, (_, i) => foto(i));
    const tandas = repartirEnTandas(fotos);
    expect(tandas).toHaveLength(Math.ceil(1200 / FOTOS_POR_TANDA));
    expect(tandas.flat()).toEqual(fotos);
  });

  it('closes a batch early when it would pass the byte limit', () => {
    const fotos = [foto(1, 60), foto(2, 60), foto(3, 60)];
    expect(repartirEnTandas(fotos, 40, 100).map((t) => t.length)).toEqual([1, 1, 1]);
  });

  it('sends a single oversized photo on its own instead of getting stuck', () => {
    expect(repartirEnTandas([foto(1, 500)], 40, 100)).toHaveLength(1);
  });
});

describe('subirEnTandas', () => {
  it('uploads every photo, the first batch first, and reports the count', async () => {
    const enviadas: number[] = [];
    const r = await subirEnTandas({
      fotos: Array.from({ length: 1200 }, (_, i) => foto(i)),
      encoger: sinEncoger,
      alAvanzar: () => {},
      enviarTanda: async (tanda, indice) => {
        enviadas.push(indice);
        expect(tanda.length).toBeLessThanOrEqual(FOTOS_POR_TANDA);
        return ok;
      },
    });
    expect(r).toEqual({ ok: true, subidas: 1200 });
    expect(enviadas).toEqual(Array.from({ length: 30 }, (_, i) => i));
  });

  it('retries a batch after a network error with the SAME batch id', async () => {
    vi.useFakeTimers();
    const ids: string[] = [];
    let fallos = 1;
    const promesa = subirEnTandas({
      fotos: [foto(1)],
      encoger: sinEncoger,
      alAvanzar: () => {},
      enviarTanda: async (_t, _i, _p, idTanda) => {
        ids.push(idTanda);
        if (fallos-- > 0) throw new Error('red');
        return ok;
      },
    });
    await vi.runAllTimersAsync();
    expect(await promesa).toEqual({ ok: true, subidas: 1 });
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
  });

  it('stops at a 4xx without retrying and says how many made it', async () => {
    let llamadas = 0;
    const r = await subirEnTandas({
      fotos: Array.from({ length: 100 }, (_, i) => foto(i)),
      encoger: sinEncoger,
      alAvanzar: () => {},
      enviarTanda: async (_t, indice) => {
        llamadas += 1;
        return indice === 1 ? { ok: false, status: 400, data: { error: 'No es una foto.' } } : ok;
      },
    });
    expect(r).toEqual({ ok: false, subidas: FOTOS_POR_TANDA, error: 'No es una foto.', status: 400 });
    expect(llamadas).toBe(2);
  });

  it('turns an nginx 413 into a message that says what to do', async () => {
    const r = await subirEnTandas({
      fotos: [foto(1)],
      encoger: sinEncoger,
      alAvanzar: () => {},
      enviarTanda: async () => ({ ok: false, status: 413, data: null }),
    });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/resolución/);
  });
});
