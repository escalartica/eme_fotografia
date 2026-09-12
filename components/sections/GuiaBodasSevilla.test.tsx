import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GuiaBodasSevilla } from './GuiaBodasSevilla';

/**
 * Esta sección existe para que haya algo que leer en una portada que, por lo
 * demás, es sólo fotografía -- y para que lo lea también un buscador. Ha sido
 * ya tres cosas: seis bloques abiertos a la vez (un muro), seis desplegables
 * (seis líneas y un clic por respuesta) y ahora una pila anclada, que es la
 * que no cobra peaje: está todo visible y aun así nunca hay más de una
 * respuesta delante.
 *
 * Lo que estas pruebas vigilan es lo que se rompería sin verse: que las seis
 * respuestas sigan estando en el documento, y que la sección siga siendo un
 * índice de seis con sus encabezados y su numeral.
 */
describe('Antes de escribirnos', () => {
  it('presenta las seis preguntas como índice, con su numeral y su pregunta', () => {
    render(<GuiaBodasSevilla />);
    const titulares = screen.getAllByRole('heading', { level: 3 });
    // Seis preguntas + el titular del bloque de cierre.
    expect(titulares.map((h) => h.textContent)).toEqual([
      'Una boda no se dirige. Se vive.',
      'Dos lenguajes, una misma mirada',
      'Nuestra base en Sevilla. Vuestra historia, donde queráis.',
      'Packs y presupuestos a medida, sin sorpresas',
      'Reservad con tiempo',
      'Entrega y plazos de visualización',
      '¿Tenéis fecha y lugar?',
    ]);
    expect(screen.getByText('Cuánto cuesta y por qué no usamos tarifas cerradas')).toBeInTheDocument();
  });

  /**
   * LA REGRESIÓN QUE ESTO IMPIDE: que las seiscientas cincuenta palabras por
   * las que existe esta sección se queden por el camino en el siguiente
   * rediseño. Ya han sobrevivido a dos.
   */
  it('sirve el texto de las seis respuestas', () => {
    render(<GuiaBodasSevilla />);
    for (const frase of [
      /sostener el ritmo, la luz/,
      /misma paleta de color/,
      /Cádiz, Huelva, Córdoba/,
      /no hay dos bodas idénticas/i,
      /vacantes de última hora/,
      /plataforma privada protegida con clave/,
    ]) {
      expect(screen.getByText(frase, { exact: false })).toBeInTheDocument();
    }
  });

  /**
   * NADIE TIENE QUE PULSAR NADA. La pila se lee bajando: si alguien vuelve a
   * meter un `<details>` aquí, vuelve el clic por respuesta que el estudio
   * pidió quitar.
   */
  it('no esconde ninguna respuesta detrás de un control', () => {
    const { container } = render(<GuiaBodasSevilla />);
    expect(container.querySelectorAll('details, summary, button')).toHaveLength(0);
    expect(container.querySelectorAll('ol > li')).toHaveLength(6);
  });

  it('mantiene los enlaces internos a las cinco rutas públicas', () => {
    render(<GuiaBodasSevilla />);
    const destinos = new Set(screen.getAllByRole('link').map((a) => a.getAttribute('href')));
    for (const ruta of ['/trabajos', '/servicios/fotografia-de-boda', '/servicios/video-de-boda', '/sobre-nosotros', '/contacto']) {
      expect(destinos.has(ruta)).toBe(true);
    }
  });
});
