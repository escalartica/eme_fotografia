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

// Default stub so any component that waits on document.fonts.ready (e.g.
// Hero, which defers its GSAP intro timeline until the display font has
// loaded so it doesn't measure/split text against the fallback font's
// metrics) doesn't crash in jsdom, which has no native FontFaceSet.
if (typeof document !== 'undefined' && !document.fonts) {
  Object.defineProperty(document, 'fonts', {
    // FontFaceSet is an EventTarget, and libraries treat it as one: GSAP's
    // SplitText subscribes to 'loadingdone' and unsubscribes in kill().
    // A stub with only `ready` therefore blows up on teardown rather than
    // on use, which is why it surfaced as a confusing failure in whichever
    // test happened to unmount a real split.
    value: {
      ready: Promise.resolve(),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    },
    configurable: true,
  });
}

// jsdom has no layout engine, so Element.getClientRects() always returns an
// empty list. The `tabbable` library (used internally by `focus-trap`, which
// Lightbox uses for its modal focus trap) treats "zero client rects" as
// "hidden" and therefore excludes every element from its tabbable-nodes
// search — without this stub, focus-trap would see zero tabbable nodes for
// any real content in tests and always fall back to its `fallbackFocus`
// target, even when real focusable descendants (e.g. buttons) are present.
if (typeof window !== 'undefined' && typeof Element !== 'undefined') {
  Element.prototype.getClientRects = function getClientRects() {
    // Preserve jsdom's one real visibility signal: a `display: none` element
    // still reports zero rects (i.e. "hidden"), it's only elements that
    // jsdom simply can't lay out that get this fallback rect.
    if (getComputedStyle(this).display === 'none') {
      return [] as unknown as DOMRectList;
    }
    const rect: DOMRect = {
      width: 1,
      height: 1,
      top: 0,
      left: 0,
      right: 1,
      bottom: 1,
      x: 0,
      y: 0,
      toJSON() {
        return this;
      },
    };
    return [rect] as unknown as DOMRectList;
  };
}

// No mail provider during tests, ever. app/api/contacto/route.ts branches on
// isMailConfigured(); on a machine where the real SMTP credentials happen to be
// exported, the contact-route suite would otherwise send genuine email to the
// studio inbox on every run. Pinning it empty makes that impossible and makes
// the `delivered: false` branch deterministic.
process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';
