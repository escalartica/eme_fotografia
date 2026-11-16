import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhatsAppButton } from './WhatsAppButton';
import { site } from '@/content/site';

describe('WhatsAppButton', () => {
  it('abre WhatsApp con el número del estudio en otra pestaña, sin filtrar el origen', () => {
    render(<WhatsAppButton />);
    const enlace = screen.getByRole('link', { name: /WhatsApp/ });
    expect(enlace.getAttribute('href')).toMatch(new RegExp(`^https://wa\\.me/${site.whatsappNumber}\\?text=`));
    expect(enlace).toHaveAttribute('target', '_blank');
    expect(enlace).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
