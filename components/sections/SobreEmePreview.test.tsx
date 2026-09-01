import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SobreEmePreview } from './SobreEmePreview';

describe('SobreEmePreview', () => {
  it('renders the new identity-statement heading', () => {
    render(<SobreEmePreview />);
    expect(
      screen.getByRole('heading', {
        name: 'No dirigimos la boda: la seguimos de cerca hasta que se cuenta sola.',
      })
    ).toBeInTheDocument();
  });

  it('renders the team image with correct alt text', () => {
    render(<SobreEmePreview />);
    expect(screen.getByAltText('Equipo de EME Fotografía Sevilla')).toBeInTheDocument();
  });

  it('links to the full about page', () => {
    render(<SobreEmePreview />);
    expect(screen.getByRole('link', { name: 'Conocer el estudio' })).toHaveAttribute(
      'href',
      '/sobre-nosotros'
    );
  });
});
