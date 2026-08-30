import '@testing-library/jest-dom/vitest';

// Default stub so any component reaching useReducedMotion (directly or via
// ScrollReveal/VideoPreview/SmoothScrollProvider) doesn't crash in jsdom,
// which has no native matchMedia. Individual tests that care about a
// specific matches value override window.matchMedia themselves — this is
// only the fallback for tests that don't.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
