import Link from 'next/link';
import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ScrollParallax } from '@/components/motion/ScrollParallax';
import { RotatingBadge } from '@/components/ui/RotatingBadge';
import { focusOf } from '@/lib/focal';
import styles from './CtaContacto.module.css';

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
export function CtaContacto() {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <ScrollParallax className={styles.parallaxLayer} strength={6}>
        <Image
          src="/images/trabajos/rocio-y-juanje/fiesta.webp"
          alt=""
          fill
          className={styles.background}
          sizes="100vw"
          aria-hidden="true"
          /* Measured focus (content/focus-points.ts). This is a portrait
             frame in a wide band, so only about a third of its height is ever
             on screen; 33% centres that band on the groom in mid-air with the
             raised arms complete above him. */
          style={focusOf('/images/trabajos/rocio-y-juanje/fiesta.webp')}
        />
      </ScrollParallax>
      {/* The scrim exists here, unlike the hero, because the type sits
          directly on the photograph rather than on its own band, and the
          image is dark and busy. */}
      <div className={styles.scrim} aria-hidden="true" />

      <ScrollReveal className={styles.content}>
        {/* "Hagamos algo / que se recuerde" podía estar en la web de
            cualquier agencia, y "empezar un proyecto" es vocabulario de
            agencia para una boda. Esto dice un hecho del estudio que da una
            razón real para escribir hoy sin inventar urgencia, y es
            comprobable: sale literal de content/faq.ts ("Solo cubrimos una
            boda por fecha, así que en cuanto la reservéis es vuestra").
            También cierra en vosotros: la línea anterior tuteaba en medio de
            una web que trata a la pareja en plural. */}
        <p className={styles.lead}>Solo cubrimos</p>
        <h2 id="cta-heading" className={styles.heading}>
          una boda por fecha
        </h2>
        <p className={styles.body}>
          Decidnos cuándo y dónde es la vuestra y os confirmamos si la tenemos libre.
        </p>
        <Link href="/contacto" className={styles.cta} data-cursor="abrir">
          Consultar nuestra disponibilidad
          <span className="arrow" aria-hidden="true">↗</span>
        </Link>
      </ScrollReveal>
      <RotatingBadge className={styles.badge} />
    </section>
  );
}
