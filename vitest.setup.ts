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

// Default stub so any component that reaches a real Lenis instance (e.g.
// via SmoothScrollProvider in tests that don't mock 'lenis', such as the
// root layout test) doesn't crash in jsdom, which has no native
// ResizeObserver.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof window.ResizeObserver;
}

// Default stub so any component that reaches VideoPreview's real
// IntersectionObserver (e.g. via SelectedWork rendering a video-cover
// project) doesn't crash in jsdom, which has no native
// IntersectionObserver. Tests that care about the intersection callback
// itself (e.g. VideoPreview.test.tsx) override window.IntersectionObserver
// themselves — this is only the fallback for tests that don't.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof window.IntersectionObserver;
}
