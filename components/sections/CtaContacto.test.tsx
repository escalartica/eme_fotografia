import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CtaContacto } from './CtaContacto';

describe('CtaContacto', () => {
  it('renders a CTA section with heading and contact link', () => {
    render(<CtaContacto />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('¿Celebras algo importante?');
    expect(screen.getByRole('link')).toHaveTextContent('Empezar un proyecto');
  });
});
