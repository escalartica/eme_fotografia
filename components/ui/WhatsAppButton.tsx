import { site } from '@/content/site';
import { WhatsAppIcon } from './Icon';
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
  const href = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label={`Escribir por WhatsApp al ${site.phoneDisplay} (se abre en una pestaña nueva)`}
     
    >
      <WhatsAppIcon size={17} className={styles.icon} />
      <span className={styles.label}>WhatsApp</span>
    </a>
  );
}
