import Image from 'next/image';
import Link from 'next/link';
import { sesionesMascotasFamilias as n, faqsSesionesMascotasFamilias as faqs } from '@/content/sesiones-mascotas-familias';
import { mascotas } from '@/content/mascotas';
import { site } from '@/content/site';
import { turno } from '@/lib/turno';
import { breadcrumbSchema, faqSchema, jsonLd } from '@/lib/schema';
import { buildMetadata, ogImage } from '@/lib/seo';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { RevealWords } from '@/components/motion/RevealWords';
import { MarqueeBand } from '@/components/motion/MarqueeBand';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';
import { PlusIcon } from '@/components/ui/Icon';
import { LeadLink } from '@/components/analytics/LeadLink';
import styles from '../../servicios/page.module.css';
import faqStyles from '@/components/sections/Faq.module.css';
import propios from '../page.module.css';
import propia from './page.module.css';

export const metadata = buildMetadata({
  title: n.metaTitle,
  description: n.metaDescription,
  path: n.route,
  image: ogImage(n.hero.src),
});

/** Etiquetas de los datos de la convocatoria, en el orden en que se leen. */
const DETALLES: [keyof typeof n.detalles, string][] = [
  ['fechas', 'Fechas'],
  ['lugar', 'Dónde'],
  ['duracion', 'Duración'],
  ['precio', 'Precio'],
  ['incluye', 'Incluye'],
  ['donativo', 'Para Pelos y Señales'],
];

/**
 * /mascotas/sesiones-mascotas-y-familias: sesiones solidarias de mascotas y
 * de familias con mascotas de Eme & Compañía.
 *
 * Primera página del embudo de mascotas (ver content/sesiones-mascotas-familias.ts).
 * Misma familia visual que /mascotas, de la que es hija, y la misma llamada a
 * WhatsApp; cada botón cuenta como contacto en Analytics con su `form_id`,
 * que es el identificador que usará el CRM cuando lo haya.
 *
 * MOVIMIENTO: cada bloque entra por su cuenta al llegar al visor
 * (ScrollReveal, CSS puro guiado por el scroll), los titulares se escriben
 * palabra a palabra, la franja pasa sola y las fotos se descubren de abajo
 * arriba. Todo va detrás de `prefers-reduced-motion` y de `@supports`: quien
 * pide menos movimiento, o usa un navegador sin animaciones de scroll, ve la
 * página quieta y entera.
 *
 * MAQUETACIÓN: nada se mueve con `transform` fuera de su sitio de forma
 * permanente, así que ninguna foto puede quedar encima de un texto. La foto
 * de apertura tiene su propio alto en esta página (no el de /mascotas) para
 * que el titular, que aquí es largo, nunca quede más bajo que ella.
 */
