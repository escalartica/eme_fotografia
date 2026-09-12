import type { ReactNode } from 'react';
import Link from 'next/link';
import { site } from '@/content/site';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './GuiaBodasSevilla.module.css';
import { RevealWords } from '@/components/motion/RevealWords';

/**
 * The home page's one block of real prose -- ahora como ÍNDICE DESPLEGABLE.
 *
 * POR QUÉ EXISTE (no ha cambiado): todo lo demás en esta página es una
 * fotografía, un nombre y un año. Medido contra las páginas que rankean por
 * «fotografía bodas Sevilla» --entre 1.200 y 3.000 palabras cada una, con
 * apartados de precio, de qué incluye un reportaje y de dónde se trabaja--,
 * esta portada tenía unas 430 palabras y casi todas eran nombres de parejas.
 * Ni un buscador ni una pareja con una duda encontraban nada que leer.
 *
 * POR QUÉ HA CAMBIADO DE FORMA. El estudio lo dijo con estas palabras:
 * «resulta aburrido y tedioso de leer». Y el diagnóstico es exacto. Eran
 * seiscientas cincuenta palabras repartidas en seis bloques IDÉNTICOS, todos
 * abiertos, todos del mismo tamaño y todos del mismo color, puestos en dos
 * columnas al final de una portada que hasta ese punto era sólo fotografía.
 * Nadie lee eso. Quien tenía una duda concreta --¿cuánto cuesta?, ¿con cuánta
 * antelación?-- tenía que barrer seiscientas palabras para encontrarla.
 *
 * Ahora son una PILA ANCLADA, el mismo gesto que el manifiesto del principio
 * de la página: cada pregunta se queda pegada bajo la cabecera y la siguiente
 * sube y la tapa. Se lee una por pantalla.
 *
 * Fue antes un acordeón de `<details>`, que resolvía el muro pero a cambio de
 * un clic por respuesta y de que en reposo la sección fueran seis líneas.
 * La pila no cobra ese peaje: está todo visible y aun así nunca hay más de
 * una respuesta delante. Y ocupa menos scroll del que parece, porque el
 * apilado ocurre dentro de la altura de las filas en vez de sumarse a ella.
 *
 * Y SIGUE ESTANDO TODO EN EL DOCUMENTO --ahora, además, visible-- que es la
 * parte por la que esta sección existe: seiscientas cincuenta palabras que un
 * buscador puede leer entre las fotografías.
 *
 * Sigue siendo el nudo de enlaces internos de esta página: las cuatro rutas
 * públicas se alcanzan desde aquí dentro de una frase, en contexto.
 */

type Bloque = {
  n: string;
  /** La frase que abre el bloque. Es el <h3> dentro del <summary>. */
  titulo: string;
  /** La pregunta que responde, debajo del título y más pequeña. */
  pregunta: string;
  cuerpo: ReactNode;
};

const BLOQUES: Bloque[] = [
  {
    n: '01',
    titulo: 'Una boda no se dirige. Se vive.',
    pregunta: 'Qué es un reportaje de boda para nosotros',
    cuerpo: (
      <>
        <p>
          Un día así no admite repeticiones. Nuestro papel es estar cerca sin interferir: la
          emoción contenida de la mañana, la mirada de un padre en el umbral, el rostro de la madre
          en la ceremonia, la luz dorada en el campo y la energía de la fiesta hasta que se apague
          la música. Solo detendremos el tiempo unos minutos cuando realmente aporte valor: para
          vuestro retrato de pareja.
        </p>
        <p>
          Por eso mostramos{' '}
          <Link href="/trabajos">reportajes completos y no solo las diez fotos más vistosas</Link>:
          reunir un par de imágenes bonitas está al alcance de cualquiera; sostener el ritmo, la luz
          y la verdad durante doce horas de boda, no.
        </p>
      </>
    ),
  },
  {
    n: '02',
    titulo: 'Dos lenguajes, una misma mirada',
    pregunta: 'Fotografía y película nacidas del mismo equipo',
    cuerpo: (
      <>
        <p>
          Hacemos foto y vídeo, y es como mejor trabajamos: compartimos la misma paleta de color,
          la misma estética cinematográfica y la misma discreción en el terreno de juego. Sin la
          incomodidad de coordinar proveedores desconocidos ni choques de espacio en los momentos
          clave. Podéis contratar los servicios por separado —{' '}
          <Link href="/servicios/fotografia-de-boda">fotografía</Link> o{' '}
          <Link href="/servicios/video-de-boda">vídeo</Link> —, pero cuando van de la mano, el
          resultado se multiplica.
        </p>
        <p>
          Un equipo permanente de cinco especialistas liderado por{' '}
          <Link href="/sobre-nosotros">{site.founderName}</Link>.
        </p>
      </>
    ),
  },
  {
    n: '03',
    titulo: 'Nuestra base en Sevilla. Vuestra historia, donde queráis.',
    pregunta: 'Dónde trabajamos',
    cuerpo: (
      <p>
        Nos movemos entre haciendas, cortijos, basílicas y rincones de toda Andalucía (Cádiz,
        Huelva, Córdoba, Málaga, Granada, Jaén y Almería) y cualquier destino nacional o
        internacional. El desplazamiento se calcula de forma transparente en la propuesta inicial:
        sin costes ocultos ni sorpresas de última hora.
      </p>
    ),
  },
  {
    n: '04',
    titulo: 'Packs y presupuestos a medida, sin sorpresas',
    pregunta: 'Cuánto cuesta y por qué no usamos tarifas cerradas',
    cuerpo: (
      <p>
        Porque no hay dos bodas idénticas. Tenemos packs montados para las combinaciones que más
        nos piden —solo fotografía, solo vídeo, las dos cosas— y presupuestos a medida para las
        bodas que no encajan en ninguno. En los dos casos el coste depende de las horas de
        cobertura, de si añadís preboda o álbum y de la localización. Preferimos{' '}
        <Link href="/contacto">diseñaros una propuesta transparente y clara</Link> para vuestro día
        concreto en lugar de publicar un precio «desde» que no refleje la realidad de lo que
        acabaréis contratando.
      </p>
    ),
  },
  {
    n: '05',
    titulo: 'Reservad con tiempo',
    pregunta: 'Con cuánta antelación conviene reservar',
    cuerpo: (
      <p>
        Las bodas de primavera y las de septiembre-octubre suelen cerrarse con un año de
        antelación; para el resto de temporadas, seis meses suelen ser suficientes. No obstante,
        consultadnos siempre: a veces hay vacantes de última hora. La fecha se reserva de forma
        sencilla mediante contrato y señal, y desde ese momento el equipo que hayamos acordado es
        vuestro.
      </p>
    ),
  },
  {
    n: '06',
    titulo: 'Entrega y plazos de visualización',
    pregunta: 'Cuándo tendréis vuestro recuerdo',
    cuerpo: (
      <>
        {/* Una <dl>, no una lista con topos: son pares plazo//valor y el
            proyecto no usa viñetas para contenido de servicio. Cada término
            es el plazo, que es el dato que la pareja busca. */}
        <dl className={styles.plazos}>
          <div className={styles.plazo}>
            <dt>Adelanto en pocos días</dt>
            <dd>
              Una primera selección fotográfica para revivir los mejores momentos mientras dura el
              subidón del evento.
            </dd>
          </div>
          <div className={styles.plazo}>
            <dt>Galería fotográfica completa</dt>
            <dd>Entre tres y seis meses.</dd>
          </div>
          <div className={styles.plazo}>
            <dt>Película de boda</dt>
            <dd>
              Entre seis meses y un año. Montar una boda entera lleva mucho más trabajo del que
              parece, y preferimos daros el plazo de verdad.
            </dd>
          </div>
        </dl>
        <p>
          Entregas en una plataforma privada protegida con clave, para ver y descargar vuestro
          reportaje con total intimidad.
        </p>
      </>
    ),
  },
];

