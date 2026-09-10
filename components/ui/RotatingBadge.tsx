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
      <span className={styles.arrow} aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
