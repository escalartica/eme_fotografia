export function withPageTransition(navigate: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(navigate);
  } else {
    navigate();
  }
}
