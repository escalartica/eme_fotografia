import Image from 'next/image';
import Link from 'next/link';
import { services } from '@/content/services';
import { focusOf } from '@/lib/focal';
import { buildMetadata, ogImage } from '@/lib/seo';
import { AmbientVideo } from '@/components/motion/AmbientVideo';
import { Cifras } from '@/components/sections/Cifras';
import { RevealWords } from '@/components/motion/RevealWords';
import { turno } from '@/lib/turno';
import styles from './page.module.css';

/**
 * Índice de servicios.
 *
 * Esta página tuvo durante un tiempo los dos servicios enteros dentro, uno
 * detrás de otro, con dos anclas. Son dos decisiones de compra distintas —hay
 * parejas que ya tienen fotógrafo y buscan solo la película, y al revés— y
 * compartían `<title>`, `description` y un único `<h1>`, así que ninguna de
 * las dos podía competir por su propia búsqueda. Ahora cada servicio tiene su
 * URL y aquí queda lo único que no cabe en ninguna de las dos: la elección.
 *
 * El argumento de por qué foto y vídeo juntos salen mejor NO se repite aquí:
 * vive en la guía de la home (`GuiaBodasSevilla`), que es su casa.
 */
export const metadata = buildMetadata({
  // El <title> NO repite el <h1>. Con el anterior ('Fotografía y vídeo de
  // bodas en Sevilla') este índice y la home se presentaban en Google con el
  // mismo rótulo salvo una letra —'Fotógrafo' / 'Fotografía'— y competían
  // entre sí. 'Reportaje de boda' es además la forma en que la pareja nombra
  // lo que viene a comparar aquí.
  title: 'Reportaje de boda y vídeo en Sevilla',
  description:
    'Dos servicios y un mismo equipo: reportaje de fotografía y película de boda. Qué incluye cada uno, cómo trabajamos el día y bodas reales en Sevilla.',
  path: '/servicios',
  // LA TARJETA DE ENLACE ES UNA FOTOGRAFÍA, no el logotipo.
  // Todas las páginas menos las fichas de boda compartían la misma tarjeta
  // genérica --la marca sobre fondo oscuro-- así que un estudio de fotografía
  // que se manda por WhatsApp aparecía como un wordmark. La imagen ES el
  // producto y es lo único que se ve en una previsualización antes de decidir
  // si se pincha. `ogImage()` cambia la extensión al derivado JPEG de 1200x630
  // que vive al lado de cada foto (WhatsApp no pinta WebP; ver lib/seo.ts).
  image: ogImage('/images/trabajos/eva-y-rafa/novia-ramo.webp'),
});