export function GuiaBodasSevilla() {
  return (
    <section className={styles.section} aria-labelledby="guia-heading">
      <ScrollReveal>
        <div className={styles.encabezado}>
          <p className={styles.eyebrow}>Antes de escribirnos</p>
          {/* El <h2> de la sección, del que cuelgan los seis <h3> de abajo.
              Antes «Antes de escribirnos» era a la vez el rótulo y el
              encabezado, y no decía qué había debajo. Ahora el rótulo se queda
              con esas tres palabras y el encabezado dice lo que hay. */}
          {/* Sin frase debajo. Había una --«Abrid la vuestra…»-- que daba una
              instrucción para un desplegable, y ya no hay desplegable: las
              seis se leen solas, una por pantalla. Un titular que se explica
              a sí mismo no necesita pie. */}
          <h2 id="guia-heading" className={styles.titulo}>
            <RevealWords segments={[{ text: 'Las seis preguntas que nos hacen siempre.' }]} />
          </h2>
        </div>
      </ScrollReveal>

      {/* LAS SEIS, COMO PILA ANCLADA -- el mismo gesto que el manifiesto de
          más arriba («Menos protocolo. Más verdad.»), que es lo que pidió el
          estudio.

          Cada fila se queda pegada bajo la cabecera fija y la siguiente sube
          por debajo y la tapa. Dos consecuencias, y las dos son el motivo de
          hacerlo así:

           1. SE LEE UNA POR PANTALLA. Estas seiscientas cincuenta palabras
              han sido ya dos cosas: seis bloques abiertos a la vez --un muro
              de texto-- y seis desplegables --seis líneas y un clic por
              respuesta--. La pila es la tercera y la buena: está todo
              visible, pero nunca hay más de una respuesta en pantalla.
           2. Y CUESTA MENOS SCROLL DEL QUE PARECE. El documento sólo crece lo
              que suman las filas, porque el apilado ocurre DENTRO de esa
              distancia en vez de sumarse a ella. Es la misma cuenta que
              documenta Manifiesto.module.css.

          Sigue sin JavaScript: todo es `position: sticky` y un fondo opaco.
          Y sigue estando todo el texto en el HTML, que es por lo que esta
          sección existe. */}
      <ol className={styles.lista}>
        {BLOQUES.map((b) => (
          <li key={b.n} className={styles.item}>
            <span className={styles.numero} aria-hidden="true">
              {b.n}
            </span>
            <div className={styles.textos}>
              <h3 className={styles.subtitulo}>
                <RevealWords segments={[{ text: b.titulo }]} />
              </h3>
              <span className={styles.pregunta}>{b.pregunta}</span>
              <div className={styles.cuerpo}>{b.cuerpo}</div>
            </div>
          </li>
        ))}
      </ol>

      <ScrollReveal delay={0.1}>
        <div className={styles.closingBlock}>
          <h3 className={styles.closingHeading}>¿Tenéis fecha y lugar?</h3>
          <p className={styles.closing}>
            Si habéis llegado hasta aquí, lo que falta es lo más rápido: contadnos vuestra idea y
            os confirmaremos disponibilidad de inmediato.
          </p>
          <Link href="/contacto" className={styles.closingLink}>
            Contadnos vuestra idea
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
