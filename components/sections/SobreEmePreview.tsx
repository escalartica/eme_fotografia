import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './SobreEmePreview.module.css';

/**
 * The studio block, and the one dark section on the page.
 *
 * bellephoto.com.au alternates cream and black freely; here the switch
 * happens exactly once, so it reads as a deliberate change of register
 * rather than as the page losing track of its own theme. Contained image
 * on the left, copy on the right, one arrow link out - the same
 * composition as their "WELCOME TO BELLE" section.
 */
export function SobreEmePreview() {
  return (
    <section className={`${styles.section} nightBlock`} aria-labelledby="sobre-heading">
      <div className={styles.layout}>
        {/* Each block is its own top-level ScrollReveal, never nested:
            an outer instance's translate shifts the inner one's position
            while ITS ScrollTrigger is measuring against that same
            position, and the inner reveal then never settles. */}
        <ScrollReveal className={styles.imageWrap}>
          <Image
            src="/images/sobre-nosotros/equipo-en-accion.webp"
            alt="El equipo de EME fotografiando a una pareja junto a un coche clásico en una hacienda sevillana"
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            className={styles.image}
          />
        </ScrollReveal>

        <div className={styles.text}>
          <ScrollReveal>
            {/* Two constraints this heading has to satisfy at once.
                (1) No "No X. Y." sentence: the manifesto higher up the page
                already opens "No contamos bodas. Contamos vuestra historia.",
                and the page was running that same negation four times over
                (manifesto, both service taglines, and this block's first
                paragraph) -- once it is a position, four times it is a tic,
                and the reader stops hearing what the studio DOES because
                every line is busy saying what it is not.
                (2) It has to be the premise the two paragraphs below then
                prove, rather than a standalone claim they restate. "Cinco
                personas y una sola mirada" failed that test: "una sola
                mirada" is an unfalsifiable claim, and the paragraphs under it
                went on to talk about something else entirely. */}
            <h2 id="sobre-heading" className={styles.heading}>
              El día de la boda ya nos{' '}
              <em className={styles.emphasis}>conocéis</em>.
            </h2>
          </ScrollReveal>
          {/* These two paragraphs are one argument in sequence, which is what
              the previous pair did not have: the first was a roster of names
              (and the only place on the home page asserting what each
              assistant shoots -- a fact nobody has confirmed), the second
              changed subject to how the day is shot, and neither followed
              from the other. Now the first says what happens before the
              wedding and the second says what that buys on the day, so the
              heading above is a conclusion the block actually earns.
              Every fact here is the studio's own published process --
              content/services.ts, steps 1 to 3 -- and nothing about who does
              what within the team, which is why the "Conocer al equipo" link
              below still carries that job. */}
          <ScrollReveal>
            <p className={styles.body}>
              Antes de que reservéis nos sentamos con vosotros, en persona o por videollamada.
              Después repartimos los horarios, los ángulos y la luz que tiene cada espacio a cada
              hora, con vosotros y con el resto de proveedores.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <p className={styles.body}>
              Por eso, cuando llega el día, sabemos dónde ponernos y a quién mirar. Los posados
              nos llevan unos minutos y el resto del día casi no nos vais a ver.
            </p>
          </ScrollReveal>
          <Link href="/sobre-nosotros" className={styles.link}>
            Conocer al equipo
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
