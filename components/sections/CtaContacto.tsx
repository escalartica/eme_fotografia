import Link from 'next/link';
import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { RevealWords } from '@/components/motion/RevealWords';
import { ScrollParallax } from '@/components/motion/ScrollParallax';
import { Magnetic } from '@/components/motion/Magnetic';
import { RotatingBadge } from '@/components/ui/RotatingBadge';
import { focusOf } from '@/lib/focal';
import styles from './CtaContacto.module.css';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

/**
 * Closing invitation, over a full-bleed photograph.
 *
 * Belle Photo's composition exactly: a short italic line, one oversized
 * uppercase Didone statement under it, a sentence of plain sans, and a
 * single arrow link. No filled button - none of the reference studios use
 * one, and a solid rectangle is the thing that makes a page look like a
 * template.
 *
 * NOTE ON THE ROTATING BADGE: this comment used to claim the badge had been
 * removed. It has not -- <RotatingBadge> is still rendered at the foot of
 * this component and RotatingBadge.module.css still spins it on a 28s
 * infinite loop. The original objection stands (it comes from a different
 * reference, danieleandmarilia.com, and it is the last element on the site
 * animating on a loop with no stated reason), so it is still a candidate for
 * removal -- but until someone actually removes it, saying so here just
 * misleads the next reader about what is on screen.
 *
 * Two additions to what was otherwise the one fully static, fully
 * unanimated section on the homepage: a restrained scroll-scrubbed
 * parallax on the background photo (`ScrollParallax`, same component
 * `EditorialSpread`'s panoramic variant already uses), and a single
 * `ScrollReveal` around the closing copy block. `.section` already had
 * `position: relative; overflow: hidden` (the clip boundary
 * `ScrollParallax` requires) — nothing else about the section's layout
 * changes. `ScrollParallax`'s own wrapper needs an explicit negative
 * `z-index` here (`.parallaxLayer`, passed as its `className`) because,
 * unlike `EditorialSpread`'s panoramic image, this section's content sits
 * behind the photo via negative `z-index` rather than DOM order (`.content`
 * is a non-positioned grid item, not `position:absolute`) — see
 * `ScrollParallax`'s own doc comment on that `className` prop.
 */
const CIERRE = 'Vuestra boda merece toda nuestra atención.';

export function CtaContacto() {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <ScrollParallax className={styles.parallaxLayer} strength={6}>
        <Image
          /* APAISADA, Y DE 2560 px. Aquí había un retrato vertical de
             1707x2560: en una banda de 2,31:1 el navegador se queda con una
             franja horizontal de toda su anchura -- 1707 px -- y la estira a
             los 2880 que pide un portátil de 1440 a 2x, casi el doble. Esta
             es la misma fiesta contada en apaisado, reexportada del original
             a 2560x1707, y el recorte ahora es vertical: se aprovecha el
             ancho entero del fichero. */
          src="/images/trabajos/eva-y-rafa/fiesta.webp"
          alt=""
          fill
          className={styles.background}
          sizes="100vw"
          aria-hidden="true"
          /* Foco medido (content/focus-points.ts): 15% sube el recorte a la
             altura de los invitados con las bengalas, que en esta toma están
             en el tercio superior. */
          style={focusOf('/images/trabajos/eva-y-rafa/fiesta.webp')}
        />
      </ScrollParallax>
      {/* The scrim exists here, unlike the hero, because the type sits
          directly on the photograph rather than on its own band, and the
          image is dark and busy. */}
      <div className={styles.scrim} aria-hidden="true" />

      <ScrollReveal className={styles.content}>
        {/* «Una boda por fecha» estuvo aquí hasta que el estudio aclaró que
            ya cubren varias: era el argumento de cierre de la home y era
            falso. Lo que lo sustituye no es otro argumento, es una
            instrucción -- lo único que la pareja tiene que hacer para que
            esto avance, y lo mismo que pide el párrafo de debajo y el primer
            campo del formulario. */}
        <p className={styles.lead}>Con la fecha y el lugar basta</p>
        {/* Palabra a palabra, con `RevealWords`.
            Esto era una COPIA A MANO de ese componente: el mismo bucle sobre
            las palabras, las mismas dos ventanas anidadas, el mismo tramo
            `entry 8% -> entry 58%` con escalón del 5% y el mismo fotograma de
            108% de subida. La copia venía de antes de que el gesto se
            extrajera, y llevaba ya dos diferencias silenciosas: compensaba
            0,12em de descendente en vez de 0,16 --la cursiva del Didone baja
            más, y esta frase la usa-- y declaraba un `will-change: transform`
            por palabra que el componente quitó a propósito (una animación
            guiada por el scroll con `fill: both` ya está promocionada, y
            declararlo a mano sólo deja una capa de compositor viva para
            siempre por cada palabra).
            El gesto no cambia: cambia que ahora hay un solo sitio donde
            vive. */}
        <h2 id="cta-heading" className={styles.heading}>
          <RevealWords segments={[{ text: CIERRE }]} />
        </h2>
        <p className={styles.body}>
          Contadnos qué día es, dónde lo celebráis y qué os gustaría llevar —fotografía, vídeo o
          las dos cosas— y os decimos si seguimos libres y qué pack encaja. Si ninguno encaja,
          os preparamos un presupuesto a medida.
        </p>
        {/* La única llamada a la acción del cierre de la web, y la última
            cosa que se ve antes del pie: se inclina hacia el puntero cuando
            éste se acerca. El envoltorio lleva el margen y la alineación
            para que la caja que atrae sea exactamente la del enlace. */}
        <Magnetic className={styles.ctaMagnet}>
          <Link href="/contacto" className={styles.cta} data-cursor="abrir">
            Consultar vuestra fecha
            <ArrowGlyph />
          </Link>
        </Magnetic>
      </ScrollReveal>
      <RotatingBadge className={styles.badge} />
    </section>
  );
}
