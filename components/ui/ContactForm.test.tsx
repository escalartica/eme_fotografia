import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

// Real GSAP tweens never progress in jsdom (no real rAF loop driving them),
// so a real gsap.fromTo({opacity:0}, ...) would leave the element stuck at
// opacity:0 for the lifetime of the test -- same reasoning as Hero.test.tsx's
// identical mock.
vi.mock('gsap', () => ({
  gsap: {
    fromTo: vi.fn(),
    context: vi.fn().mockImplementation((cb: () => void) => {
      cb();
      return { revert: vi.fn() };
    }),
  },
}));

/** The route answers 200 + delivered:true when a mail provider is configured. */
function mockApi(delivered: boolean, ok = true, error?: string) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => (ok ? { id: 'x', delivered } : { error }),
  });
}

beforeEach(() => mockApi(true));

/**
 * Walks the six steps as a real person would. `comoNosConociste` is the only
 * optional one now, so it is left blank on purpose: this is the base path.
 */
async function completeAllSteps(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { mensaje?: string } = {}
) {
  await user.type(screen.getByLabelText('Vuestros nombres'), 'Ana');
  await user.click(screen.getByRole('button', { name: /siguiente/i }));

  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
  await user.click(screen.getByRole('button', { name: /siguiente/i }));

  await user.type(screen.getByLabelText('Fecha'), '2027-06-12');
  await user.type(screen.getByLabelText('Lugar o pueblo'), 'Carmona');
  await user.click(screen.getByRole('button', { name: /siguiente/i }));

  await user.selectOptions(screen.getByLabelText('Cobertura'), 'foto-y-video');
  await user.click(screen.getByRole('button', { name: /siguiente/i }));

  await user.type(
    screen.getByLabelText('Contádnoslo con vuestras palabras'),
    overrides.mensaje ?? 'Nos casamos en junio'
  );
  await user.click(screen.getByRole('button', { name: /siguiente/i }));

  // Paso 6: el desplegable es opcional y se deja en blanco, pero la casilla
  // del consentimiento es obligatoria desde que el formulario la pide -- sin
  // marcarla, `checkValidity()` falla y el envío ni sale.
  // Sin `{ hidden: true }` a propósito: aquí ya estamos en el último paso, y
  // que la consulta encuentre la casilla es parte de lo que se comprueba --
  // el consentimiento tiene que estar A LA VISTA en el momento de enviar.
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: /consultar disponibilidad/i }));
}

describe('ContactForm (seis pasos)', () => {
  it('shows a progress indicator that advances, over six steps not eight', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '1');
    expect(progress).toHaveAttribute('aria-valuemax', '6');

    await user.type(screen.getByLabelText('Vuestros nombres'), 'Ana');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(progress).toHaveAttribute('aria-valuenow', '2');
  });

  it('only shows one step at a time', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText('Vuestros nombres')).toBeVisible();
    expect(screen.queryByLabelText('Correo electrónico')).not.toBeVisible();
  });

  it('blocks advancing when a required field on the current step is empty', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByLabelText('Vuestros nombres')).toBeInvalid();
    expect(screen.queryByLabelText('Correo electrónico')).not.toBeVisible();
  });

  it('makes fecha and lugar required — they are the two facts the studio needs to answer at all', async () => {
    // The whole site promises "decidnos la fecha y el lugar y os decimos si
    // estamos libres". Both used to be optional, so a couple could send a
    // message the studio could not act on.
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Vuestros nombres'), 'Ana');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByLabelText('Fecha')).toBeInvalid();
    expect(screen.queryByLabelText('Cobertura')).not.toBeVisible();
  });

  it('leaves "cómo nos habéis encontrado" optional, and last', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    // Submitted without ever touching it.
    const body = JSON.parse((global.fetch as unknown as { mock: { calls: [string, { body: string }][] } }).mock.calls[0][1].body);
    expect(body.comoNosConociste).toBe('');
  });

  it('never offers a price field — the placeholder there was the only rate on the site', () => {
    render(<ContactForm />);
    expect(screen.queryByLabelText(/presupuesto/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/invitados/i)).not.toBeInTheDocument();
  });

  it('advances on Enter, but leaves newlines alone inside the message', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Vuestros nombres'), 'Ana{Enter}');
    expect(screen.getByLabelText('Correo electrónico')).toBeVisible();

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.type(screen.getByLabelText('Fecha'), '2027-06-12');
    await user.type(screen.getByLabelText('Lugar o pueblo'), 'Carmona');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.selectOptions(screen.getByLabelText('Cobertura'), 'foto');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const mensaje = screen.getByLabelText('Contádnoslo con vuestras palabras');
    await user.type(mensaje, 'Primera línea{Enter}Segunda línea');
    expect(mensaje).toHaveValue('Primera línea\nSegunda línea');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits every step\'s value to /api/contacto', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    expect(global.fetch).toHaveBeenCalledWith('/api/contacto', expect.objectContaining({ method: 'POST' }));
    const body = JSON.parse((global.fetch as unknown as { mock: { calls: [string, { body: string }][] } }).mock.calls[0][1].body);
    expect(body).toMatchObject({
      nombre: 'Ana',
      email: 'ana@example.com',
      fecha: '2027-06-12',
      lugar: 'Carmona',
      tipoEvento: 'foto-y-video',
      mensaje: 'Nos casamos en junio',
    });
  });

  it('says the message was sent ONLY when the route reports delivered: true', async () => {
    mockApi(true);
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    expect(await screen.findByText(/mensaje enviado/i)).toBeInTheDocument();
  });

  it('does NOT claim delivery when the route answers 200 with delivered: false', async () => {
    // The regression this exists for: the route returns 200 + delivered:false
    // when no RESEND_API_KEY is set. Reading only res.ok, the form told the
    // couple "tu mensaje ya está en nuestro correo" while nobody was notified.
    // Reproduced live in the browser before the fix: {status:200, ok:true,
    // delivered:false}.
    mockApi(false);
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    expect(await screen.findByText(/no hemos podido hacérselo llegar al equipo/i)).toBeInTheDocument();
    expect(screen.queryByText(/mensaje enviado/i)).not.toBeInTheDocument();
    // And it hands them a way through that does not depend on the broken one.
    expect(screen.getByRole('link', { name: /info@/i })).toBeInTheDocument();
  });

  it('surfaces the server error message on a failed request', async () => {
    mockApi(false, false, 'No hemos podido enviar vuestro mensaje ahora mismo.');
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(/no hemos podido enviar/i);
  });
});


