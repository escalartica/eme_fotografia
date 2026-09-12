import { Fragment } from 'react';
import styles from './RevealWords.module.css';

/**
 * Un titular que se revela PALABRA A PALABRA desde detrás de una máscara,
 * guiado por el scroll y sin una sola línea de JavaScript.
 *
 * De dónde sale. El gesto ya existía, hecho a mano, dentro de
 * `components/sections/CtaContacto` para la frase de cierre de la home. Era
 * la mejor animación de tipografía del proyecto y la única de su clase, así
 * que estaba a la vez infrautilizada (una frase en toda la web) y condenada
 * a divergir en cuanto alguien la copiase a otra sección. Esto es esa misma
 * animación extraída: mismo recorrido, mismo escalonado y misma doble
 * puerta, ahora en un solo sitio.
 *
 * Las reglas que hereda de `ScrollReveal`, y que son innegociables:
 *
 *  - EL TEXTO SE VE EN REPOSO. No hay ningún `opacity: 0` de partida en el
 *    CSS. La animación se declara con `animation-timeline: view()`, que el
 *    navegador ejecuta en el compositor, y va detrás de DOS puertas
 *    (`prefers-reduced-motion: no-preference` y `@supports`). Donde no se
 *    soporta, la declaración ni se lee y el titular está ahí, entero. En la
 *    web de una fotógrafa un titular invisible es peor que ningún efecto.
 *  - Solo `transform` y `opacity`.
 *  - Componente de servidor: cero JavaScript en el cliente.
 *
 * El escalonado se hace corriendo el TRAMO DE SCROLL de cada palabra, no con
 * `animation-delay`: en una animación guiada por el scroll el retardo no
 * significa tiempo, significa posición, y `delay` sencillamente no se aplica.
 *
 * Uso: el componente no envuelve nada, devuelve las palabras sueltas, así que
 * el `<h2>`, el `<p>` o el `<span>` que las contiene sigue siendo del que
 * llama (con su id, sus `composes` y su `text-wrap`).
 *
 *   <h2 className={styles.statement}>
 *     <RevealWords
 *       segments={[{ text: 'Menos protocolo. Más ' }, { text: 'verdad', em: true }, { text: '.' }]}
 *       emClassName={styles.emphasis}
 *     />
 *   </h2>
 */

/**
 * Un tramo del titular. `em` lo pone en la cursiva de verdad de la familia
 * (el único recurso de énfasis del sitio, ver `.displayEm` en
 * styles/layout.css).
 *
 * Los tramos se CONCATENAN TAL CUAL y luego se parten por espacios. Dos
 * consecuencias, y las dos importan:
 *
 *  - Un tramo puede acabar a mitad de palabra, y eso es justo lo que permite
 *    que `verdad` vaya en <em> y el punto que le sigue NO -- que es como está
 *    escrito el manifiesto y lo que comprueba su test.
 *  - Por lo mismo, EL ESPACIO QUE SEPARA DOS TRAMOS TIENE QUE ESTAR DENTRO DE
 *    UNO DE ELLOS. `[{text: 'Bodas reales,'}, {text: 'historias...'}]` no da
 *    dos palabras: da una, "reales,historias", y la frase pierde su espacio
 *    también para quien la copie o la escuche.
 */
export type RevealSegment = { text: string; em?: boolean };

type Run = { text: string; em: boolean };

/** Concatena los tramos y los reparte en palabras, conservando de qué tramo
 *  viene cada trozo. Una palabra puede tener más de un trozo. */
function toWords(segments: RevealSegment[]): Run[][] {
  const words: Run[][] = [];
  let current: Run[] = [];
  for (const segment of segments) {
    const em = segment.em === true;
    for (const piece of segment.text.split(/(\s+)/)) {
      if (piece === '') continue;
      if (/^\s+$/.test(piece)) {
        if (current.length > 0) {
          words.push(current);
          current = [];
        }
        continue;
      }
      current.push({ text: piece, em });
    }
  }
  if (current.length > 0) words.push(current);
  return words;
}

/**
 * EL ESCALÓN SE AJUSTA AL LARGO DEL TITULAR, y esto no es un refinamiento:
 * es lo que impide que el gesto se vuelva el defecto que pretende evitar.
 *
 * El tramo base de una palabra va de `entry 8%` a `entry 58%` y cada palabra
 * corre su tramo un escalón más abajo. Con cinco puntos por palabra --el
 * valor con el que nació esto, pensado para frases de seis-- un titular de
 * doce palabras deja la última corriendo de `entry 63%` a `entry 113%`: se
 * termina de resolver DESPUÉS de estar entera a la vista, que es literalmente
 * lo que RevealWords.module.css dice que hay que evitar («se lee como una
 * página que no ha terminado de cargar»).
 *
 * Así que el escalón se reparte: 5 puntos mientras quepan, y por debajo de
 * eso lo que haga falta para que la última palabra cierre en el 88% como
 * mucho. Un suelo de 1,2 para que en una frase larguísima siga leyéndose como
 * cascada y no como un bloque.
 */
export function pasoPara(palabras: number): number {
  if (palabras <= 1) return 5;
  return Math.max(1.2, Math.min(5, 30 / (palabras - 1)));
}

export function RevealWords({
  segments,
  emClassName,
  offset = 0,
  paso,
}: {
  segments: RevealSegment[];
  /** Clase para los tramos en cursiva. Normalmente `composes: displayEm from global`. */
  emClassName?: string;
  /**
   * Empieza el escalonado en esta posición en vez de en la primera palabra.
   * Para un titular partido en dos elementos que debe leerse como uno solo.
   */
  offset?: number;
  /**
   * Escalón por palabra, en puntos de tramo. Normalmente no hace falta: se
   * calcula solo (ver `pasoPara`). Se pasa a mano sólo para encadenar dos
   * mitades de un mismo titular con el mismo escalón.
   */
  paso?: number;
}) {
  const words = toWords(segments);
  const step = paso ?? pasoPara(words.length + offset);
  return (
    <>
      {words.map((runs, i) => (
        // El índice es la clave legítima aquí: la lista es estática, sale de
        // una constante en tiempo de compilación y nunca se reordena.
        <Fragment key={i}>
          {/* El espacio va FUERA de la ventana de cada palabra, como texto de
              verdad. Si se sustituye por un margen, el titular pierde sus
              espacios: un lector de pantalla lee una única palabra ilegible y
              quien copie la frase se la lleva toda pegada. */}
          {i > 0 ? ' ' : null}
          <span className={styles.word}>
            <span
              className={styles.wordInner}
              style={{ ['--i' as string]: i + offset, ['--paso' as string]: step }}
            >
              {runs.map((run, j) =>
                run.em ? (
                  <em key={j} className={emClassName}>
                    {run.text}
                  </em>
                ) : (
                  <Fragment key={j}>{run.text}</Fragment>
                )
              )}
            </span>
          </span>
        </Fragment>
      ))}
    </>
  );
}
