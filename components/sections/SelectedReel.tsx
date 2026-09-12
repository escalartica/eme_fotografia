import Image from 'next/image';
import Link from 'next/link';
import { resolveFeaturedFrames } from '@/content/featured';
import { RevealWords } from '@/components/motion/RevealWords';
import { focusOf } from '@/lib/focal';
import styles from './SelectedReel.module.css';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

// Eleven beats, one wedding each -- none of them repeated from the hero mosaic.
const frames = resolveFeaturedFrames();

/**
 * Los trabajos seleccionados como un CARRETE HORIZONTAL ANCLADO: la sección
 * se queda pegada a la pantalla y, mientras el visitante sigue bajando, las
 * once fotografías desfilan de derecha a izquierda por delante de él.
 *
 * POR QUÉ ESTE GESTO Y NO OTRO. Era una columna vertical de fotogramas
 * que se revelaban de uno en uno: correcta, y exactamente igual que la de
 * cualquier plantilla. El desplazamiento horizontal atado al scroll es el
 * único movimiento de esta página que un visitante no ha visto antes en otro
 * sitio, y es el que dice sin decirlo que detrás hay alguien que diseña.
 * Además la home ACORTA: la columna medía unos 4.800 px de recorrido; el
 * carrete se lleva 100svh de pantalla más --pin-travel, y enseña lo mismo.
 *
 * SIGUE SIN JAVASCRIPT. Todo el anclaje es `position: sticky` y toda la
 * traslación es una animación guiada por el scroll declarada con
 * `view-timeline-name`, que el navegador corre en el compositor. Componente
 * de servidor: cero bytes de cliente para esta sección, igual que antes.
 *
 * LO QUE PASA CUANDO EL EFECTO NO ESTÁ. Y aquí está la decisión que importa,
 * porque la mayoría de esta clientela entra de noche y desde el teléfono: el
 * carril NO es por defecto una caja recortada esperando a que una animación
 * la mueva -- eso dejaría diez fotografías inalcanzables en cuanto algo
 * fallara. Por defecto es una TIRA QUE SE ARRASTRA CON EL DEDO, con anclaje
 * de desplazamiento, que es el gesto nativo y el mejor de los dos en una
 * pantalla de 375 px. El anclaje sólo se activa a partir de 900 px, sin
 * `prefers-reduced-motion` y con soporte comprobado de las líneas de tiempo
 * guiadas por el scroll. Donde no se cumplen las tres condiciones, la
 * sección es una tira deslizable perfectamente digna. Ver
 * SelectedReel.module.css.
 */