export default function Page() {
  return (
    <div className={styles.indexPage}>
      <header className={styles.indexHeader}>
        <p className={styles.kicker}>Servicios</p>
        <h1 className={styles.indexTitle}>
          {/* Palabra a palabra, como el resto de titulares del sitio. Era el
              único encabezado de página que aparecía de golpe. */}
          <RevealWords
            segments={[
              { text: 'Fotografía y vídeo ' },
              { text: 'de bodas en Sevilla', em: true },
            ]}
            emClassName={styles.indexTitleEm}
          />
        </h1>
        <p className={styles.indexLead} style={turno(0)}>
          Podéis contratar uno o los dos. Aquí está qué incluye cada uno y cómo trabajamos el
          día de la boda.
        </p>
      </header>

      {/* EL ÍNDICE, NO UNA REJILLA DE TARJETAS.
          Dos tarjetas del mismo tamaño puestas una al lado de otra se leen
          como un formulario: dos opciones equivalentes que hay que comparar
          campo a campo. Esta página existe para que una pareja ELIJA, y una
          elección se lee mejor en vertical, una debajo de otra, con cada
          nombre a tamaño de titular y su imagen al lado. Es el mismo gesto
          que ya hace el índice de /trabajos, y el que trajo el cliente de
          agentura.framer.website/projects: el nombre manda, la imagen
          acompaña.
          Las dos filas alternan el lado de la imagen. No es adorno: obliga a
          recorrer la página en zigzag y eso hace que cada servicio se mire
          por separado en vez de compararlos de un golpe. */}
      <ol className={styles.index} role="list">
        {services.map((service, index) => {
          // «Fotografía de boda» -> «Fotografía» + «de boda». El segundo
          // tramo va en cursiva, el mismo par recto/cursiva que usa el resto
          // de titulares del sitio.
          const corte = service.name.lastIndexOf(' de ');
          const principal = corte > 0 ? service.name.slice(0, corte) : service.name;
          const resto = corte > 0 ? service.name.slice(corte + 1) : '';
          return (
            <li key={service.slug} className={styles.row}>
              <Link href={service.route} className={styles.rowLink} data-cursor="ver">
                {/* CADA MARCO CON LA FORMA DE SU MATERIAL: vertical el de
                    fotografía, apaisado el de película. Que no midan lo mismo
                    no es un descuido, es la diferencia entre los dos formatos
                    dicha con la maquetación. Y el de vídeo enseña vídeo: la
                    única diferencia real entre los dos servicios es que uno
                    se mueve, y antes había que leerla en el rótulo. */}
                <span className={`${styles.rowFrame} ${service.previewVideo ? styles.rowFrameFilm : ''}`}>
                  {service.previewVideo ? (
                    <AmbientVideo
                      src={service.previewVideo.src}
                      poster={service.previewVideo.poster}
                      className={styles.rowMedia}
                    />
                  ) : (
                    service.previewImage && (
                      <Image
                        src={service.previewImage}
                        alt={service.previewImageAlt ?? ''}
                        fill
                        sizes="(max-width: 900px) 92vw, 560px"
                        className={styles.rowMedia}
                        priority={index === 0}
                        style={focusOf(service.previewImage)}
                      />
                    )
                  )}
                </span>
                <span className={styles.rowBody}>
                  {/* Palabra a palabra, igual que el <h1> de arriba y que
                      los nombres del índice de /trabajos. Era el único
                      titular de esta página que aparecía de golpe, y es
                      justo el que la pareja viene a leer. El tramo en
                      cursiva se declara como tal y no como un <em> aparte:
                      así la cursiva entra dentro de la misma cascada de
                      palabras en vez de llegar suelta detrás. */}
                  <h2 className={styles.rowName}>
                    <RevealWords
                      segments={
                        resto
                          ? [{ text: `${principal} ` }, { text: resto, em: true }]
                          : [{ text: principal }]
                      }
                      emClassName={styles.rowNameEm}
                    />
                  </h2>
                  <span className={styles.rowTagline} style={turno(1)}>{service.tagline}</span>
                  <span className={styles.rowCta} style={turno(2)}>
                    Ver qué incluye
                    <span className="arrow" aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* LA PÁGINA NO SE ACABA EN EL MENÚ. Aquí terminaba: antetítulo, titular,
          dos filas y nada más. Quien llega comparando estudios se queda con la
          elección hecha y sin un solo motivo para fiarse de quien se la
          ofrece, ni nada que hacer a continuación.
          Estas dos cifras no son un adorno: son el recibo. Y están enlazadas a
          Bodas.net, o sea comprobables por alguien que no nos conoce de nada.
          Cuentan al entrar en pantalla (components/motion/Contador), que es lo
          que hace que se lean en vez de pasar de largo. */}
      <Cifras />

      <div className={styles.cierre}>
        <p className={styles.cierreTexto}>
          Si no tenéis claro cuál de los dos, escribidnos con la fecha y el sitio: os decimos
          qué encaja y qué no, sin compromiso.
        </p>
        <Link href="/contacto" className={styles.cierreCta}>
          Consultar vuestra fecha
          <span className="arrow" aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
