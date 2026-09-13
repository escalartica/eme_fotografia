'use client';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { HeartIcon, CommentIcon, CheckIcon } from '@/components/ui/Icon';
import styles from './GalleryClient.module.css';

const CLAVE = 'eme-galeria-bienvenida';

/**
 * LA BIENVENIDA. Lo primero que ve una pareja al entrar en su galería.
 *
 * Antes esto era una sola frase apretada entre la cabecera y la primera fila
 * de fotos: «Marcad con el corazón las fotos que queráis y, si hace falta,
 * dejad una nota». Decía QUÉ pulsar y no decía nada de POR QUÉ, que es lo
 * único que hace que alguien se moleste en escribir una nota en la foto 140.
 *
 * El texto está escrito para una pareja que abre esto por la noche, en el
 * sofá, unas semanas después de su boda. No es un manual de instrucciones: es
 * la explicación de para qué sirve lo que van a hacer, que es material de
 * trabajo para el estudio.
 *
 * SE PUEDE CERRAR Y NO VUELVE. Quien entra la segunda vez ya sabe lo que hay
 * que hacer, y encontrarse el mismo cartel cada vez es el camino más corto
 * para dejar de leer los carteles. El recordatorio corto de la barra de abajo
 * sigue estando siempre.
 */
export function GalleryWelcome({ nombre }: { nombre: string }) {
  const cerradaAlEntrar = useSyncExternalStore(
    useCallback((avisar: () => void) => {
      window.addEventListener('storage', avisar);
      return () => window.removeEventListener('storage', avisar);
    }, []),
    useCallback(() => {
      try {
        return localStorage.getItem(CLAVE) === 'cerrada';
      } catch {
        return false;
      }
    }, []),
    // En el servidor se pinta abierta: es el estado que ve quien entra por
    // primera vez, y quien ya la cerró la ve desaparecer al hidratar en vez
    // de verla aparecer de la nada.
    () => false
  );
  const [cerradaAhora, setCerradaAhora] = useState(false);

  if (cerradaAlEntrar || cerradaAhora) return null;

  function cerrar() {
    setCerradaAhora(true);
    try {
      localStorage.setItem(CLAVE, 'cerrada');
    } catch {
      /* sin almacenamiento: se cierra esta vez y ya está */
    }
  }

  // El nombre puede venir como «Ana y Luis»; usamos solo lo que haya escrito
  // el estudio, sin inventar saludos con el apellido.
  return (
    <section className={styles.bienvenida} aria-labelledby="bienvenida-titulo">
      <p className={styles.bienvenidaEyebrow}>Vuestro espacio privado</p>
      <h2 id="bienvenida-titulo" className={styles.bienvenidaTitulo}>
        Hola, {nombre}
      </h2>
      <p className={styles.bienvenidaTexto}>
        Estas son las fotos de vuestra boda. Este enlace es solo vuestro: nadie más puede entrar aquí, y podéis
        volver las veces que queráis.
      </p>
      <p className={styles.bienvenidaTexto}>
        Ahora nos toca elegir juntos. Lo que marquéis aquí es lo que usamos para preparar el álbum y para decidir
        a qué fotos les dedicamos más tiempo en el revelado, así que cuanto más nos contéis, más se va a parecer
        el resultado a lo que tenéis en la cabeza.
      </p>

      <ol className={styles.pasos}>
        <li className={styles.paso}>
          <span className={styles.pasoIcono} aria-hidden="true">
            <HeartIcon size={18} />
          </span>
          <span>
            <strong>Dadle al corazón</strong> a las que os gusten. Sin límite y sin pensarlo mucho: marcad las que
            os paren al verlas.
          </span>
        </li>
        <li className={styles.paso}>
          <span className={styles.pasoIcono} aria-hidden="true">
            <CommentIcon size={18} />
          </span>
          <span>
            <strong>Contadnos lo que veáis</strong>. En cada foto podéis dejar una nota: quién sale y no puede
            faltar, si la queréis en blanco y negro, si preferís otro encuadre. Eso es lo que no podemos adivinar.
          </span>
        </li>
        <li className={styles.paso}>
          <span className={styles.pasoIcono} aria-hidden="true">
            <CheckIcon size={18} />
          </span>
          <span>
            <strong>Cuando acabéis, enviádnosla</strong>. No hay prisa: se va guardando sola mientras marcáis, así
            que podéis dejarlo a medias y seguir otro día.
          </span>
        </li>
      </ol>

      <button type="button" className={styles.bienvenidaCerrar} onClick={cerrar}>
        Entendido, vamos a verlas
      </button>
    </section>
  );
}
