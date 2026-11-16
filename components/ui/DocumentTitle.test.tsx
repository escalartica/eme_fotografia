import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DocumentTitle } from './DocumentTitle';

describe('DocumentTitle', () => {
  it('pone el título y deja el anterior al desmontarse', () => {
    document.title = 'Antes';
    const { rerender, unmount } = render(<DocumentTitle title="Galería de Ana" />);
    expect(document.title).toBe('Galería de Ana');
    rerender(<DocumentTitle title="Otra" />);
    expect(document.title).toBe('Otra');
    unmount();
    expect(document.title).toBe('Antes');
  });
});
