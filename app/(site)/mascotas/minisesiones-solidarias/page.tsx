import Image from 'next/image';
import Link from 'next/link';
import { minisesiones as n, faqsMinisesiones } from '@/content/minisesiones-solidarias';
import { mascotas } from '@/content/mascotas';
import { site } from '@/content/site';
import { turno } from '@/lib/turno';
import { breadcrumbSchema, faqSchema, jsonLd } from '@/lib/schema';
import { buildMetadata, ogImage } from '@/lib/seo';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { RevealWords } from '@/components/motion/RevealWords';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';
import { PlusIcon } from '@/components/ui/Icon';
import { LeadLink } from '@/components/analytics/LeadLink';
import styles from '../../servicios/page.module.css';
import faqStyles from '@/components/sections/Faq.module.css';
import propios from '../page.module.css';
import mini from './page.module.css';

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
 * /mascotas/minisesiones-solidarias: minisesiones de Eme & Compañía durante
 * todo el año, a favor de Pelos y Señales.
 *
 * Primera página del embudo de mascotas (ver content/minisesiones-solidarias.ts).
 * Antes era /mascotas/navidad, que redirige aquí.
 * Misma maqueta que /mascotas, de la que es hija, y la misma llamada a
 * WhatsApp; cada botón cuenta como contacto en Analytics con su `form_id`,
 * que es el identificador que usará el CRM cuando lo haya.
 */
export default function Page() {
  const wa = (texto: string) => `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(texto)}`;
  const correo = `mailto:${site.email}?subject=${encodeURIComponent('Minisesiones solidarias de Eme & Compañía')}`;
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
              { name: 'Minisesiones solidarias', path: n.route },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(faqsMinisesiones)) }}
      />
      <ScrollReveal className={styles.revealWrap}>
        <article className={styles.servicio}>
          <header className={styles.opener}>
            <div className={styles.openerCopy}>
              <p className={styles.formato}>{n.marca}</p>
              <h1 id="minisesiones-heading" className={styles.name}>
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
                  formId="reserva-minisesion"
                  method="whatsapp"
                  href={wa(n.whatsapp.reserva)}
                  className={styles.cta}
                  target="_blank"
                  rel="noreferrer"
                >
                  Reservar mi turno
                  <ArrowGlyph />
                </LeadLink>
              </div>
            </div>
            <div className={`${styles.imageWrap} ${propios.heroFoto}`}>
              <Image
                src={n.hero.src}
                alt={n.hero.alt}
                fill
                sizes="(max-width: 900px) 100vw, 560px"
                className={styles.image}
                priority
              />
            </div>
          </header>

          {/* LA MUESTRA. La primera minisesión de verdad, con sus fotos y el
              texto que aprobó charo. Es el mejor argumento de la página: se ve
              lo que uno se lleva y a quién ayuda. */}
          <section className={mini.muestra} aria-labelledby="muestra-heading">
            <div className={mini.muestraTexto}>
              <p className={styles.formato}>La primera minisesión</p>
              <h2 id="muestra-heading" className={propios.reservaTitulo}>
                <RevealWords segments={[{ text: n.muestra.titulo }]} />
              </h2>
              <p className={mini.muestraParrafo}>{n.muestra.texto}</p>
              <a href={n.solidario.enlace.href} className={styles.secondaryCta} target="_blank" rel="noreferrer">
                {n.solidario.enlace.texto}
                <ArrowGlyph />
              </a>
            </div>
            <div className={mini.muestraFotos}>
              {n.muestra.fotos.map((f) => (
                <figure
                  key={f.src}
                  className={propios.galeriaFoto}
                  style={{ aspectRatio: `${f.width} / ${f.height}` }}
                >
                  <Image
                    src={f.src}
                    alt={f.alt}
                    fill
                    sizes="(max-width: 700px) 92vw, 580px"
                    className={`${styles.image} ${propios.galeriaImagen}`}
                  />
                </figure>
              ))}
            </div>
          </section>

          <section className={mini.solidario} aria-labelledby="solidario-heading">
            <h2 id="solidario-heading" className={propios.reservaTitulo}>
              {n.solidario.titulo}
            </h2>
            <p className={propios.reservaTexto}>{n.solidario.texto}</p>
            <a href={n.solidario.enlace.href} className={styles.secondaryCta} target="_blank" rel="noreferrer">
              {n.solidario.enlace.texto}
              <ArrowGlyph dir="right" />
            </a>
          </section>

          <section className={styles.capitulo} aria-labelledby="detalles-heading">
            <h2 id="detalles-heading" className={styles.capituloTitulo}>
              Fechas, sitio y precio
            </h2>
            {detalles.length > 0 ? (
              <dl className={mini.detalles}>
                {detalles.map(([k, label]) => (
                  <div key={k} className={mini.detalle}>
                    <dt>{label}</dt>
                    <dd>{n.detalles[k]}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={propios.reservaTexto}>
                Hacemos convocatorias durante todo el año y cada una se anuncia aquí. Escríbenos por WhatsApp y te
                avisamos en cuanto se abran los turnos de la próxima: las plazas son pocas.
              </p>
            )}
          </section>

          <section className={styles.capitulo} aria-labelledby="proceso-heading">
            <h2 id="proceso-heading" className={styles.capituloTitulo}>
              Cómo es una minisesión
            </h2>
            <div className={styles.pasos} role="list" aria-label="Cómo es una minisesión">
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

          <section className={mini.solidario} aria-labelledby="regalo-heading">
            <h2 id="regalo-heading" className={propios.reservaTitulo}>
              {n.regalo.titulo}
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

          <section className={faqStyles.section} aria-labelledby="faq-minisesiones-heading">
            <div className={faqStyles.encabezado}>
              <p className={faqStyles.eyebrow}>Antes de escribir</p>
              <h2 id="faq-minisesiones-heading" className={faqStyles.titulo}>
                Preguntas frecuentes
              </h2>
            </div>
            <div className={faqStyles.lista}>
              {faqsMinisesiones.map((f) => (
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
              ¿Le guardamos un turno?
            </h2>
            <p className={propios.reservaTexto}>
              Dinos cómo se llama y qué animal es. Te contestamos normalmente el mismo día.
            </p>
            <div className={styles.ctaRow}>
              <LeadLink
                formId="reserva-minisesion"
                method="whatsapp"
                href={wa(n.whatsapp.reserva)}
                className={styles.cta}
                target="_blank"
                rel="noreferrer"
              >
                Reservar por WhatsApp
                <ArrowGlyph />
              </LeadLink>
              <LeadLink formId="reserva-minisesion" method="email" href={correo} className={styles.secondaryCta}>
                Escribir a {site.email}
                <ArrowGlyph dir="right" />
              </LeadLink>
            </div>
            <p className={propios.reservaPie}>
              ¿Prefieres una sesión completa? <Link href={mascotas.route}>Todas las sesiones de Eme &amp; Compañía</Link>.
            </p>
          </section>
        </article>
      </ScrollReveal>
    </div>
  );
}
