import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ServicioDetalle } from './ServicioDetalle';
import { services } from '@/content/services';

describe.each(services.map((s) => [s.slug, s] as const))('ServicioDetalle (%s)', (_slug, service) => {
  it('carries the page heading, and only one', () => {
    render(<ServicioDetalle service={service} />);
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(service.heading);
  });

  it('renders what it includes, who it is for, the process and the CTA', () => {
    render(<ServicioDetalle service={service} />);
    expect(screen.getByText(service.idealFor)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: service.ctaLabel }).length).toBeGreaterThan(0);
    for (const item of service.includes) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    for (const step of service.process) {
      expect(screen.getAllByText(step.title).length).toBeGreaterThan(0);
      expect(screen.getAllByText(step.description).length).toBeGreaterThan(0);
    }
  });

  it('never renders service content as a bullet list', () => {
    // El peor hallazgo de la auditoría original de esta página: `includes` y
    // `process` salían como <ul><li>• …</li></ul>. La numeración es el marcador.
    const { container } = render(<ServicioDetalle service={service} />);
    expect(container.querySelectorAll('ul')).toHaveLength(0);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('numbers the inclusions 01, 02, … with real list semantics', () => {
    render(<ServicioDetalle service={service} />);
    const list = screen.getByRole('list', { name: new RegExp(`incluye.*${service.name}`, 'i') });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(service.includes.length);
    expect(within(items[0]).getByText('01')).toBeInTheDocument();
    expect(within(items[0]).getByText(service.includes[0])).toBeInTheDocument();
  });

  it('numbers the process with the step numbers from content/services.ts', () => {
    render(<ServicioDetalle service={service} />);
    const list = screen.getByRole('list', {
      name: new RegExp(`c[oó]mo trabajamos.*${service.name}`, 'i'),
    });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(service.process.length);
    service.process.forEach((step, i) => {
      expect(within(items[i]).getByText(String(step.step).padStart(2, '0'))).toBeInTheDocument();
      expect(within(items[i]).getByText(step.title)).toBeInTheDocument();
    });
  });

  it('links back up to the services index', () => {
    // Sin migas visibles en el sitio, este enlace es la única vuelta al padre
    // desde una página hija.
    render(<ServicioDetalle service={service} />);
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('href', '/servicios');
  });
});
