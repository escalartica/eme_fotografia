import Link from 'next/link';
import { site } from '@/content/site';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './GuiaBodasSevilla.module.css';

/**
 * The home page's one block of real prose.
 *
 * Why it exists: everything else on this page is a photograph, a name and
 * a year. Measured against the pages that currently rank for "fotografía
 * bodas Sevilla" -- 1.200 to 3.000 words each, with sections on price, on
 * what a reportaje includes and on where the studio shoots -- this home
 * had about 430 words, most of them couples' names. A search engine had
 * almost nothing to read, and neither did a visitor who wanted an answer
 * before writing.
 *
 * Every claim here already exists elsewhere in the site's own data
 * (content/faq.ts, content/services.ts, content/site.ts) -- nothing was
 * invented to fill the section, and the one commercial question with no
 * signed-off answer (the price) is answered by saying honestly why there
 * is no closed tariff, which is also what the FAQ says.
 *
 * It doubles as this page's internal-linking hub: every one of the four
 * other public routes is reached from here in a sentence, in context,
 * rather than only from the nav.
 */
export function GuiaBodasSevilla() {
  return (
    <section className={styles.section} aria-labelledby="guia-heading">
      <ScrollReveal>
        <p className={styles.eyebrow}>Antes de escribirnos</p>
        <h2 id="guia-heading" className={styles.heading}>
          Fotografía de bodas en {site.legalCity}
        </h2>
      </ScrollReveal>

      <div className={styles.columns}>
        <ScrollReveal>
          <div className={styles.block}>
            <h3 className={styles.subheading}>Qué es un reportaje de boda para nosotros</h3>
            <p>
              Una boda no se repite y no se dirige. Nuestro trabajo es estar cerca sin
              interponernos: los preparativos en casa, la mano del padre en la puerta de
              la iglesia, la cara de la madre en la ceremonia, la última hora de luz en el
              campo y la fiesta hasta que se apaga. Fotografiamos lo que pasa y solo
              paramos el día cuando hace falta, para el retrato de pareja y poco más.
            </p>
            <p>
              Por eso enseñamos{' '}
              <Link href="/trabajos">reportajes completos y no solo las diez mejores fotos</Link>:
              una selección buena la tiene cualquiera, una boda entera bien contada no.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className={styles.block}>
            <h3 className={styles.subheading}>Fotografía y vídeo, el mismo equipo</h3>
            <p>
              Hacemos las dos cosas y es como mejor trabajamos: la misma mirada y el mismo
              color en la foto y en la película, sin coordinar a dos proveedores que no se
              conocen ni aguantar a dos equipos peleando por el mismo sitio en el altar.
              Podéis contratar solo{' '}
              <Link href="/servicios/fotografia-de-boda">fotografía</Link> o solo{' '}
              <Link href="/servicios/video-de-boda">vídeo</Link>, pero juntos salen mejor los dos.
            </p>
            <p>
              El equipo lo dirige {site.founderName} y lo forman cinco especialistas en foto y vídeo —{' '}
              <Link href="/sobre-nosotros">quiénes somos y cómo trabajamos</Link>.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className={styles.block}>
            <h3 className={styles.subheading}>Dónde trabajamos</h3>
            <p>
              La base está en {site.legalCity}: haciendas, cortijos, basílicas y patios de
              la ciudad y de la sierra, que es donde se han hecho la mayoría de las bodas
              que hay en esta web. Nos desplazamos por toda Andalucía — Cádiz, Huelva,
              Córdoba, Málaga, Granada, Jaén y Almería — y también fuera. El
              desplazamiento va calculado en el presupuesto desde el principio, nunca como
              un extra que aparece luego.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className={styles.block}>
            <h3 className={styles.subheading}>Cuánto cuesta y por qué no hay una tarifa cerrada</h3>
            <p>
              Porque no hay dos bodas iguales. El precio depende de si queréis solo
              fotografía, solo vídeo o las dos cosas, de las horas de cobertura, de si
              incluís preboda y álbum y del desplazamiento. Preferimos hacer un
              presupuesto claro para vuestra boda concreta, sin extras escondidos, a
              publicar un «desde» que no se parece a lo que acabáis pagando.{' '}
              <Link href="/contacto">Contadnos la fecha y el sitio</Link> y os lo mandamos.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className={styles.block}>
            <h3 className={styles.subheading}>Con cuánta antelación conviene reservar</h3>
            <p>
              Solo cubrimos una boda por fecha. Las de primavera y las de
              septiembre-octubre suelen cerrarse con alrededor de un año de antelación; en
              otras épocas con seis meses suele bastar, pero merece la pena preguntar
              igualmente porque a veces queda hueco. La fecha se bloquea con un contrato
              sencillo y una señal a cuenta.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className={styles.block}>
            <h3 className={styles.subheading}>Cuándo tendréis las fotos</h3>
            <p>
              Unas fotos de adelanto en los días siguientes, para que tengáis algo que
              enseñar mientras dura el subidón. La galería completa entre seis y ocho
              semanas, y la película entre ocho y doce, según la época del año. Las
              galerías se entregan en privado, con vuestra clave, para que las veáis y las
              descarguéis cuando queráis.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.3}>
        {/* Cuarta aparición de las mismas cifras en una sola página. Aquí,
            además, iban justo antes del cierre, que las vuelve a insinuar.
            Después de leer toda la guía la pareja no necesita otra prueba:
            necesita saber que lo que falta es corto. */}
        <p className={styles.closing}>
          Si habéis llegado hasta aquí, lo que falta es lo más rápido:{' '}
          <Link href="/contacto" className={styles.closingLink}>
            decidnos la fecha y el sitio
          </Link>{' '}
          y os confirmamos si lo tenemos libre.
        </p>
      </ScrollReveal>
    </section>
  );
}
