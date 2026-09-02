import { site } from '@/content/site';
import styles from './Footer.module.css';

// Intl.NumberFormat/toLocaleString depend on the runtime's ICU data, which
// isn't guaranteed present (Node built without full-icu silently returns
// the unformatted number instead of throwing) -- a fixed '.' thousands
// separator matches es-ES and needs no locale data. Migrated from the
// now-retired Confianza component (see git history) rather than shared via
// lib/, since Footer is the only remaining caller.
function formatCount(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function Footer() {
  const showPlaceholderNotice = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE !== 'false';

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <span className={styles.brand}>{site.brandName} — {site.legalCity}</span>
        <a className={styles.link} href={`mailto:${site.email}`}>{site.email}</a>
      </div>
      <div className={styles.row}>
        <a className={styles.link} href={site.instagramUrl} target="_blank" rel="noreferrer" data-cursor="abrir">Instagram</a>
        <a className={styles.link} href={site.facebookUrl} target="_blank" rel="noreferrer" data-cursor="abrir">Facebook</a>
      </div>
      {/* Migrated from the retired Confianza stat-bar (Task 11) -- kept as a
          small, clearly-secondary detail line per the brief, not a headline
          stat like Confianza's own --type-h2 treatment. */}
      <p className={styles.stats}>
        {formatCount(site.facebookLikes)} me gusta en Facebook · {formatCount(site.instagramFollowers)} seguidores en Instagram
      </p>
      {showPlaceholderNotice && (
        <p className={styles.notice}>Contenido de muestra — pendiente de sustitución por trabajo real de {site.brandName}.</p>
      )}
    </footer>
  );
}
