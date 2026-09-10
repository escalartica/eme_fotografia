'use client';
import { useTheme } from '@/lib/hooks/useTheme';
import { SunIcon, MoonIcon } from './Icon';
import styles from './ThemeToggle.module.css';

/**
 * Light/dark switch, sitting next to Header's menu button. Light is the
 * hard default for every visitor -- clicking this is the ONLY way dark
 * mode is ever reached (see the DARK MODE comment in styles/tokens.css
 * for why it's deliberately not tied to the visitor's own OS
 * preference). useTheme's getServerSnapshot is 'light', so the very
 * first paint (server + pre-hydration client) always renders the sun
 * icon; useSyncExternalStore reconciles to the real value right after,
 * with no manual "mounted" gate needed.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <span className={styles.iconStack} data-dark={isDark ? 'true' : 'false'}>
        <SunIcon className={styles.sun} size={17} />
        <MoonIcon className={styles.moon} size={17} />
      </span>
    </button>
  );
}
