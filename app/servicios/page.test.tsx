import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';
import { services } from '@/content/services';

describe('/servicios page', () => {
  it('renders each real service with its includes, audience, process, and CTA', () => {
    render(<Page />);
    for (const service of services) {
      expect(screen.getByRole('heading', { name: service.name })).toBeInTheDocument();
      expect(screen.getByText(service.idealFor)).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: service.ctaLabel }).length).toBeGreaterThan(0);
    }
  });
});
