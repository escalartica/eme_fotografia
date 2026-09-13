import Image from 'next/image';
import { ContactForm } from '@/components/ui/ContactForm';
import { Faq } from '@/components/sections/Faq';
import { faqs } from '@/content/faq';
import { site } from '@/content/site';
import { formatRating } from '@/lib/format';
import { buildMetadata, ogImage } from '@/lib/seo';
import { faqSchema, jsonLd } from '@/lib/schema';
import { MailIcon, InstagramIcon, FacebookIcon, ExternalLinkIcon, TikTokIcon, WhatsAppIcon } from '@/components/ui/Icon';
import styles from './page.module.css';
import { RevealWords } from '@/components/motion/RevealWords';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

export const metadata = buildMetadata({
  title: 'Contacto y fechas libres para vuestra boda',
  // 154 caracteres. La anterior medía 169 y clampDescription cortaba en la
  // primera frase (100 caracteres), o sea que la SERP nunca llegaba a decir
  // que contestamos nosotros y en el día.
  description:
    'Contadnos la fecha y el lugar de vuestra boda en Sevilla o en Andalucía y os decimos si la tenemos libre. Respondemos nosotros, casi siempre el mismo día.',
  path: '/contacto',
  // LA TARJETA DE ENLACE ES UNA FOTOGRAFÍA, no el logotipo.
  // Todas las páginas menos las fichas de boda compartían la misma tarjeta
  // genérica --la marca sobre fondo oscuro-- así que un estudio de fotografía
  // que se manda por WhatsApp aparecía como un wordmark. La imagen ES el
  // producto y es lo único que se ve en una previsualización antes de decidir
  // si se pincha. `ogImage()` cambia la extensión al derivado JPEG de 1200x630
  // que vive al lado de cada foto (WhatsApp no pinta WebP; ver lib/seo.ts).
  image: ogImage('/images/trabajos/carmen-y-alberto/06.webp'),
});

// What happens after the form is sent -- three real, verifiable steps
// (availability reply, a conversation, then the booking), so the page
// answers "y luego qué" before anyone has to ask.
const NEXT_STEPS = [
  { title: 'Os respondemos', text: 'Leemos cada mensaje personalmente y os confirmamos si tenemos libre vuestra fecha.' },
  { title: 'Hablamos', text: 'Una videollamada o un café donde os venga bien. Sin presupuesto por delante: primero vemos si encajamos.' },
  { title: 'Reserváis la fecha', text: 'Si encajamos, con un contrato sencillo y una señal queda reservado el equipo para vuestro día, y empezamos a planificarlo con vosotros.' },
];

