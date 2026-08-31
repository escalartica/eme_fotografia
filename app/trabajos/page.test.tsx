import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from './page';

// TrabajosFilter (rendered by Page) calls next/navigation's useRouter for
// withPageTransition click handling, which requires an App Router context
// that jsdom/RTL render() doesn't provide. Stub it.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

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
