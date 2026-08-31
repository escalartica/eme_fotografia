import { site } from '@/content/site';
import styles from './Footer.module.css';

export function Footer() {
  const showPlaceholderNotice = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE === 'true';

  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <span>{site.brandName} — {site.legalCity}</span>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </div>
      <div className={styles.row}>
        <a href={site.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
        <a href={site.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
      </div>
      {showPlaceholderNotice && (
        <p className={styles.notice}>Contenido de muestra — pendiente de sustitución por trabajo real de {site.brandName}.</p>
      )}
    </footer>
  );
}