/**
 * EL CONSENTIMIENTO RGPD, del lado del formulario.
 *
 * Lo que hay que sostener es lo que exige la norma: que el consentimiento sea
 * una acción afirmativa de la pareja (art. 4.11), que esté a la vista en el
 * momento de enviar, y que puedan leer a qué dicen que sí antes de decirlo.
 */
describe('ContactForm: consentimiento', () => {
  /**
   * `{ hidden: true }` en las dos consultas de aquí abajo, y no es un parche:
   * los seis pasos del formulario están SIEMPRE montados y sólo se ocultan
   * con el atributo `hidden` (ver el comentario de `handleSubmit` en el
   * componente). Sin la bandera, `getByRole` --que por defecto se salta todo
   * lo que no está en el árbol de accesibilidad-- no encuentra nada mientras
   * el formulario está en el primer paso.
   * Lo que estas dos pruebas fijan es el MARCADO: que la casilla no venga
   * marcada y que el enlace apunte donde debe. Que estén a la vista en el
   * momento de enviar lo cubre el resto del bloque, que sí recorre los pasos.
   */
  it('trae la casilla sin marcar: una ya puesta no es el consentimiento de nadie', () => {
    render(<ContactForm />);
    expect(screen.getByRole('checkbox', { hidden: true })).not.toBeChecked();
  });

  it('enlaza a la política de privacidad desde la propia casilla', () => {
    render(<ContactForm />);
    const enlace = screen.getByRole('link', { hidden: true, name: /política de privacidad/i });
    expect(enlace).toHaveAttribute('href', '/privacidad');
    // En otra pestaña: abrirla en la misma perdería el formulario a medio
    // rellenar, que es la forma más segura de que nadie la lea.
    expect(enlace).toHaveAttribute('target', '_blank');
  });

  it('no envía nada si la casilla no está marcada', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Vuestros nombres'), 'Ana');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.type(screen.getByLabelText('Fecha'), '2027-06-12');
    await user.type(screen.getByLabelText('Lugar o pueblo'), 'Carmona');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.selectOptions(screen.getByLabelText('Cobertura'), 'foto-y-video');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.type(screen.getByLabelText('Contádnoslo con vuestras palabras'), 'Hola');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('button', { name: /consultar disponibilidad/i }));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('manda la marca de consentimiento al servidor', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse((init as RequestInit).body as string).consentimiento).toBe('si');
  });

  /* El campo aceptaba una boda en 2019. */
  it('no deja elegir una fecha de boda que ya ha pasado', async () => {
    render(<ContactForm />);
    const hoy = new Date().toLocaleDateString('en-CA');
    expect(screen.getByLabelText('Fecha')).toHaveAttribute('min', hoy);
  });
});
