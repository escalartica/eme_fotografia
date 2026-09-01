import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SelectedWork } from './SelectedWork';

describe('SelectedWork', () => {
  it('renders a card for each seed project with a link to its detail page', () => {
    render(<SelectedWork />);
    expect(screen.getByRole('link', { name: /Raquel y Fran/i })).toHaveAttribute('href', '/trabajos/raquel-y-fran');
  });
});