export function SelectedReel() {
  return (
    <section className={styles.section} aria-labelledby="selected-work-heading">
      {/* LA ENTRADILLA Y UNA FOTOGRAFÍA, A DOS COLUMNAS.
          La entradilla está topada a 48rem para que el titular y la prosa se
          lean, y en un escritorio ancho eso dejaba media pantalla en blanco a
          su derecha: el estudio la señaló en una captura, rodeada en rojo.
          Ahí va ahora la fotografía que llevaban tres rondas pidiendo ver en
          grande -- el perro con pajarita de la boda de Maite y Nerea.
          Y VA AQUÍ Y NO EN UNA SECCIÓN PROPIA, que es lo que pidieron
          textualmente: «no quiero que crees un contenedor para esta foto,
          sino que la integres en algún apartado más vacío». Tenía una banda
          a sangre para ella sola y era justo lo contrario de integrarla.
          Aquí llena un hueco que ya existía y no alarga la portada ni un
          píxel en un escritorio. */}
      <div className={styles.cabecera}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Trabajos seleccionados</p>
          {/* Texto del estudio, literal -- partido en dos tramos sólo para
            marcar la cursiva, sin cambiar una letra. El mismo revelado por
            palabras del manifiesto y del cierre de la home.
            El espacio tras la coma va DENTRO del tramo: los tramos se
            concatenan tal cual, así que sin él "reales," e "historias" serían
            una sola palabra y la frase perdería su espacio. */}
          <h2 id="selected-work-heading" className={styles.statement}>
            <RevealWords
              segments={[
                { text: 'Bodas reales, ' },
                { text: 'historias irrepetibles.', em: true },
              ]}
            />
          </h2>
          <p className={styles.lead}>
            Centenares de bodas a las espaldas. Aquí tienes una pequeña muestra
            de todo lo que hemos vivido.
          </p>
          <Link href="/trabajos" className={styles.arrow}>
            Explorar más historias
            <ArrowGlyph />
          </Link>
        </div>

        {/* SIN PIE. Llevaba uno --«La favorita de eme»-- y el estudio lo quitó:
          una fotografía puesta en la portada de quien la hizo ya se está
          presentando sola, y etiquetarla como favorita le pide al visitante
          que la mire con una lupa que no necesita. El nombre de la pareja
          está al otro lado del enlace.
          La forma es la del fichero (1707x2560), así que se ve entera: es la
          razón por la que esta foto salió del carrete, que recorta las
          verticales a 3:4 y le mordía justo el primer plano. */}
        <div className={styles.retrato}>
          <Link
            href="/trabajos/maite-y-nerea"
            className={styles.retratoEnlace}
            data-cursor="ver"
          >
            <Image
              src="/images/trabajos/maite-y-nerea/cover.webp"
              alt="Las dos novias besándose al final del camino del pinar, con el perro sentado en primer plano con pajarita y una corona de flores"
              fill
              /* Por debajo de 1100 el marco está topado a 26rem, así que un
               92vw pelado pedía 942 px de origen en una tableta de 1024 para
               pintar 416. */
            sizes="(max-width: 1099px) min(92vw, 26rem), min(26vw, 28rem)"
              className={styles.retratoImagen}
            />
          </Link>
        </div>
      </div>

      {/* .stage es el SUJETO de la línea de tiempo (declara --reelPan) y quien
          aporta el recorrido vertical; .viewport es lo que se ancla. Tienen
          que ser dos elementos distintos: un elemento pegado con `sticky` no
          se mueve respecto a la pantalla, así que si la línea de tiempo se
          midiera contra él el progreso no avanzaría nunca. */}
      <div className={styles.stage}>
        <div className={styles.viewport}>
          <ol className={styles.track}>
            {frames.map((frame, i) => {
              // Portrait sources stay portrait; landscape ones alternate between
              // a 3:2 frame and a square crop so the strip keeps changing shape.
              const shape =
                frame.width > frame.height
                  ? i % 3 === 2
                    ? 'square'
                    : 'landscape'
                  : 'portrait';
              return (
                <li
                  key={frame.src}
                  className={`${styles.frame} ${styles[shape]}`}
                >
                  {/* data-cursor: el rótulo "VER" que ya sigue al puntero en
                      todo el sitio (components/motion/Cursor.tsx) se enciende
                      sobre el carrete sin una línea de código nueva. En táctil
                      ese componente no se monta y el pie de foto, que aquí
                      está siempre visible, hace su trabajo. */}
                  <Link
                    href={`/trabajos/${frame.project.slug}`}
                    className={styles.link}
                    data-cursor="ver"
                  >
                    <span className={styles.clip}>
                      <span className={styles.media}>
                        <Image
                          src={frame.src}
                          alt={frame.alt}
                          fill
                          sizes="(max-width: 899px) 78vw, 40vw"
                          className={styles.image}
                          style={focusOf(frame.src, frame.focus)}
                        />
                      </span>
                    </span>
                    <span className={styles.caption}>
                      <span className={styles.index}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.title}>
                        {frame.project.title}
                      </span>
                      <span className={styles.meta}>
                        {frame.project.location}, {frame.project.year}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {/* El final del carrete. Texto del estudio, literal: era la nota
                de la columna derecha que esta sección tenía cuando era
                vertical, y aquí cierra el recorrido en vez de flotar al
                margen de él. */}
            <li className={`${styles.frame} ${styles.endCard}`}>
              <p className={styles.note}>
                Entra en Trabajos y mira cómo vibra cada historia de principio a
                fin.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
