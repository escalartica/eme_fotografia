import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from './page';

describe('/trabajos page', () => {
  it('lists all 4 seed projects by default', () => {
    render(<Page />);
    expect(screen.getAllByRole('link', { name: /ver proyecto/i })).toHaveLength(4);
  });

  it('filters by category on tab click', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('tab', { name: /^vídeo$/i }));
    expect(screen.getAllByRole('link', { name: /ver proyecto/i })).toHaveLength(1);
  });
});
