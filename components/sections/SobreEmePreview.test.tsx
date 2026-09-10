import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SobreEmePreview } from './SobreEmePreview';

describe('SobreEmePreview', () => {
  it('renders the new identity-statement heading', () => {
    render(<SobreEmePreview />);
    expect(
      screen.getByRole('heading', {
        name: 'El día de la boda ya nos conocéis.',
      })
    ).toBeInTheDocument();
  });

  it('renders the team image with correct alt text', () => {
    render(<SobreEmePreview />);
    expect(
      screen.getByAltText(
        'El equipo de EME fotografiando a una pareja junto a un coche clásico en una hacienda sevillana'
      )
    ).toBeInTheDocument();
  });

  it('links to the full about page', () => {
    render(<SobreEmePreview />);
    expect(screen.getByRole('link', { name: 'Conocer al equipo' })).toHaveAttribute(
      'href',
      '/sobre-nosotros'
    );
  });
});
