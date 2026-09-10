import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Page from './page';
import { services } from '@/content/services';

describe('/servicios index', () => {
  it('is a single-h1 index that names both services and nothing else', () => {
    render(<Page />);
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Fotografía y vídeo de bodas en Sevilla');
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(
      services.map((s) => s.name),
    );
  });

  it('links every service to its own page, never to an anchor', () => {
    render(<Page />);
    for (const service of services) {
      const link = screen.getByRole('link', { name: new RegExp(service.name, 'i') });
      expect(link).toHaveAttribute('href', service.route);
      // El ancla (/servicios#boda) es justo lo que esta división retira: si
      // vuelve, es que alguien ha rehecho la página única.
      expect(link.getAttribute('href')).not.toContain('#');
    }
  });

  it('leaves the service detail to the child pages', () => {
    // El índice reparte; no repite. Si aquí vuelven a aparecer los `includes`
    // de un servicio, las dos URLs compiten entre sí por la misma búsqueda,
    // que es el problema que la división resuelve.
    render(<Page />);
    for (const service of services) {
      for (const item of service.includes) {
        expect(screen.queryByText(item)).toBeNull();
      }
    }
  });

  it('numbers the two services in the order of content/services.ts', () => {
    render(<Page />);
    services.forEach((service, index) => {
      const heading = screen.getByRole('heading', { name: service.name, level: 2 });
      const card = heading.closest('li') as HTMLElement;
      expect(within(card).getByText(String(index + 1).padStart(2, '0'))).toBeInTheDocument();
      expect(within(card).getByText(service.tagline)).toBeInTheDocument();
    });
  });
});