export default function Page() {
  return (
    <div className={styles.page}>
      {/* FAQPage. The local copy this replaces marked up ALL the entries,
          including the ones flagged isPendingConfirmation in content/faq.ts
          (antelación, reserva, plazos de entrega, derechos de imagen,
          cambio de fecha, cuántos vamos) -- a rich result is a public
          promise, and publishing one on a figure the studio has not signed
          off is what earns a manual action. The shared helper in
          lib/schema.ts marks up only the confirmed ones. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(faqs)) }}
      />
      <div className={styles.layout}>
        {/* <div>, no <aside>. <aside> emite un landmark "complementary",
            o sea "contenido tangencial al principal", y aquí dentro estaban
            el <h1> de la página, los datos de contacto y los pasos: es la
            columna principal, no un margen. Un lector de pantalla que
            recorre la página por landmarks se saltaba justo lo que la
            pareja viene a leer (WCAG 1.3.1). */}
        <div className={styles.side}>
          <p className={styles.eyebrow}>Escribidnos</p>
          <h1 className={styles.title}>
            <RevealWords segments={[{ text: 'Hablemos de ' }, { text: 'vuestro día.', em: true }]} />
          </h1>
          <p className={styles.lead}>
            Contadnos la fecha, el lugar y cómo os imagináis el día. Con eso nos basta para deciros si estamos
            libres y qué podemos hacer por vosotros.
          </p>
          {/* Los dos atajos, en su propia rejilla para que caigan uno
              debajo del otro. Ver `.atajos` en la hoja de esta página. */}
          <div className={styles.atajos}>
            {/* Phones stack the columns, so the form starts a screen and a
                half down: one link takes them straight to it. */}
            <a href="#formulario" className={styles.jump}>
              Ir al formulario
              <ArrowGlyph dir="down" />
            </a>
          {/* Las preguntas están al pie, debajo del formulario, y las tres
              primeras (¿tenéis libre mi fecha?, ¿con cuánta antelación?,
              ¿cuánto cuesta?) son justo las que traen antes de escribir.
              Este enlace las pone a un clic sin bajar el formulario media
              página, que es lo que costaría subirlas. */}
            <a href="#preguntas-frecuentes" className={styles.jumpFaq}>
              ¿Tienes dudas?
              <ArrowGlyph dir="down" />
            </a>
          </div>

          <figure className={styles.figure}>
            <Image
              src="/images/trabajos/carmen-y-alberto/06.webp"
              alt="Los novios frente a frente bajo el velo"
              width={1600}
              height={1067}
              sizes="(max-width: 900px) 100vw, 38vw"
              className={styles.image}
            />
          </figure>

          <dl className={styles.contactList}>
            <div className={styles.contactRow}>
              <dt>Correo</dt>
              <dd>
                <a href={`mailto:${site.email}`} className={styles.contactLink}>
                  <MailIcon size={16} />
                  {site.email}
                </a>
              </dd>
            </div>
            <div className={styles.contactRow}>
              <dt>WhatsApp</dt>
              <dd>
                <a
                  href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent('Hola, me gustaría informarme sobre vuestra cobertura de boda.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  <WhatsAppIcon size={16} />
                  {site.phoneDisplay}
                </a>
              </dd>
            </div>
            <div className={styles.contactRow}>
              <dt>Redes</dt>
              <dd className={styles.contactInline}>
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                  <InstagramIcon size={16} />
                  Instagram
                </a>
                <a href={site.facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                  <FacebookIcon size={16} />
                  Facebook
                </a>
                <a href={site.tiktokUrl} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                  <TikTokIcon size={16} />
                  TikTok
                </a>
              </dd>
            </div>
            <div className={styles.contactRow}>
              <dt>Opiniones</dt>
              <dd>
                <a href={site.bodasNetUrl} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                  <ExternalLinkIcon size={16} />
                  {formatRating(site.bodasNetRating)} en Bodas.net · {site.bodasNetReviewCount} opiniones
                </a>
              </dd>
            </div>
            <div className={styles.contactRow}>
              <dt>Base</dt>
              {/* Sólo «Sevilla». Aquí ponía el pueblo, la provincia y una
                  aclaración de que no hay local -- tres datos para responder
                  «¿dónde estáis?», y el único que la pareja necesita antes de
                  escribir es la ciudad. La localidad exacta sigue en
                  content/site.ts, que es de donde sale la dirección del
                  esquema de datos estructurados. */}
              <dd>{site.legalCity}</dd>
            </div>
            <div className={styles.contactRow}>
              <dt>Zona</dt>
              {/* Ya no repite «Sevilla»: la fila de arriba lo acaba de decir. */}
              <dd>Toda Andalucía; también nos desplazamos fuera</dd>
            </div>
          </dl>

          <ol className={styles.nextSteps} role="list" aria-label="Qué pasa después de escribirnos">
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title} className={styles.nextStep}>
                <span className={styles.nextNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <span className={styles.nextTitle}>{s.title}</span>
                  <p className={styles.nextText}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <section id="formulario" className={styles.formPanel} aria-labelledby="form-heading">
          {/* ESTE TITULAR NO LLEVA REVELADO POR PALABRAS, y es deliberado.
              Vive dentro de `.formPanel`, que de 960 px para arriba es
              `position: sticky`. RevealWords se mide con
              `animation-timeline: view()`, o sea contra la pantalla, y un
              elemento anclado no se mueve respecto a ella: su progreso se
              congela en cuanto se pega, y las palabras se quedarían a medio
              subir durante todo el rato que dure el formulario. Mismo motivo
              por el que «Quién soy» tampoco lo lleva en /sobre-nosotros. */}
          <h2 id="form-heading" className={styles.formHeading}>
            Consultadnos vuestra fecha
          </h2>
          <p className={styles.formHint}>Seis preguntas cortas, una por pantalla. Se responde en menos de dos minutos.</p>
          <ContactForm />
          <p className={styles.privacy}>
            Solo usamos vuestros datos para responderos. Si lo preferís, escribidnos directamente a{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </section>
      </div>

      <div className={styles.faqWrap}>
        <Faq />
      </div>
    </div>
  );
}
