import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './SobreEmePreview.module.css';
import { RevealWords } from '@/components/motion/RevealWords';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

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
            {/* Texto del estudio, literal. La restricción que sigue viva:
                aquí no puede aparecer la construcción "No X. Y.", que tiene
                su única casa en el manifiesto de más arriba. */}
            <h2 id="sobre-heading" className={styles.heading}>
              <RevealWords
                segments={[
                  { text: 'Cuando llega el gran día, ya no hay ' },
                  { text: 'desconocidos', em: true },
                  { text: ' tras la cámara.' },
                ]}
                emClassName={styles.emphasis}
              />
            </h2>
          </ScrollReveal>
          {/* Texto del estudio, literal. Va partido en dos párrafos —el antes
              de la boda y el día— porque de una sola pieza son ocho líneas
              seguidas sin respiro en el móvil, que es como se lee esta home.
              Cada ScrollReveal es de primer nivel, nunca anidado: este
              proyecto ya se encontró dos veces con que el translateY de un
              reveal anidado desplaza la medición de su descendiente. */}
          <ScrollReveal>
            <p className={styles.body}>
              Antes de cualquier reserva, nos sentamos a hablar en persona o por videollamada para
              escuchar vuestra idea. Analizamos cómo queréis que sea vuestro día, los tiempos y la
              logística coordinándonos con vuestros proveedores.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <p className={styles.body}>
              Por eso, el día de la boda todo fluye: sabemos exactamente dónde estar y a quién
              mirar. Dedicamos solo unos minutos a las fotos de pareja; el resto del día trabajamos
              de forma invisible para que solo os dediquéis a disfrutar.
            </p>
          </ScrollReveal>
          <Link href="/sobre-nosotros" className={styles.link}>
            Conoce a las personas que os acompañarán
            <ArrowGlyph />
          </Link>
        </div>
      </div>
    </section>
  );
}
