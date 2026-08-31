import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
});

describe('ContactForm', () => {
  it('blocks submission when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /enviar/i }));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/nombre/i)).toBeInvalid();
  });

  it('submits the payload to /api/contacto and shows a success message', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'Ana');
    await user.type(screen.getByLabelText(/correo/i), 'ana@example.com');
    await user.selectOptions(screen.getByLabelText(/tipo de evento/i), 'boda');
    await user.type(screen.getByLabelText(/mensaje/i), 'Nos casamos en junio');
    await user.click(screen.getByRole('button', { name: /enviar/i }));
    expect(global.fetch).toHaveBeenCalledWith('/api/contacto', expect.objectContaining({ method: 'POST' }));
    expect(await screen.findByText(/gracias/i)).toBeInTheDocument();
  });
});
