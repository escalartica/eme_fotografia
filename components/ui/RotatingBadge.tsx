import Link from 'next/link';
import styles from './RotatingBadge.module.css';

/**
 * Circular text spinning slowly around an arrow: the one deliberately
 * playful 2D object on the site. Pure SVG + CSS, no script. Under
 * prefers-reduced-motion it simply stands still.
 */
export function RotatingBadge({ href = '/contacto', text = 'Fotografía · Vídeo · Bodas · Sevilla · ', className = '' }: { href?: string; text?: string; className?: string }) {
  return (
    <Link href={href} className={`${styles.badge} ${className}`} aria-label="Ir a contacto">
      <svg viewBox="0 0 120 120" className={styles.ring} aria-hidden="true">
        <defs>
          <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className={styles.text}>
          <textPath href="#badge-circle" startOffset="0">
            {text}
            {text}
          </textPath>
        </text>
      </svg>
      {/* LA FLECHA ES UN DIBUJO, NO UN CARÁCTER.
          Aquí había un ↗ (U+2197) puesto con la tipografía de titulares. En
          iOS ese punto de código no está en la fuente de texto y el sistema
          lo resuelve con la de emoji: en un iPhone salía un cuadradito azul
          brillante en mitad de la insignia. En el Mac se veía perfecto, que
          es lo que hace que este fallo sobreviva a las revisiones.
          Dibujada, es la misma flecha en todas partes y hereda el color y
          el grosor de la insignia. */}
      <svg
        className={styles.arrow}
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
      </svg>
    </Link>
  );
}
