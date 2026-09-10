import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Cifras } from './Cifras';
import { site } from '@/content/site';

describe('Cifras', () => {
  it('renders the Bodas.net figures from content/site.ts', () => {
    render(<Cifras />);
    expect(screen.getByText(`+${site.bodasNetCoupleCount}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '5,0' })).toHaveAttribute('href', site.bodasNetUrl);
    expect(screen.getByRole('img', { name: /5 de 5 estrellas/ })).toBeInTheDocument();
    expect(screen.getByText(/puntuación máxima/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${site.bodasNetReviewCount} opiniones`))).toBeInTheDocument();
  });

  it('sets the five award years beside the awards numeral, so it is not a bare figure', () => {
    render(<Cifras />);
    const years = screen.getByLabelText('Años premiados: 2019, 2021, 2022, 2023, 2025');
    expect(years).toHaveTextContent('’19’21’22’23’25');
  });
});
