import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Faq } from './Faq';
import { faqs } from '@/content/faq';

describe('Faq', () => {
  it('renders every question as a collapsed disclosure, answer hidden until expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<Faq />);

    for (const f of faqs) {
      expect(screen.getByText(f.question)).toBeInTheDocument();
    }

    const primero = container.querySelector('details')!;
    expect(primero).not.toHaveAttribute('open');

    // Se pulsa el <summary>, no el <h3> de dentro: quien abre un <details> es
    // el summary, y hacer explícito ese paso mantiene la prueba válida cuando
    // el contenido del summary cambia de forma.
    await user.click(screen.getByText(faqs[0].question).closest('summary')!);

    expect(primero).toHaveAttribute('open');
    expect(screen.getByText(faqs[0].answer)).toBeInTheDocument();
  });

  /**
   * CADA PREGUNTA ES UN ENCABEZADO DE VERDAD.
   *
   * Aquí hubo un rato una prueba que exigía lo contrario --cero <h3>-- y por
   * eso ésta lleva su historia escrita: las preguntas se ven como encabezados
   * (serif, cuerpo de titular, tinta plena), así que si no lo son se está
   * transmitiendo estructura sólo por el aspecto, que es WCAG 1.3.1. Y en una
   * lista de dieciséis, el rotor de encabezados de un lector de pantalla es
   * el atajo que evita tabular por trece controles para llegar a la catorce.
   */
  it('marca cada pregunta como encabezado, no sólo como texto grande', () => {
    render(<Faq />);
    const titulares = screen.getAllByRole('heading', { level: 3 });
    expect(titulares.map((h) => h.textContent)).toEqual(faqs.map((f) => f.question));
    expect(screen.getByRole('heading', { level: 2, name: 'Preguntas frecuentes' })).toBeInTheDocument();
  });

  /**
   * NO ES UN ACORDEÓN EXCLUYENTE, y es una decisión: se pueden leer el precio
   * y la antelación a la vez, que es el par que se consulta junto. Además, en
   * Safari --sin anclaje de scroll-- recoger la anterior daba un tirón seco
   * justo bajo el dedo.
   */
  it('deja abrir más de una pregunta a la vez', async () => {
    const user = userEvent.setup();
    const { container } = render(<Faq />);
    const todos = [...container.querySelectorAll('details')];
    expect(todos.some((d) => d.hasAttribute('name'))).toBe(false);

    await user.click(screen.getByText(faqs[0].question).closest('summary')!);
    await user.click(screen.getByText(faqs[1].question).closest('summary')!);
    expect(todos.filter((d) => d.hasAttribute('open'))).toHaveLength(2);
  });

  /**
   * EL BUSCADOR FILTRA CON `hidden`, NO DESMONTANDO.
   *
   * Es la regresión cara y la que no se ve: si el filtro quitara del árbol las
   * preguntas que no encajan, las dieciséis respuestas dejarían de estar en el
   * HTML que se sirve -- y con ellas el motivo por el que esta sección está
   * escrita. Se comprueba que siguen ahí incluso con el filtro puesto.
   */
  it('filtra sin sacar del documento las respuestas que no coinciden', async () => {
    const user = userEvent.setup();
    const { container } = render(<Faq />);
    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'antelacion');

    const todos = [...container.querySelectorAll('details')];
    expect(todos).toHaveLength(faqs.length);
    const visibles = todos.filter((d) => !d.hasAttribute('hidden'));
    expect(visibles.length).toBeGreaterThan(0);
    expect(visibles.length).toBeLessThan(faqs.length);
    // Y el texto de TODAS sigue servido, escondidas incluidas.
    for (const f of faqs) {
      expect(screen.getByText(f.answer)).toBeInTheDocument();
    }
  });

  /**
   * Sin tildes y sin mayúsculas: quien escribe deprisa en el móvil pone
   * «antelacion». Y mirando también la respuesta: «álbum» sale en tres
   * respuestas y en ningún título.
   */
  it('busca sin tildes y también dentro de la respuesta', async () => {
    const user = userEvent.setup();
    const { container } = render(<Faq />);
    const caja = screen.getByRole('searchbox', { name: /buscar/i });

    await user.type(caja, 'ANTELACION');
    const conTilde = [...container.querySelectorAll('details:not([hidden])')];
    expect(conTilde.length).toBeGreaterThan(0);

    await user.clear(caja);
    await user.type(caja, 'album');
    const porRespuesta = [...container.querySelectorAll('details:not([hidden])')];
    expect(porRespuesta.length).toBeGreaterThan(0);
    // La palabra no está en ningún título: si la búsqueda mirara sólo el
    // título, esto daría cero.
    expect(faqs.some((f) => f.question.toLowerCase().includes('álbum'))).toBe(false);
  });

  it('ofrece la salida cuando el filtro no deja nada', async () => {
    const user = userEvent.setup();
    const { container } = render(<Faq />);
    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'zzzzzz');
    expect(container.querySelectorAll('details:not([hidden])')).toHaveLength(0);
    expect(screen.getByText(/Escribidnos en el formulario/)).toBeInTheDocument();
  });
});
