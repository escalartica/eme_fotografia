import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';
import { site } from '@/content/site';

describe('/sobre-nosotros page', () => {
  // ShowreelClip.tsx calls the real <video>.play() on mount -- jsdom has no
  // real media pipeline, so it returns undefined instead of a Promise.
  beforeAll(() => {
    (window.HTMLMediaElement.prototype as unknown as { play: () => Promise<void> }).play = () => Promise.resolve();
  });

  it('speaks in the studio voice and names the founder', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EME Fotografía Sevilla');
    // El apartado de equipo se busca por lo que DICE su titular, no por la
    // palabra «Equipo»: esa pasó a ser el antetítulo el día que el titular
    // dejó de ser una etiqueta y pasó a decir algo.
    expect(screen.getByRole('heading', { name: /trabajan juntas todo el año/i })).toBeInTheDocument();
    expect(screen.getByText('Equipo')).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(site.founderName)).length).toBeGreaterThan(0);
  });

  /**
   * EL CAPÍTULO 01 YA NO ES UN PÁRRAFO DE CIENTO TREINTA PALABRAS.
   * El estudio lo señaló como «largo y tedioso de leer»; esto fija la forma
   * que lo sustituye, que es lo que se rompería si alguien volviera a
   * juntarlo todo en un bloque.
   */
  it('cuenta el 01 en tres bloques con su propio rótulo, no en un párrafo', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: 'Quién soy' })).toBeInTheDocument();
    for (const rotulo of ['El origen y la escuela', 'Quince años después', '¿Dónde estamos?']) {
      expect(screen.getByRole('heading', { name: rotulo })).toBeInTheDocument();
    }
    // Los créditos siguen ahí, fuera del párrafo: es la parte comprobable de
    // todo el capítulo. Se buscan dos nombres que SOLO estén en la tira --
    // «El Correo de Andalucía» sale también dentro del texto del bloque, así
    // que no distinguiría una cosa de la otra.
    expect(screen.getByText(/Beret/)).toBeInTheDocument();
    expect(screen.getByText(/Balbino Bernal/)).toBeInTheDocument();
    expect(screen.getByText(/Spagnolo/)).toBeInTheDocument();
  });

  /**
   * La segunda mitad del titular estaba DOS veces en el documento: impresa
   * sobre la fotografía en aria-hidden y otra vez en un sr-only para que el
   * lector de pantalla la oyera. Ahora es un solo tramo visible.
   */
  it('no repite la segunda mitad del titular', () => {
    render(<Page />);
    // Se cuenta sobre el TEXTO del <h1>, no con getByText: desde que el
    // titular se revela palabra a palabra, la frase ya no es el texto directo
    // de ningún elemento --cada palabra vive en su propia ventana-- y
    // getByText, que sólo mira los nodos de texto hijos, no encontraría nada.
    // Lo que esta prueba vigila no es dónde está la frase sino que esté UNA
    // vez, así que el texto completo del encabezado es la medida correcta.
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent?.match(/Vuestra boda tampoco/g)).toHaveLength(1);
  });

  /**
   * LA CITA VA ATRIBUIDA. Es una frase de otra persona publicada en la web de
   * un estudio: lo que no puede pasar es que se quede el texto y desaparezca
   * el nombre, ni al revés. Y va en <blockquote> dentro de un <figure> con su
   * <figcaption>, que es como la norma dice que se cita.
   */
  it('publica la cita con su autor y marcada como cita', () => {
    const { container } = render(<Page />);
    const cita = container.querySelector('figure blockquote');
    expect(cita?.textContent).toBe(
      'Fotografiar es poner la cabeza, el ojo y el corazón sobre la misma línea de mira.',
    );
    expect(cita?.closest('figure')?.querySelector('figcaption')?.textContent).toBe(
      'Henri Cartier-Bresson',
    );
  });

  it('has no placeholder copy left', () => {
    render(<Page />);
    expect(screen.queryByText(/pendiente de/i)).not.toBeInTheDocument();
  });

  it('walks through mirada, proceso, showreel and figures', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /nuestra mirada/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cómo trabajamos/i })).toBeInTheDocument();
    /* El capítulo 05 se buscaba por «en movimiento», que era parte del
       titular y el estudio la retiró: prometía metraje de vídeo donde hay un
       montaje de fotografías fijas. Se busca por el titular de ahora.
       Por `getByRole` y no por `getByText`: el titular va envuelto en
       RevealWords, que parte la frase en una caja por palabra, y `getByText`
       sólo mira los nodos de texto hijos directos -- no encontraría nada.
       El nombre accesible sí se compone del texto completo. */
    expect(
      screen.getByRole('heading', { name: /pasad las fotos muy deprisa/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /cifras/i })).toBeInTheDocument();
  });
});
