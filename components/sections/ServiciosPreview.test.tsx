import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiciosPreview } from './ServiciosPreview';
import { services } from '@/content/services';

describe('ServiciosPreview', () => {
  it('renders a zero-padded number (01, 02, ...) and a link for every service', () => {
    render(<ServiciosPreview />);
    services.forEach((service, index) => {
      const expectedNumber = String(index + 1).padStart(2, '0');
      expect(screen.getByText(expectedNumber)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: new RegExp(service.name) })).toHaveAttribute(
        'href',
        service.route
      );
    });
  });

  it('shows the first service with a preview image as active by default', () => {
    render(<ServiciosPreview />);
    // boda is the first service in content/services.ts and has a previewImage.
    expect(screen.getByTestId('preview-image-boda')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('preview-image-video')).toHaveAttribute('data-active', 'false');
  });

  it('reveals the hovered service image on mouse hover', () => {
    render(<ServiciosPreview />);
    const videoLink = screen.getByRole('link', { name: /Vídeo/i });
    fireEvent.mouseEnter(videoLink);
    expect(screen.getByTestId('preview-image-video')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('preview-image-boda')).toHaveAttribute('data-active', 'false');
  });

  it('reveals the same image via keyboard focus, not just mouse hover', () => {
    render(<ServiciosPreview />);
    const bodaLink = screen.getByRole('link', { name: /Fotografía de Boda/i });
    const videoLink = screen.getByRole('link', { name: /Vídeo/i });
    // Simulate Tab landing on the video link without any mouse interaction.
    fireEvent.focus(videoLink);
    expect(screen.getByTestId('preview-image-video')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('preview-image-boda')).toHaveAttribute('data-active', 'false');

    fireEvent.focus(bodaLink);
    expect(screen.getByTestId('preview-image-boda')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('preview-image-video')).toHaveAttribute('data-active', 'false');
  });
});
