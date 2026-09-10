import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query.
 *
 * `useSyncExternalStore`, not `useState` inside an effect: a media query
 * is external state that already exists before React mounts, so reading it
 * in an effect and calling setState means the first paint is always the
 * wrong answer, followed by a second render to correct it. React's
 * `set-state-in-effect` lint rule flags exactly that pattern. This reads
 * the real value during render on the client and returns `false` on the
 * server, where there is no viewport to ask.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
