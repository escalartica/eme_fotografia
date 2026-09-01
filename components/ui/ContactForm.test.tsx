import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

// Real GSAP tweens never progress in jsdom (no real rAF loop driving them),
// so a real gsap.fromTo({opacity:0}, ...) would leave the element stuck at
// opacity:0 for the lifetime of the test -- same reasoning as Hero.test.tsx's
// identical mock. gsap.fromTo is mocked to a no-op here (not just made to
// resolve instantly) since this test suite cares about focus/visibility/
// step-navigation behavior, not the animation itself.
vi.mock('gsap', () => ({
  gsap: {
    fromTo: vi.fn(),
    context: vi.fn().mockImplementation((cb: () => void) => {
      cb();
      return { revert: vi.fn() };
    }),
  },
}));

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
});

// Fills and advances through every step in order, using real user
// interaction (not directly setting field values) -- lugar/numeroInvitados/
// presupuesto are left blank since they're optional, matching the previous
// single-page test's coverage of "required fields only" as the base path.
async function completeAllSteps(user: ReturnType<typeof userEvent.setup>, overrides: { mensaje?: string } = {}) {
  await user.type(screen.getByLabelText('Nombre'), 'Ana');
  await user.click(screen.getByRole('button', { name: /siguiente/i }));

  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
  await user.click(screen.getByRole('button', { name: /siguiente/i }));

  await user.selectOptions(screen.getByLabelText('Tipo de evento'), 'boda');
  await user.click(screen.getByRole('button', { name: /siguiente/i }));

  await user.click(screen.getByRole('button', { name: /siguiente/i })); // fecha/lugar, both optional
  await user.click(screen.getByRole('button', { name: /siguiente/i })); // invitados/presupuesto, both optional

  await user.type(screen.getByLabelText('Mensaje'), overrides.mensaje ?? 'Nos casamos en junio');
  await user.click(screen.getByRole('button', { name: /enviar/i }));
}

describe('ContactForm (multi-step)', () => {
  it('shows a progress indicator that advances as the user steps through the form', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '1');
    expect(progress).toHaveAttribute('aria-valuemax', '6');

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(progress).toHaveAttribute('aria-valuenow', '2');
  });

  it('only shows one step\'s fields at a time -- the next step\'s field is not present until reached', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText('Nombre')).toBeVisible();
    expect(screen.queryByLabelText('Correo electrónico')).not.toBeVisible();
  });

  it('blocks advancing to the next step when the current step\'s required field is empty', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    // Still on step 1 -- the email field (step 2) never became visible.
    expect(screen.getByLabelText('Nombre')).toBeInvalid();
    expect(screen.queryByLabelText('Correo electrónico')).not.toBeVisible();
  });

  it('lets the user go back to a previous step and keeps what they already typed', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('button', { name: /atrás/i }));
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
  });

  it('advances to the next step on Enter, but not inside the final message textarea (newlines stay newlines)', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Nombre'), 'Ana{Enter}');
    expect(screen.getByLabelText('Correo electrónico')).toBeVisible();

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.selectOptions(screen.getByLabelText('Tipo de evento'), 'boda');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(screen.getByLabelText('Mensaje'), 'Primera línea{Enter}Segunda línea');
    expect(screen.getByLabelText('Mensaje')).toHaveValue('Primera línea\nSegunda línea');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits the full payload (including earlier steps\' values) to /api/contacto on the final step', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/contacto',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"nombre":"Ana"'),
      })
    );
    const call = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(call[1].body);
    expect(body).toMatchObject({
      nombre: 'Ana',
      email: 'ana@example.com',
      tipoEvento: 'boda',
      mensaje: 'Nos casamos en junio',
    });
    expect(await screen.findByText(/gracias/i)).toBeInTheDocument();
  });

  it('includes lugar and número de invitados in the payload when filled in on their step, both stay optional', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.selectOptions(screen.getByLabelText('Tipo de evento'), 'boda');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(screen.getByLabelText('Lugar del evento')).not.toBeRequired();
    await user.type(screen.getByLabelText('Lugar del evento'), 'Hacienda de San Rafael');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(screen.getByLabelText(/número de invitados/i)).not.toBeRequired();
    await user.type(screen.getByLabelText(/número de invitados/i), '80');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(screen.getByLabelText('Mensaje'), 'Nos casamos en junio');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    expect(global.fetch).toHaveBeenCalledWith('/api/contacto', expect.objectContaining({
      body: expect.stringContaining('"lugar":"Hacienda de San Rafael"'),
    }));
  });

  it('shows an error message on a network-level fetch failure (not just a non-ok response)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(/no hemos podido enviar/i);
  });

  it('disables the submit button while the request is in flight and re-enables it afterwards', async () => {
    let resolveFetch: (value: { ok: boolean; json: () => Promise<unknown> }) => void;
    global.fetch = vi.fn().mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));
    const user = userEvent.setup();
    render(<ContactForm />);
    await completeAllSteps(user);
    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled();
    resolveFetch!({ ok: true, json: async () => ({ ok: true }) });
    await screen.findByText(/gracias/i);
  });

  it('autofocuses the active step\'s field', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    expect(screen.getByLabelText('Nombre')).toHaveFocus();
    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByLabelText('Correo electrónico')).toHaveFocus();
  });
});
