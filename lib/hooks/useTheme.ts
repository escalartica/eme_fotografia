'use client';
import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'eme-theme';
// Fired by setTheme so every mounted useTheme() consumer (in practice
// just ThemeToggle, but nothing stops a second one existing) re-reads
// the new value.
const CHANGE_EVENT = 'eme-theme-change';

/**
 * useSyncExternalStore, not useState+useEffect: matches this codebase's
 * own useReducedMotion (lib/hooks/useReducedMotion.ts) exactly, for the
 * same reason -- it lets the real client-side value (only knowable after
 * mount, by reading the `data-theme` attribute) differ from
 * getServerSnapshot's SSR-safe default without a `setState` inside a
 * `useEffect` (an anti-pattern this project's lint config already flags
 * elsewhere) or a manual "mounted" flag.
 *
 * Light is the true default -- not "light unless the visitor's OS
 * prefers dark". Dark mode exists ONLY behind an explicit `data-theme`
 * attribute, set by ThemeToggle (or restored from a past visit by the
 * bootstrap script in app/layout.tsx). This deliberately does NOT read
 * `matchMedia('(prefers-color-scheme: dark)')` anywhere: an earlier
 * version of this hook fell back to the system preference when no
 * explicit choice was stored, so a visitor whose OS happened to be set
 * to dark saw a dark site on first arrival -- the client was explicit
 * that the paper/light look must be what every visitor sees by default,
 * with dark as something they discover via the button.
 */
function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function getServerSnapshot(): Theme {
  return 'light';
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Best-effort persistence only; the toggle still works for this visit.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
