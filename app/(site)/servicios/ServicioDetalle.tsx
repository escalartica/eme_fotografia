import Image from 'next/image';
import Link from 'next/link';
import type { Service } from '@/content/types';
import { focusOf } from '@/lib/focal';
import { turno } from '@/lib/turno';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { RevealWords } from '@/components/motion/RevealWords';
import { ShowreelClip } from '@/components/sections/ShowreelClip';
import { VolverA } from '@/components/ui/VolverA';
import styles from './page.module.css';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

/**
 * La página de un servicio: qué es, qué incluye, cómo se trabaja y el trabajo
 * real.
 *
 * POR CAPÍTULOS, NO EN UNA COLUMNA. Todo esto vivía apilado dentro de una sola
 * columna de 34rem al lado de una foto: el titular, el texto, lo que incluye,
 * los extras, los cuatro pasos del proceso y los dos enlaces, uno detrás de
 * otro. Dos problemas, y el segundo es el grave:
 *
 *  1. Es un muro. La columna de texto era mucho más alta que la fotografía,
 *     así que media página era tipografía estrecha con un hueco al lado.
 *  2. LAS DOS LISTAS NO TENÍAN TÍTULO. «Incluye» y «Cómo trabajamos» existían
 *     solo como `aria-label`: quien ve la página encontraba dos listas
 *     numeradas idénticas, una detrás de otra, sin nada que dijera que la
 *     primera es lo que se lleva y la segunda cómo se trabaja. El lector de
 *     pantalla estaba mejor informado que el visitante.
 *
 * Ahora la página son capítulos con su rótulo visible, la apertura es un
 * encuadre de dos columnas con la pieza (fotografía o película) anclada al
 * lado, y las dos listas se distinguen a la vista: lo que incluye son
 * afirmaciones grandes; el proceso es una secuencia, con su numeral y una
 * línea que se dibuja según se baja.
 *
 * Un solo ScrollReveal en la raíz, sin anidar otro dentro: este proyecto ya se
 * ha encontrado dos veces con que el translateY de un ScrollReveal anidado
 * desplaza la medición del ScrollTrigger de su descendiente y le deja la
 * animación clavada a medias. Lo demás entra con animaciones guiadas por el
 * scroll desde CSS, que no mueven a nadie de sitio.
 */
