import Image from 'next/image';
import styles from './MarqueeBand.module.css';

/**
 * Una frase de la marca recorriendo el ancho de la página sin fin.
 *
 * Es el gesto que el cliente señaló en sus referencias -- Daniele & Marilia
 * repiten "AUTHENTIC, EVOCATIVE IMAGES" en banda a lo largo de su galería --
 * y aquí separa el manifiesto del carrete de trabajos: el sitio pasa de tres
 * declaraciones quietas a diez fotografías en movimiento, y esta tira es la
 * bisagra entre los dos registros.
 *
 * COMPONENTE DE SERVIDOR, CERO JAVASCRIPT. Todo el bucle es una animación de
 * CSS sobre `transform` (ver MarqueeBand.module.css), que el navegador corre
 * en el compositor; no hay medición, ni clon en tiempo de ejecución, ni un
 * `requestAnimationFrame` sostenido durante toda la sesión.
 *
 * ACCESIBILIDAD. El carril entero está fuera del árbol de accesibilidad y la
 * frase se imprime UNA vez, visualmente oculta, para quien la escuche o la
 * indexe. Repetir doce veces la misma línea en un lector de pantalla no es
 * una decisión de diseño, es ruido.
 */
export function MarqueeBand({
  text,
  /**
   * Cuántas veces se repite la frase en cada una de las dos tiras.
   *
   * Seis, no dos ni tres: la tira tiene que ser MÁS ANCHA QUE LA PANTALLA
   * más grande en la que se vaya a ver, porque el bucle salta cuando el
   * carril ha recorrido exactamente una tira y, si la tira fuese más corta
   * que el viewport, en ese instante se vería el papel vacío por la derecha.
   * A tamaño de subtítulo, seis repeticiones de una frase de este sitio
   * pasan de 4.000 px, que cubre con holgura un monitor de 2.560.
   */
  repeat = 6,
}: {
  text: string;
  repeat?: number;
}) {
  // Las dos tiras del carril son idénticas por construcción, no por copia
  // manual: es lo que garantiza que el salto del 50% sea invisible.
  // El separador es la propia marca, no un punto tipográfico. Es lo que
  // convierte la tira en algo de esta casa en vez de en un recurso de
  // plantilla: el logotipo pasa una y otra vez entre frase y frase, que es
  // exactamente lo que hacen las referencias del cliente con el suyo.
  const run = (
    <div className={styles.run}>
      {Array.from({ length: repeat }, (_, i) => (
        <span key={i} className={styles.phrase}>
          {text}
          <Image
            src="/images/logo/eme-mark.png"
            alt=""
            width={967}
            height={317}
            sizes="120px"
            className={`${styles.mark} ${styles.markDark}`}
          />
          <Image
            src="/images/logo/eme-mark-light.png"
            alt=""
            width={967}
            height={317}
            sizes="120px"
            className={`${styles.mark} ${styles.markLight}`}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div className={styles.band}>
      <p className="sr-only">{text}</p>
      <div className={styles.track} aria-hidden="true">
        {run}
        {run}
      </div>
    </div>
  );
}
