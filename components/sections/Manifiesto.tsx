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
};

const statements: Statement[] = [
  // Kept verbatim: this is the studio's own line and the one place on the
  // page where the "No X. Y." construction still earns its keep.
  { n: '01', tag: 'Reportaje', lead: 'No contamos bodas. Contamos ', em: 'vuestra', tail: ' historia.' },
  // Straight from content/services.ts ("Estamos desde que os vestis hasta el
  // ultimo baile").
  { n: '02', tag: 'El día completo', lead: 'Lo que pasa cuando nadie mira a la ', em: 'cámara', tail: '.' },
  // The studio sells both crafts; this is the fact that makes the pair worth
  // buying together, and it claims nothing about who shoots what.
  { n: '03', tag: 'Foto y vídeo', lead: 'La foto y la película, del ', em: 'mismo', tail: ' equipo.' },
];

export function Manifiesto() {
  return (
    <section className={styles.section} aria-labelledby="manifiesto-heading">
      {statements.map((s, i) => (
        <div key={s.n} className={styles.row}>
          <span className={styles.number} aria-hidden="true">
            {s.n}
          </span>
          {i === 0 ? (
            <h2 id="manifiesto-heading" className={styles.statement}>
              {s.lead}
              <em className={styles.emphasis}>{s.em}</em>
              {s.tail}
            </h2>
          ) : (
            <p className={styles.statement}>
              {s.lead}
              <em className={styles.emphasis}>{s.em}</em>
              {s.tail}
            </p>
          )}
          <span className={styles.tag}>{s.tag}</span>
        </div>
      ))}
    </section>
  );
}
