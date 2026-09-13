// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { type Hit, finDelPeriodoAnterior, summarise, variacion } from './analytics-store';

/**
 * Estas cifras deciden en qué se gasta el estudio el dinero de los anuncios.
 * Hasta ahora el resumen no tenía una sola prueba: se pintaba en el panel y
 * quien lo mirara tenía que fiarse. Esto fija lo que significa cada número,
 * que es lo que permite discutirlo cuando una campaña sale mal.
 *
 * La hora de referencia es fija a propósito: `summarise` rellena el eje de
 * días contando hacia atrás desde `now`, así que sin fijarlo la prueba
 * cambiaría de resultado a medianoche.
 */
const AHORA = new Date('2026-09-14T12:00:00.000Z');

function hit(t: string, v: string, p: string, extra: Partial<Hit> = {}): Hit {
  return { t, p, r: 'directo', v, d: 'móvil', ...extra };
}

describe('summarise', () => {
  it('cuenta una visita por página vista y un visitante por código diario', () => {
    const s = summarise(
      [
        hit('2026-09-14T09:00:00.000Z', 'aaa', '/'),
        hit('2026-09-14T09:01:00.000Z', 'aaa', '/trabajos'),
        hit('2026-09-14T09:02:00.000Z', 'bbb', '/'),
      ],
      7,
      AHORA,
    );
    expect(s.pageViews).toBe(3);
    expect(s.visitors).toBe(2);
  });

  /**
   * El código del visitante cambia cada día a propósito (es lo que hace que
   * no haga falta consentimiento). La consecuencia es que la misma persona
   * dos días seguidos cuenta como dos, y eso hay que saberlo al leer el
   * panel, no descubrirlo comparando cifras que no cuadran.
   */
  it('la misma persona en dos días distintos cuenta dos veces', () => {
    const s = summarise(
      [hit('2026-09-13T09:00:00.000Z', 'aaa', '/'), hit('2026-09-14T09:00:00.000Z', 'aaa', '/')],
      7,
      AHORA,
    );
    expect(s.visitors).toBe(2);
  });

  /**
   * POR DÓNDE ENTRAN, que es lo que hace falta cuando se paga por el
   * tráfico. «Páginas más vistas» corona siempre la portada porque casi todo
   * el mundo pasa por ella; esto cuenta sólo la PRIMERA de cada visita.
   */
  it('cuenta la primera página de cada visita, no todas', () => {
    const s = summarise(
      [
        // Llega por la página de vídeo y luego pasa por la portada.
        hit('2026-09-14T09:05:00.000Z', 'aaa', '/'),
        hit('2026-09-14T09:00:00.000Z', 'aaa', '/servicios/video-de-boda'),
        // Otra persona entra por la portada.
        hit('2026-09-14T10:00:00.000Z', 'bbb', '/'),
      ],
      7,
      AHORA,
    );
    // Por clave y no por posición: las dos tienen una entrada, y con dos
    // cifras iguales el orden entre ellas lo decide un detalle interno del
    // recuento. Fijarlo sería una prueba que se rompe sola el día que se
    // toque ese detalle sin que nada haya cambiado para quien mira el panel.
    expect(Object.fromEntries(s.entradas.map((e) => [e.key, e.count]))).toEqual({
      '/': 1,
      '/servicios/video-de-boda': 1,
    });
    // Y la portada sigue siendo la más VISTA, que es otra cosa.
    expect(s.pages[0]).toEqual({ key: '/', count: 2 });
  });

  it('no se deja engañar por el orden en que llegan las líneas', () => {
    // El fichero del día se escribe por orden de llegada, pero `readHits`
    // junta varios días y nada garantiza el orden dentro del array.
    const s = summarise(
      [
        hit('2026-09-14T23:00:00.000Z', 'aaa', '/contacto'),
        hit('2026-09-14T08:00:00.000Z', 'aaa', '/trabajos'),
      ],
      7,
      AHORA,
    );
    expect(s.entradas).toEqual([{ key: '/trabajos', count: 1 }]);
  });

  it('reparte las visitas por hora del día', () => {
    const s = summarise(
      [
        hit('2026-09-14T09:00:00.000Z', 'aaa', '/'),
        hit('2026-09-14T09:30:00.000Z', 'bbb', '/'),
        hit('2026-09-14T22:00:00.000Z', 'ccc', '/'),
      ],
      7,
      AHORA,
    );
    expect(s.porHora).toHaveLength(24);
    expect(s.porHora[9].views).toBe(2);
    expect(s.porHora[22].views).toBe(1);
    expect(s.porHora[0].views).toBe(0);
  });

  it('agrupa las campañas utm y deja fuera las visitas sin etiquetar', () => {
    const s = summarise(
      [
        hit('2026-09-14T09:00:00.000Z', 'aaa', '/', { u: 'instagram / bio' }),
        hit('2026-09-14T09:10:00.000Z', 'bbb', '/', { u: 'instagram / bio' }),
        hit('2026-09-14T09:20:00.000Z', 'ccc', '/'),
      ],
      7,
      AHORA,
    );
    expect(s.campaigns).toEqual([{ key: 'instagram / bio', count: 2 }]);
  });

  it('deja el eje de días completo aunque algún día no tenga visitas', () => {
    const s = summarise([hit('2026-09-14T09:00:00.000Z', 'aaa', '/')], 7, AHORA);
    expect(s.perDay).toHaveLength(7);
    expect(s.perDay.at(-1)).toEqual({ day: '2026-09-14', views: 1, visitors: 1 });
    expect(s.perDay[0].views).toBe(0);
  });
});

describe('variacion', () => {
  it('da el porcentaje de subida o de bajada', () => {
    expect(variacion(130, 100)).toBe(30);
    expect(variacion(80, 100)).toBe(-20);
  });

  /**
   * De cero a diez no es «infinito por ciento»: es que antes no había nada,
   * y eso se cuenta con palabras. Devolver un número aquí llenaría el panel
   * de subidas del 100 % la semana del estreno, que es justo cuando el
   * estudio va a mirarlo.
   */
  it('no inventa un porcentaje cuando antes no había nada', () => {
    expect(variacion(10, 0)).toBeNull();
    expect(variacion(0, 0)).toBeNull();
  });
});

describe('finDelPeriodoAnterior', () => {
  it('retrocede justo el mismo número de días', () => {
    expect(finDelPeriodoAnterior(AHORA, 7).toISOString()).toBe('2026-09-07T12:00:00.000Z');
    expect(finDelPeriodoAnterior(AHORA, 30).toISOString()).toBe('2026-08-15T12:00:00.000Z');
  });
});
