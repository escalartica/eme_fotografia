import Image from 'next/image';
import Link from 'next/link';
import { mascotas, faqsMascotas } from '@/content/mascotas';
import { site } from '@/content/site';
import { turno } from '@/lib/turno';
import { breadcrumbSchema, faqSchema, jsonLd } from '@/lib/schema';
import { buildMetadata, ogImage } from '@/lib/seo';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { RevealWords } from '@/components/motion/RevealWords';
import { MarqueeBand } from '@/components/motion/MarqueeBand';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';
import { PlusIcon } from '@/components/ui/Icon';
import styles from '../servicios/page.module.css';
import faqStyles from '@/components/sections/Faq.module.css';
import propios from './page.module.css';

export const metadata = buildMetadata({
  // 32 + 17 de plantilla = 49 caracteres servidos.
  title: mascotas.metaTitle,
  description: mascotas.metaDescription,
  path: mascotas.route,
  image: ogImage(mascotas.hero.src),
});

/**
 * /mascotas: Eme & Compañía, la línea de retratos de perros y gatos.
 *
 * Misma maqueta por capítulos que la ficha de un servicio de boda (hoja de
 * estilos de /servicios) para que se lea como parte de la misma casa, pero
 * con su propio texto, su FAQ y una llamada que va a WhatsApp o al correo:
 * el formulario de /contacto pregunta por la fecha de la boda y no sirve
 * para reservar una sesión con un perro.
 *
 * Las respuestas de la FAQ están en el HTML servido (`<details>` nativo), que
 * es lo que permite marcarlas como FAQPage.
 */
