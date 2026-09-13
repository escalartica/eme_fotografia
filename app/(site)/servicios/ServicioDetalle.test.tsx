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

  it('keeps the optional extras out of "Incluye", so a pack without them promises nothing', () => {
    render(<ServicioDetalle service={service} />);
    const incluye = screen.getByRole('list', { name: new RegExp(`incluye.*${service.name}`, 'i') });
    const extras = service.alsoAvailable ?? [];
    // El álbum, la preboda y el tráiler dependen del pack. Si vuelven a la
    // lista de «Incluye», la pareja que contrate sin ellos llega a la entrega
    // esperándolos, que es exactamente la queja que originó esta separación.
    for (const extra of extras) {
      expect(within(incluye).queryByText(extra)).not.toBeInTheDocument();
      expect(screen.getByText(extra)).toBeInTheDocument();
    }
    if (extras.length > 0) {
      const lista = screen.getByRole('list', { name: new RegExp(`seg[uú]n el pack.*${service.name}`, 'i') });
      expect(within(lista).getAllByRole('listitem')).toHaveLength(extras.length);
    }
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

  // EL FALLO DE CONTENIDO QUE ESTO IMPIDE QUE VUELVA. «Incluye» y «Cómo
  // trabajamos» existían SOLO como `aria-label` de sus listas: quien ve la
  // página se encontraba dos listas numeradas idénticas, una detrás de otra,
  // sin nada que dijera que la primera es lo que se lleva y la segunda cómo se
  // trabaja. El lector de pantalla estaba mejor informado que el visitante.
  it('gives both lists a heading somebody can actually see', () => {
    render(<ServicioDetalle service={service} />);
    const incluye = screen.getByRole('heading', { level: 2, name: /lo que incluye/i });
    const proceso = screen.getByRole('heading', { level: 2, name: /cómo trabajamos/i });
    expect(incluye).toBeInTheDocument();
    expect(proceso).toBeInTheDocument();
    // Y cada rótulo nombra a su sección, no flota suelto encima.
    const seccionIncluye = incluye.closest('section')!;
    expect(seccionIncluye).toHaveAttribute('aria-labelledby', incluye.id);
    expect(
      within(seccionIncluye).getByRole('list', { name: new RegExp(`incluye.*${service.name}`, 'i') })
    ).toBeInTheDocument();
  });

  /**
   * LO QUE ESTO IMPIDE QUE VUELVA: todas las fotografías amontonadas al final.
   *
   * El estudio describió estas páginas como «muy planas». La causa medible
   * era ésta: entre la apertura y el cierre no había una sola imagen -- las
   * seis vivían en una tira horizontal al final, con la barra de scroll
   * escondida, así que en un escritorio se veían dos y media y las otras
   * existían sólo para quien adivinara que aquello se arrastraba.
   * Ahora una sube a separar los dos capítulos de texto y el resto van en un
   * mural que se ve entero. Se comprueban las dos mitades.
   */
  it('parte los dos capítulos de texto con una fotografía en medio', () => {
    const galeria = service.gallery ?? [];
    if (galeria.length === 0) return;
    const { container } = render(<ServicioDetalle service={service} />);
    const figura = container.querySelector('figure');
    expect(figura).not.toBeNull();
    // Y está DELANTE del capítulo del proceso, no detrás: si vuelve a caer al
    // final, esta comprobación se rompe aunque la imagen siga en la página.
    const proceso = screen.getByRole('heading', { level: 2, name: /cómo trabajamos/i });
    expect(figura!.compareDocumentPosition(proceso) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('enseña el resto de fotografías de una vez, sin tira que haya que arrastrar', () => {
    const galeria = service.gallery ?? [];
    if (galeria.length < 2) return;
    const { container } = render(<ServicioDetalle service={service} />);
    // Una por cada pieza de la galería, más la banda del medio cuando ésta
    // es un clip: con `interludioVideo` no se levanta ninguna fotografía de
    // la galería --el mural las lleva todas-- y la banda es una figura más.
    const figuras = container.querySelectorAll('figure');
    expect(figuras).toHaveLength(galeria.length + (service.interludioVideo ? 1 : 0));
    // Y ninguna de ellas vive dentro de un contenedor enfocable, que era el
    // apaño que necesitaba la tira para que el teclado pudiera recorrerla.
    expect(container.querySelectorAll('[role="group"][tabindex]')).toHaveLength(0);
  });

  it('links back up to the services index', () => {
    // Sin migas visibles en el sitio, este enlace es la única vuelta al padre
    // desde una página hija.
    render(<ServicioDetalle service={service} />);
    // «Volver a Servicios», no «Servicios»: el enlace dice ahora a dónde
    // lleva y en qué sentido, que es lo que oye quien no ve la flecha.
    expect(screen.getByRole('link', { name: 'Volver a Servicios' })).toHaveAttribute('href', '/servicios');
  });
});