export default function Page() {
  const wa = (texto: string) => `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(texto)}`;
  const correo = `mailto:${site.email}?subject=${encodeURIComponent('Sesión solidaria de Eme & Compañía')}`;
  const detalles = DETALLES.filter(([k]) => n.detalles[k]);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema([
              { name: 'Inicio', path: '/' },
              { name: 'Mascotas', path: mascotas.route },
              { name: 'Sesiones solidarias', path: n.route },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(faqs)) }} />
      <article className={styles.servicio}>
        <header className={`${styles.opener} ${propia.apertura}`}>
          <div className={styles.openerCopy}>
            <p className={styles.formato}>{n.marca}</p>
            <h1 id="sesiones-heading" className={`${styles.name} ${propia.titular}`}>
              <RevealWords segments={[{ text: n.heading }]} />
            </h1>
            <p className={styles.tagline} style={turno(0)}>
              {n.tagline}
            </p>
            <p className={styles.intro} style={turno(1)}>
              {n.intro}
            </p>
            <div className={styles.ctaRow} style={turno(2)}>
              <LeadLink
                formId="reserva-sesion-mascotas"
                method="whatsapp"
                href={wa(n.whatsapp.reserva)}
                className={styles.cta}
                target="_blank"
                rel="noreferrer"
              >
                Reservar mi sesión
                <ArrowGlyph />
              </LeadLink>
            </div>
          </div>
          <div className={`${styles.imageWrap} ${propia.heroFoto}`}>
            <Image
              src={n.hero.src}
              alt={n.hero.alt}
              fill
              sizes="(max-width: 900px) 100vw, 520px"
              className={styles.image}
              priority
            />
          </div>
        </header>

        <div className={`breakout ${propios.marquesina}`}>
          <MarqueeBand text={n.franja.join(' · ')} repeat={4} />
        </div>

        <ScrollReveal>
          <section className={styles.capitulo} aria-labelledby="modalidades-heading">
            <h2 id="modalidades-heading" className={styles.capituloTitulo}>
              <RevealWords segments={[{ text: 'Dos sesiones' }]} />
            </h2>
            <div className={styles.pasos} role="list" aria-label="Tipos de sesión">
              {n.modalidades.map((m, i) => (
                <div key={m.titulo} role="listitem" className={styles.paso} style={turno(i)}>
                  <span className={styles.itemNumber} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.itemText}>
                    <h3 className={`${styles.stepTitle} ${propia.modalidadTitulo}`}>{m.titulo}</h3>
                    <p className={styles.stepDescription}>{m.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Tres fotos en fila. Sin desfases con `transform`: cada una ocupa
            su hueco y se descubre con el telón de /mascotas. */}
        <div className={propia.galeria}>
          {n.galeria.map((item) => (
            <figure key={item.src} className={propia.galeriaFoto}>
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 92vw, 380px"
                className={`${styles.image} ${propios.galeriaImagen}`}
              />
            </figure>
          ))}
        </div>

        <ScrollReveal>
          <section className={propia.solidario} aria-labelledby="solidario-heading">
            <h2 id="solidario-heading" className={propios.reservaTitulo}>
              <RevealWords segments={[{ text: n.solidario.titulo }]} />
            </h2>
            <p className={propios.reservaTexto}>{n.solidario.texto}</p>
            <a href={n.solidario.enlace.href} className={styles.secondaryCta} target="_blank" rel="noreferrer">
              {n.solidario.enlace.texto}
              <ArrowGlyph dir="right" />
            </a>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className={styles.capitulo} aria-labelledby="detalles-heading">
            <h2 id="detalles-heading" className={styles.capituloTitulo}>
              Fechas, sitio y precio
            </h2>
            {detalles.length > 0 ? (
              <dl className={propia.detalles}>
                {detalles.map(([k, label]) => (
                  <div key={k} className={propia.detalle}>
                    <dt>{label}</dt>
                    <dd>{n.detalles[k]}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={propios.reservaTexto}>
                Escríbenos por WhatsApp y te pasamos las fechas libres y las tarifas. Las publicaremos también aquí muy
                pronto.
              </p>
            )}
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className={styles.capitulo} aria-labelledby="proceso-heading">
            <h2 id="proceso-heading" className={styles.capituloTitulo}>
              <RevealWords segments={[{ text: 'Cómo es la sesión' }]} />
            </h2>
            <div className={styles.pasos} role="list" aria-label="Cómo es la sesión">
              {n.proceso.map((paso, i) => (
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
        </ScrollReveal>

        <ScrollReveal>
          <section className={propia.solidario} aria-labelledby="regalo-heading">
            <h2 id="regalo-heading" className={propios.reservaTitulo}>
              <RevealWords segments={[{ text: n.regalo.titulo }]} />
            </h2>
            <p className={propios.reservaTexto}>{n.regalo.texto}</p>
            <LeadLink
              formId="vale-regalo"
              method="whatsapp"
              href={wa(n.whatsapp.regalo)}
              className={styles.secondaryCta}
              target="_blank"
              rel="noreferrer"
            >
              Pedir un vale regalo
              <ArrowGlyph dir="right" />
            </LeadLink>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className={faqStyles.section} aria-labelledby="faq-sesiones-heading">
            <div className={faqStyles.encabezado}>
              <p className={faqStyles.eyebrow}>Antes de escribir</p>
              <h2 id="faq-sesiones-heading" className={faqStyles.titulo}>
                Preguntas frecuentes
              </h2>
            </div>
            <div className={faqStyles.lista}>
              {faqs.map((f) => (
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
        </ScrollReveal>

        <ScrollReveal>
          <section className={propios.reserva} aria-labelledby="reserva-heading">
            <h2 id="reserva-heading" className={propios.reservaTitulo}>
              <RevealWords segments={[{ text: '¿Le hacemos su retrato?' }]} />
            </h2>
            <p className={propios.reservaTexto}>
              Dinos cómo se llama, qué animal es y si sale la familia. Te contestamos normalmente el mismo día.
            </p>
            <div className={styles.ctaRow}>
              <LeadLink
                formId="reserva-sesion-mascotas"
                method="whatsapp"
                href={wa(n.whatsapp.reserva)}
                className={styles.cta}
                target="_blank"
                rel="noreferrer"
              >
                Reservar por WhatsApp
                <ArrowGlyph />
              </LeadLink>
              <LeadLink formId="reserva-sesion-mascotas" method="email" href={correo} className={styles.secondaryCta}>
                Escribir a {site.email}
                <ArrowGlyph dir="right" />
              </LeadLink>
            </div>
            <p className={propios.reservaPie}>
              ¿Cachorros, animales mayores o exóticos? <Link href={mascotas.route}>Todas las sesiones de Eme &amp; Compañía</Link>.
            </p>
          </section>
        </ScrollReveal>
      </article>
    </div>
  );
}
