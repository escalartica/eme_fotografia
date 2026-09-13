'use client';
import { site } from '@/content/site';
import { WhatsAppIcon } from './Icon';
import { useAvisoDeCookies, useCapaCompleta } from '@/lib/hooks/useCapaCompleta';
import styles from './WhatsAppButton.module.css';

const MESSAGE = 'Hola, me gustaría informarme sobre vuestra cobertura de boda.';

/**
 * Floating WhatsApp shortcut, bottom-right on every public page. Opens a
 * chat with the studio's number and a pre-filled greeting. Plain link:
 * no script from Meta is loaded, so it is neutral for the cookie banner.
 * The label unfolds on hover/focus on desktop; on phones only the round
 * icon shows so it never covers content.
 */
export function WhatsAppButton() {
  // Se retira mientras el menú del teléfono (o la secuencia de apertura) tapa
  // la pantalla: está a z-index 240 y flotaba por delante de la navegación.
  // Tapado por una capa a pantalla completa, o con el aviso de cookies
  // puesto: en un teléfono ese aviso mide unos 170 px y ocupa justo esta
  // franja de abajo, así que este botón le quedaba por detrás.
  const hayCapa = useCapaCompleta();
  const avisoPuesto = useAvisoDeCookies();
  const tapado = hayCapa || avisoPuesto;
  const href = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label={`Escribir por WhatsApp al ${site.phoneDisplay} (se abre en una pestaña nueva)`}
      // `hidden` y no `display: none` por CSS: además de no verse, deja de
      // ser enfocable, que es lo que importa con una capa modal abierta.
      hidden={tapado || undefined}
    >
      <WhatsAppIcon size={17} className={styles.icon} />
      <span className={styles.label}>WhatsApp</span>
    </a>
  );
}
