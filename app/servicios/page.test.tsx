import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Page from './page';
import { services } from '@/content/services';

describe('/servicios page', () => {
  it('renders each real service with its includes, audience, process, and CTA', () => {
    const { container } = render(<Page />);
    for (const service of services) {
      expect(screen.getByRole('heading', { name: service.name })).toBeInTheDocument();
      expect(screen.getByText(service.idealFor)).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: service.ctaLabel }).length).toBeGreaterThan(0);
      for (const item of service.includes) {
        expect(screen.getByText(item)).toBeInTheDocument();
      }
      for (const step of service.process) {
        // Some step titles/descriptions repeat verbatim across services
        // (e.g. every service's final step is titled "Entrega"), so assert
        // presence via getAllByText rather than the uniqueness-assuming
        // getByText.
        expect(screen.getAllByText(step.title).length).toBeGreaterThan(0);
        expect(screen.getAllByText(step.description).length).toBeGreaterThan(0);
      }
    }

    // The audit's single worst offender: no raw <ul>/<li> bullet-list
    // markup anywhere on the page for service content (includes/process
    // both used to render this way). Assert the absence explicitly rather
    // than just asserting the new structure exists.
    expect(container.querySelectorAll('ul').length).toBe(0);
    expect(container.querySelectorAll('li').length).toBe(0);
  });

  it('renders service inclusions as a numbered sequence (custom list semantics, two-digit numerals), not a bullet list', () => {
    render(<Page />);
    const firstService = services[0];
    const includesList = screen.getByRole('list', { name: new RegExp(`incluye.*${firstService.name}`, 'i') });
    const items = within(includesList).getAllByRole('listitem');
    expect(items).toHaveLength(firstService.includes.length);
    // First item is marked "01", not a bullet character.
    expect(within(items[0]).getByText('01')).toBeInTheDocument();
    expect(within(items[0]).getByText(firstService.includes[0])).toBeInTheDocument();
  });

  it('renders each service process as a numbered sequence using the step numbers from content/services.ts', () => {
    render(<Page />);
    const firstService = services[0];
    const processList = screen.getByRole('list', {
      name: new RegExp(`c[oó]mo trabajamos.*${firstService.name}`, 'i'),
    });
    const items = within(processList).getAllByRole('listitem');
    expect(items).toHaveLength(firstService.process.length);
    firstService.process.forEach((step, i) => {
      const expectedNumber = String(step.step).padStart(2, '0');
      expect(within(items[i]).getByText(expectedNumber)).toBeInTheDocument();
      expect(within(items[i]).getByText(step.title)).toBeInTheDocument();
    });
  });

  it('gives each service its own chapter number (01, 02, ...) alongside its heading', () => {
    render(<Page />);
    services.forEach((service, index) => {
      const expected = String(index + 1).padStart(2, '0');
      const heading = screen.getByRole('heading', { name: service.name });
      const section = heading.closest('section') as HTMLElement;
      expect(within(section).getAllByText(expected).length).toBeGreaterThan(0);
    });
  });

  it('gives every service its own anchorable section id, matching ServiciosPreview\'s #slug links', () => {
    render(<Page />);
    for (const service of services) {
      expect(document.getElementById(service.slug)).toBeInTheDocument();
    }
  });
});
