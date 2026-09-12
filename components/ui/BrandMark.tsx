import Image from 'next/image';
import { site } from '@/content/site';
import styles from './BrandMark.module.css';

/**
 * El logotipo de EME, con su versión para fondo oscuro.
 *
 * Existe porque el mismo logotipo estaba escrito a mano en seis sitios y
 * sólo uno --la cabecera pública-- traía la versión clara. Los otros cinco
 * son las pantallas privadas (acceso a la galería, acceso al panel y las
 * tres vistas de administración), que pintan el fondo con `--color-paper`:
 * en modo noche ese token es casi negro y el trazo de tinta desaparecía
 * encima. Con el conmutador de tema montado en esas mismas pantallas, la
 * pareja podía hacerlo desaparecer de un clic.
 *
 * `alto` es la altura pintada, en rem. El ancho lo pone la proporción del
 * fichero: se pasan los dos al componente de imagen --que los necesita para
 * reservar el hueco y no dar un salto al cargar-- y la hoja los sustituye
 * por `height: var(--marca-alto); width: auto`.
 *
 * La segunda copia va `aria-hidden` y con `alt` vacío: son la misma marca
 * dicha dos veces, y un lector de pantalla sólo tiene que oírla una.
 *
 * CUÁL SE PINTA LO DECIDE `data-marca`, un atributo y no una clase de
 * módulo, y eso es deliberado: la cabecera necesita forzar la versión clara
 * mientras el menú está abierto --su panel es oscuro en los dos temas-- y
 * una clase generada por CSS Modules no es alcanzable desde otra hoja. Con
 * el atributo, cualquier contenedor puede mandar sobre la marca sin importar
 * en qué fichero viva su regla.
 */
export function BrandMark({
  alto = 2.25,
  className,
  priority = false,
}: {
  alto?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={className ? `${styles.marca} ${className}` : styles.marca}
      style={{ ['--marca-alto']: `${alto}rem` } as React.CSSProperties}
    >
      <Image
        src="/images/logo/eme-logo.png"
        alt={site.brandName}
        width={168}
        height={79}
        priority={priority}
        data-marca="tinta"
        className={styles.logo}
      />
      <Image
        src="/images/logo/eme-logo-light.png"
        alt=""
        aria-hidden="true"
        width={168}
        height={79}
        priority={priority}
        data-marca="claro"
        className={styles.logo}
      />
    </span>
  );
}
