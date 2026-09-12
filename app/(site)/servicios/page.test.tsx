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

  it('lists the services in the order of content/services.ts, each with its tagline', () => {
    render(<Page />);
    const filas = screen.getAllByRole('listitem');
    expect(filas).toHaveLength(services.length);
    services.forEach((service, index) => {
      const fila = filas[index];
      expect(within(fila).getByRole('heading', { level: 2 })).toHaveTextContent(service.name);
      expect(within(fila).getByText(service.tagline)).toBeInTheDocument();
    });
  });

  // SIN NUMERAL DECORATIVO. Aquí había un «01» / «02» pintado a --type-h1,
  // un escalón MÁS GRANDE que el nombre del servicio que tenía al lado: el
  // adorno le ganaba en tamaño al contenido. Y no numeraba nada -- dos
  // servicios no son una secuencia que haya que leer en orden, son una
  // elección. Si vuelve a aparecer, es que alguien ha reintroducido el
  // patrón.
  it('does not decorate the services with numbering that encodes nothing', () => {
    render(<Page />);
    for (const n of ['01', '02', '03']) {
      expect(screen.queryByText(n)).toBeNull();
    }
  });
});