export default function Page() {
  const whatsapp = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    'Hola, me gustaría reservar una sesión de fotos de Eme & Compañía para mi mascota.',
  )}`;
  const correo = `mailto:${site.email}?subject=${encodeURIComponent('Sesión de fotos de mascota')}`;

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema([
              { name: 'Inicio', path: '/' },
              { name: 'Mascotas', path: mascotas.route },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(faqsMascotas)) }}
      />
      <ScrollReveal className={styles.revealWrap}>
        <article className={styles.servicio}>
          <header className={styles.opener}>
            <div className={styles.openerCopy}>
              <p className={styles.formato}>{mascotas.marca}</p>
              <h1 id="mascotas-heading" className={styles.name}>
                <RevealWords segments={[{ text: mascotas.heading }]} />
              </h1>
              <p className={styles.tagline} style={turno(0)}>
                {mascotas.tagline}
              </p>
              <p className={styles.intro} style={turno(1)}>
                {mascotas.intro}
              </p>
              <p className={styles.idealFor} style={turno(2)}>
                {mascotas.idealFor}
              </p>
            </div>
            <div className={`${styles.imageWrap} ${propios.heroFoto}`}>
              <Image
                src={mascotas.hero.src}
                alt={mascotas.hero.alt}
                fill
                sizes="(max-width: 900px) 100vw, 560px"
                className={styles.image}
                priority
              />
            </div>
          </header>

          {/* Los animales que caben aquí, pasando sin fin: la misma banda de
              la portada, componente de servidor y CSS puro, parada con
              `prefers-reduced-motion`. */}
          <div className={`breakout ${propios.marquesina}`}>
            <MarqueeBand text={mascotas.animales.join(' · ')} repeat={4} />
          </div>

          <blockquote className={propios.frase}>
            <p>
              <RevealWords segments={[{ text: mascotas.frase }]} />
            </p>
          </blockquote>

          <section className={styles.capitulo} aria-labelledby="sesiones-heading">
            <h2 id="sesiones-heading" className={styles.capituloTitulo}>Las sesiones</h2>
            <div className={styles.pasos} role="list" aria-label="Tipos de sesión">
              {mascotas.sesiones.map((s, i) => (
                <div key={s.titulo} role="listitem" className={styles.paso} style={turno(i)}>
                  <span className={styles.itemNumber} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.itemText}>
                    <span className={styles.stepTitle}>{s.titulo}</span>
                    <p className={styles.stepDescription}>{s.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.extras}>
              <p className={styles.extrasLabel}>Y también</p>
              <div className={styles.extrasList} role="list" aria-label="Y también">
                {mascotas.extras.map((item, i) => (
                  <span key={item} role="listitem" className={styles.extrasItem} style={turno(i)}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <figure className={styles.interludio}>
            <div className={styles.interludioMarco}>
              <div className={styles.interludioCapa}>
                <Image
                  src={mascotas.banda.src}
                  alt={mascotas.banda.alt}
                  fill
                  sizes="100vw"
                  className={styles.image}
                  style={{ objectPosition: '55% 50%' }}
                />
              </div>
            </div>
            <figcaption className={styles.interludioPie}>{mascotas.banda.pie}</figcaption>
          </figure>

          <section className={styles.capitulo} aria-labelledby="proceso-heading">
            <h2 id="proceso-heading" className={styles.capituloTitulo}>Cómo es una sesión</h2>
            <div className={styles.pasos} role="list" aria-label="Cómo es una sesión">
              {mascotas.proceso.map((paso, i) => (
                <div key={paso.titulo} role="listitem" className={styles.paso} style={turno(i)}>
                  <span className={styles.itemNumber} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.itemText}>
                    <span className={styles.stepTitle}>{paso.titulo}</span>
                    <p className={styles.stepDescription}>{paso.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.capituloAncho} aria-labelledby="galeria-heading">
            <h2 id="galeria-heading" className={styles.capituloTitulo}>
              <RevealWords segments={[{ text: 'Con nombre propio' }]} />
            </h2>
            <p className={propios.galeriaEntrada}>
              Todas las fotos de esta página son de Eme. Ninguna de banco.
            </p>
            {/* DOS COLUMNAS GRANDES Y DESFASADAS, no un mural de tres.
                Aquí las fotos son el argumento: a media caja cada retrato
                mide ~580 px en escritorio en vez de ~380, y la columna de la
                derecha baja media foto para que se lea como un pliego de
                revista y no como una cuadrícula de miniaturas. Cada foto
                entra con un telón que se abre al llegar al visor (ver
                `.galeriaFoto` en el CSS de esta página). */}
            <div className={propios.galeria}>
              {mascotas.galeria.map((item) => (
                <figure
                  key={item.src}
                  className={propios.galeriaFoto}
                  style={{ aspectRatio: `${item.width} / ${item.height}` }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 700px) 92vw, 580px"
                    className={`${styles.image} ${propios.galeriaImagen}`}
                  />
                </figure>
              ))}
            </div>
          </section>

          <section className={faqStyles.section} aria-labelledby="faq-mascotas-heading">
            <div className={faqStyles.encabezado}>
              <p className={faqStyles.eyebrow}>Antes de escribir</p>
              <h2 id="faq-mascotas-heading" className={faqStyles.titulo}>
                Preguntas frecuentes
              </h2>
            </div>
            <div className={faqStyles.lista}>
              {faqsMascotas.map((f) => (
                <details key={f.id} className={faqStyles.item}>
                  <summary className={faqStyles.resumen}>
                    <h3 className={faqStyles.pregunta}>{f.question}</h3>
                    <span className={faqStyles.marca} aria-hidden="true">
                      <PlusIcon size={16} />
                    </span>
                  </summary>
                  <div className={faqStyles.cuerpo}>
                    <p>{f.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className={propios.reserva} aria-labelledby="reserva-heading">
            <h2 id="reserva-heading" className={propios.reservaTitulo}>
              ¿Le hacemos su sesión?
            </h2>
            <p className={propios.reservaTexto}>
              Cuéntanos cómo se llama, cómo es y qué te gustaría. Te contestamos con fechas y
              tarifas, normalmente el mismo día.
            </p>
            <div className={styles.ctaRow}>
              <a href={whatsapp} className={styles.cta} target="_blank" rel="noreferrer">
                Reservar por WhatsApp
                <ArrowGlyph />
              </a>
              <a href={correo} className={styles.secondaryCta}>
                Escribir a {site.email}
                <ArrowGlyph dir="right" />
              </a>
            </div>
            <p className={propios.reservaPie}>
              ¿Buscas fotógrafa de boda? <Link href="/servicios/fotografia-de-boda">Aquí está la otra mitad de Eme</Link>.
            </p>
          </section>
        </article>
      </ScrollReveal>
    </div>
  );
}
