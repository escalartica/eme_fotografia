import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { featuredFrames, resolveFeaturedFrames } from '@/content/featured';
import { mosaicColumns } from '@/content/mosaic';
import { tamanoWebp } from '@/test-utils/webp';
import { SelectedReel } from './SelectedReel';

/**
 * La misma regla que aplica el componente: una fuente vertical se queda
 * vertical y una apaisada alterna entre 3:2 y cuadrada según su posición.
 * Se repite aquí, en vez de exportarla, a propósito -- un test que importa
 * la función que está comprobando sólo comprueba que la función se llama a
 * sí misma.
 */
function forma(f: { width: number; height: number }, i: number) {
  return f.width > f.height ? (i % 3 === 2 ? 'square' : 'landscape') : 'portrait';
}

const MAITE_PORTADA = '/images/trabajos/maite-y-nerea/cover.webp';

describe('el carrete de la home', () => {
  it('declara de cada fotograma el tamaño real de su fichero', () => {
    for (const f of featuredFrames) {
      expect({ src: f.src, ...tamanoWebp(f.src) }).toEqual({
        src: f.src,
        ancho: f.width,
        alto: f.height,
      });
    }
  });

  it('enseña una boda distinta en cada fotograma, y todas publicadas', () => {
    const resueltos = resolveFeaturedFrames();
    // flatMap descarta el fotograma cuyo proyecto no existe: si alguno se
    // cae, el carrete se queda corto en silencio.
    expect(resueltos).toHaveLength(featuredFrames.length);
    const bodas = resueltos.map((f) => f.project.slug);
    expect(new Set(bodas).size).toBe(bodas.length);
  });

  /**
   * La promesa que hace el comentario de content/featured.ts, y que sólo se
   * puede romper editando otro fichero: basta con meter en el mosaico del
   * hero una boda que ya esté aquí abajo para que quien baja por la portada
   * se cruce dos veces con la misma pareja.
   */
  it('no repite ninguna de las bodas del mosaico del hero', () => {
    const enElMosaico = new Set(mosaicColumns.map((c) => c.projectSlug));
    const repetidas = resolveFeaturedFrames()
      .map((f) => f.project.slug)
      .filter((slug) => enElMosaico.has(slug));
    expect(repetidas).toEqual([]);
  });

  it('no pone dos fotogramas de la misma forma seguidos', () => {
    // Sobre lo RESUELTO, que es lo que recorre el componente: si algún día se
    // cayera un proyecto, el índice de cada fotograma cambiaría y con él su
    // forma, y esta comprobación tiene que hablar de la tira que se pinta.
    const formas = resolveFeaturedFrames().map(forma);
    const seguidas = formas.filter((f, i) => i > 0 && f === formas[i - 1]);
    expect({ formas, seguidas }).toEqual({ formas, seguidas: [] });
  });

  /**
   * LA REGRESIÓN QUE ESTO IMPIDE: que la fotografía del perro vuelva al
   * carrete y se quede con el primer plano recortado.
   *
   * Es la foto que el estudio pidió tres veces ver en grande. El carrete
   * recorta las verticales de 2:3 a 3:4 --284 px de los 2560-- y lo que hace
   * gracia de ésta, el perro con pajarita sobre la corona de flores, está
   * pegado al borde de abajo: en ese marco se le muerde justo el chiste. Por
   * eso vive ahora entera junto a la entradilla de la sección, con la forma
   * de su fichero, y por eso el carrete abre con 01 -- vertical también, así
   * que el ritmo de formas de las once no se mueve.
   *
   * Esta prueba mira las dos mitades del trato: que la portada NO esté en el
   * carrete, y que SÍ esté en la entradilla con su enlace a la ficha.
   */
  it('deja la foto del perro fuera del carrete y la enseña entera en la entradilla', () => {
    expect(featuredFrames.map((f) => f.src)).not.toContain(MAITE_PORTADA);

    render(<SelectedReel />);
    const img = screen.getByAltText(/perro sentado en primer plano con pajarita/i);
    expect(img.getAttribute('src')).toContain(encodeURIComponent(MAITE_PORTADA));
    expect(img.closest('a')).toHaveAttribute('href', '/trabajos/maite-y-nerea');
  });

  /**
   * Y la boda sigue en el carrete: sacar la portada no podía costarle su
   * sitio a Maite y Nerea, sólo cambiarle la fotografía.
   */
  it('mantiene a Maite y Nerea en el carrete, con otra vertical', () => {
    const suyo = featuredFrames.find((f) => f.projectSlug === 'maite-y-nerea');
    expect(suyo).toBeDefined();
    expect(suyo!.height).toBeGreaterThan(suyo!.width);
  });

  it('monta los once enlaces, cada uno a su reportaje', () => {
    render(<SelectedReel />);
    const enlaces = screen.getAllByRole('link');
    for (const frame of resolveFeaturedFrames()) {
      expect(
        enlaces.some((a) => a.getAttribute('href') === `/trabajos/${frame.project.slug}`),
      ).toBe(true);
    }
  });

  /* La tira sigue abriendo con Maite y Nerea: es la boda que hace sonreír
     antes de que nadie haya leído un titular, y el ritmo de formas de las
     once (P L P L P S P L S L P) depende de que la primera sea vertical. */
  it('abre la tira con Maite y Nerea', () => {
    expect(featuredFrames[0].projectSlug).toBe('maite-y-nerea');
  });
});