export function ServicioDetalle({ service }: { service: Service }) {
  const esPelicula = Boolean(service.previewVideo);
  // LAS FOTOGRAFÍAS DEJAN DE ESTAR TODAS AL FINAL. Una sube a separar los dos
  // capítulos de texto y el resto forman el mural de abajo. Ver el comentario
  // de `.interludio` en la hoja de estilos.
  //
  // SUBE LA MÁS ANCHA, no la primera. El interludio es una banda de 2:1 que
  // llega a los 1.200 px de la caja, o sea la caja más grande de la página:
  // ponerle el fichero más pequeño de la galería sería estrenar aquí el
  // problema que esta web lleva tres rondas corrigiendo. Con `>` y no `>=` el
  // desempate se queda con la primera, así que el orden de content/services.ts
  // sigue mandando cuando hay dos del mismo ancho.
  //
  // Se guarda el ÍNDICE y no la pieza: `foto('x')` devuelve siempre la misma
  // referencia de content/seleccion.ts, así que una galería que repitiera una
  // foto perdería las dos copias al filtrar por identidad.
  const galeria = service.gallery ?? [];
  const iInterludio = galeria.reduce(
    (mejor, item, i) => (item.width > galeria[mejor].width ? i : mejor),
    0,
  );
  const interludio = galeria[iInterludio];
  const mural = galeria.filter((_, i) => i !== iInterludio);
  return (
    <ScrollReveal className={styles.revealWrap}>
      <article className={styles.servicio}>
        <VolverA href="/servicios" nombre="Servicios" />

        <header className={`${styles.opener} ${service.previewImage || esPelicula ? '' : styles.noImage}`}>
          <div className={styles.openerCopy}>
            <p className={styles.formato}>{esPelicula ? 'Película' : 'Fotografía'}</p>
            <h1 id="servicio-heading" className={styles.name}>
              {/* Palabra a palabra, el mismo gesto que el resto de titulares. */}
              <RevealWords segments={[{ text: service.heading }]} />
            </h1>
            {/* LA APERTURA SE ASIENTA POR LINEAS. Debajo del titular habia
                tres parrafos que llegaban los tres a la vez, plantados, y era
                lo primero que se veia de la pagina: el titular se revelaba
                palabra a palabra y justo debajo caia un bloque de texto
                entero de golpe. `--turno` es el puesto de cada linea en la
                secuencia; la hoja de estilos lo convierte en retraso. */}
            <p className={styles.tagline} style={turno(0)}>
              {service.tagline}
            </p>
            {service.intro && (
              <p className={styles.intro} style={turno(1)}>
                {service.intro}
              </p>
            )}
            <p className={styles.idealFor} style={turno(2)}>
              {service.idealFor}
            </p>
          </div>

          {service.previewVideo ? (
            <div className={styles.imageWrap}>
              <ShowreelClip
                src={service.previewVideo.src}
                poster={service.previewVideo.poster}
                alt={service.previewVideo.alt}
                fill
              />
            </div>
          ) : service.previewImage && (
            <div className={styles.imageWrap}>
              <Image
                src={service.previewImage}
                alt={service.previewImageAlt ?? ''}
                fill
                // Tope fijo por encima de 1500 px: ahí .imageWrap deja de
                // crecer (ver su regla en page.module.css). Sin él, en un
                // monitor ancho se pedían 1.900 px de una fotografía que
                // tiene 1.333, o sea una ampliación del 42%.
                // La caja real no llega a 50vw: `.servicio` tope a 75rem
                // partido en dos columnas son ~540 px, no 750. Pedir 50vw
                // entre 900 y 1500 px de ventana era pedir un 40% más de
                // resolución de la que se pinta, en la página que vende
                // fotografía.
                sizes="(max-width: 900px) 100vw, 560px"
                className={styles.image}
                priority
                style={focusOf(service.previewImage)}
              />
            </div>
          )}
        </header>

        <section className={styles.capitulo} aria-labelledby="incluye-heading">
          <h2 id="incluye-heading" className={styles.capituloTitulo}>Lo que incluye</h2>
          <div className={styles.incluyeGrupo} role="list" aria-label={`Incluye — ${service.name}`}>
            {service.includes.map((item, itemIndex) => (
              <div
                key={item}
                role="listitem"
                className={styles.incluyeItem}
                style={turno(itemIndex)}
              >
                <span className={styles.itemNumber} aria-hidden="true">
                  {String(itemIndex + 1).padStart(2, '0')}
                </span>
                <p className={styles.incluyeTexto}>{item}</p>
              </div>
            ))}
          </div>

          {/* LOS EXTRAS, EN SU PROPIA LISTA Y CON SU PROPIO RÓTULO.
              El álbum, la preboda y el tráiler estaban mezclados con la
              cobertura del día en «Incluye», y eso es una promesa: quien
              contrate un pack que no los lleve llega a la entrega
              esperándolos. Aquí van con la palabra que les corresponde y sin
              numeral, porque no son pasos ni un orden: son opciones. */}
          {service.alsoAvailable && service.alsoAvailable.length > 0 && (
            <div className={styles.extras}>
              <p className={styles.extrasLabel}>Según el pack, o aparte</p>
              {/* `div role="list"`, no `<ul><li>`: esta página no marca el
                  contenido de servicio con topos (ver la prueba «never
                  renders service content as a bullet list»). Lo que separa un
                  ítem del siguiente es un punto medio puesto desde el CSS. */}
              <div
                className={styles.extrasList}
                role="list"
                aria-label={`Según el pack, o aparte — ${service.name}`}
              >
                {service.alsoAvailable.map((item, i) => (
                  <span
                    key={item}
                    role="listitem"
                    className={styles.extrasItem}
                    style={turno(i)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* EL INTERLUDIO. Entre los dos capítulos de texto va una fotografía a
            todo el ancho, y no es decoración: «Lo que incluye» y «Cómo
            trabajamos» son dos listas seguidas, y sin nada en medio la página
            se lee como un pliego de condiciones. Ésta es la razón por la que
            el estudio dijo que la página estaba «muy plana»: entre la
            apertura y el cierre no había una sola imagen, estaban todas
            amontonadas al final en una tira que hay que arrastrar.
            Es una fotografía de una boda de verdad, la misma que antes abría
            esa tira. */}
        {interludio && (
          <figure className={styles.interludio}>
            <div className={styles.interludioMarco}>
              {/* LA CAPA QUE SE MUEVE. El paralaje no puede ir sobre la
                  imagen: `<Image fill>` escribe su `height: 100%` en el
                  atributo `style`, y un estilo en línea le gana a cualquier
                  regla de la hoja. Así que lo que se sobredimensiona y se
                  desplaza es esta capa, y la imagen la rellena. */}
              <div className={styles.interludioCapa}>
                <Image
                  src={interludio.src}
                  alt={interludio.alt}
                  fill
                  sizes="100vw"
                  className={styles.image}
                  style={focusOf(interludio.src)}
                />
              </div>
            </div>
            {/* El pie se estrecha a la caja de 75rem aunque la banda vaya a
                sangre, para alinear con el resto del texto. Se hace con el
                ancho del propio <figcaption> y no metiéndolo en un <div>:
                el HTML exige que sea hijo directo de <figure>. */}
            <figcaption className={styles.interludioPie}>
              {esPelicula ? 'Un fotograma de una boda real' : 'Una fotografía de una boda real'}
            </figcaption>
          </figure>
        )}

        <section className={styles.capitulo} aria-labelledby="proceso-heading">
          <h2 id="proceso-heading" className={styles.capituloTitulo}>Cómo trabajamos</h2>
          {/* AQUÍ EL NUMERAL SÍ DICE ALGO. Esto es una secuencia: primero se
              habla, luego se rueda, luego se monta, luego se entrega. La línea
              de la izquierda se dibuja según se baja -- ver `.pasos::after` en
              el CSS --, que es la única animación nueva de esta página y está
              porque enseña algo de verdad: por dónde va uno del proceso. */}
          <div className={styles.pasos} role="list" aria-label={`Cómo trabajamos — ${service.name}`}>
            {service.process.map((step, i) => (
              <div
                key={step.step}
                role="listitem"
                className={styles.paso}
                style={turno(i)}
              >
                <span className={styles.itemNumber} aria-hidden="true">
                  {String(step.step).padStart(2, '0')}
                </span>
                <div className={styles.itemText}>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {mural.length > 0 && (
          <section className={styles.capituloAncho} aria-labelledby="trabajo-heading">
            {/* Palabra a palabra. Este rotulo SI puede: es el unico de los
                tres que no es `position: sticky`, y una revelacion guiada por
                `view()` dentro de una caja pegada se queda congelada a medias
                -- el proyecto ya lo tiene documentado en «Quien soy» y en el
                <h2> del formulario de contacto. */}
            <h2 id="trabajo-heading" className={styles.capituloTitulo}>
              <RevealWords segments={[{ text: 'De bodas reales' }]} />
            </h2>
            {/* UN MURAL, NO UNA TIRA QUE HAY QUE ARRASTRAR.
                Esto era un carril horizontal con la barra escondida: en un
                escritorio se veían dos fotografías y media y las otras tres
                sólo existían para quien adivinara que aquello se arrastraba.
                En una página que vende fotografía, tres de cada cinco
                fotografías invisibles es el fallo más caro que había.
                Ahora es una rejilla: cada fotografía conserva su propia forma
                --un plano de dron y un retrato no caben en la misma caja-- y
                las alturas desiguales son lo que hace que se lea como un
                pliego maquetado y no como una fila de miniaturas. Se ven
                todas de una vez, sin gestos que nadie descubre. */}
            <div className={styles.mural}>
              {mural.map((item) => (
                <figure
                  key={item.src}
                  className={styles.muralItem}
                  style={{ aspectRatio: `${item.width} / ${item.height}` }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 30vw"
                    className={styles.image}
                    style={focusOf(item.src)}
                  />
                </figure>
              ))}
            </div>
          </section>
        )}

        <div className={styles.cierreFicha}>
          <div className={styles.ctaRow}>
            <Link href="/contacto" className={styles.cta}>
              {service.ctaLabel}
              <ArrowGlyph />
            </Link>
            {service.relatedCategory && (
              <Link href={`/trabajos?categoria=${service.relatedCategory}`} className={styles.secondaryCta}>
                Ver trabajos de {service.name.toLowerCase().replace('fotografía de ', '')}
                <ArrowGlyph dir="right" />
              </Link>
            )}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}
