import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Manifiesto } from './Manifiesto';

describe('Manifiesto', () => {
  it('renders the studio\'s philosophy statement as a heading + copy', () => {
    render(<Manifiesto />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/editorial/i)).toBeInTheDocument();
  });
});
