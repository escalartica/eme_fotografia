import { RevealWords } from '@/components/motion/RevealWords';
import styles from './Manifiesto.module.css';

/**
 * The positioning statement, rebuilt as a stack of sticky rows -- the
 * mechanic Agentura uses for its own statement band (`section.framer-1ygmxqy`
 * on agentura.framer.website, inspected directly: three children, each
 * `position: sticky; top: 0`, inside a section whose height is just the sum
 * of the rows). Each row pins in turn and the next one climbs over it, so
 * three statements are delivered in the scroll distance of three rows
 * instead of three screens.
 *
 * Why this replaces what was here. The section used to be a single sentence
 * centred inside a StackedSections panel, which meant `min-height: 100svh`
 * for one line of type: a whole screen of paper with an eyebrow floating in
 * the middle of it. It is now three statements in roughly 70svh, so the home
 * page gets shorter AND says more in that space. It also comes out of
 * StackedSections in app/(site)/page.tsx -- a pinned panel is exactly what
 * was forcing the empty viewport.
 *
 * No JavaScript at all now. The scrubbed per-character SplitText reveal that
 * used to run here needed GSAP, ScrollTrigger, SplitText, a `document.fonts
 * .ready` gate and a reduced-motion branch to animate one sentence; the
 * stacking IS the effect, and `position: sticky` does it in the compositor.
 * That makes this a Server Component and takes the whole animation layer for
 * this section off the client bundle.
 *
 * Eso sigue siendo cierto con el revelado por palabras que ahora traen los
 * tres enunciados: `components/motion/RevealWords` es también un componente
 * de servidor y toda su animación es CSS guiado por el scroll. La diferencia
 * con lo que había antes no es que vuelva a haber una animación de texto --
 * es que esta no cuesta un solo byte de cliente y el texto se ve en reposo.
 *
 * Cada fila lleva ahora titular y párrafo: el texto es del estudio y el
 * párrafo es lo que convierte una frase de cartel en algo que explica el
 * servicio. La fila crece, y por eso `min-height` en el CSS subió.
 *
 * Only the first statement is an <h2>: it is the studio's positioning line
 * and so the section's accessible name. Making all three headings would put
 * three sibling h2s with unrelated text into the document outline, which
 * reads as noise in a screen reader's heading list. The other two are <p>
 * set in the same type -- visually peers, semantically continuation.
 */

type Statement = {
  /** Row number, shown. Real sequence: before the day, the day, after it. */
  n: string;
  /** Short category on the right, the way Agentura tags each of its rows. */
  tag: string;
  lead: string;
  /** The one word in the family's real italic cut. */
  em: string;
  tail: string;
  /** El párrafo que desarrolla el titular. Texto del estudio, literal. */
  body: string;
};

const statements: Statement[] = [
  {
    n: '01',
    tag: 'Reportaje',
    lead: 'Menos protocolo. Más ',
    em: 'verdad',
    tail: '.',
    body:
      'No hacemos fotos de boda convencionales: aplicamos el instinto del fotoperiodismo y la '
      + 'estética editorial para contar vuestra historia exactamente como ocurrió, con ritmo, luz y '
      + 'personalidad propia.',
  },
  {
    n: '02',
    tag: 'El día completo',
    lead: 'La magia real ocurre cuando nadie mira a la ',
    em: 'cámara',
    tail: '.',
    body:
      'Sin posados forzados ni interrupciones. Estamos ahí desde los preparativos hasta el último '
      + 'baile para cazar las miradas cómplices, los abrazos improvisados y la fiesta sin filtros.',
  },
  {
    n: '03',
    tag: 'Foto y vídeo',
    lead: 'Fotografía y película nacidas del mismo ',
    em: 'ADN',
    tail: '.',
    body:
      'Un equipo propio de especialistas coordinados al milímetro. Misma estética y misma paleta de '
      + 'color cinematográfica.',
  },
];

export function Manifiesto() {
  return (
    <section className={styles.section} aria-labelledby="manifiesto-heading">
      {statements.map((s, i) => (
        <div key={s.n} className={styles.row}>
          <span className={styles.number} aria-hidden="true">
            {s.n}
          </span>
          <div className={styles.text}>
            {/* Palabra a palabra, desde detrás de su propia ventana y guiado
                por el scroll (components/motion/RevealWords). Es el gesto de
                tipografía del sitio, el mismo que cierra la home, aplicado
                aquí porque estas tres frases son el texto más grande de la
                página y eran el único que no se movía: la fila se apilaba,
                pero las letras llegaban ya puestas.
                Los tramos van partidos como están escritos arriba para que
                `verdad` siga siendo un <em> de verdad y el punto que le sigue
                NO -- si se juntaran, el énfasis se comería la puntuación. */}
            {i === 0 ? (
              <h2 id="manifiesto-heading" className={styles.statement}>
                <RevealWords
                  segments={[{ text: s.lead }, { text: s.em, em: true }, { text: s.tail }]}
                  emClassName={styles.emphasis}
                />
              </h2>
            ) : (
              <p className={styles.statement}>
                <RevealWords
                  segments={[{ text: s.lead }, { text: s.em, em: true }, { text: s.tail }]}
                  emClassName={styles.emphasis}
                />
              </p>
            )}
            <p className={styles.body}>{s.body}</p>
          </div>
          <span className={styles.tag}>{s.tag}</span>
        </div>
      ))}
    </section>
  );
}
