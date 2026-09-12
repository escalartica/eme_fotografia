import { describe, it, expect, vi } from 'vitest';
import { sendContactEmail, isMailConfigured, MailError, DEFAULT_CONTACT_TO, type EnviarCorreo } from './mail';
import type { ContactSubmission } from './contact-store';

/**
 * EL AVISO POR CORREO, sin abrir un socket.
 *
 * `sendContactEmail` acepta el transporte como último argumento justamente
 * para esto: aquí se le pasa un doble y se comprueba QUÉ mensaje habría
 * salido. Sin esa costura, probar esto significaría o mandar correo de verdad
 * al buzón del estudio o no probarlo, que es lo que pasaba antes.
 */

const SOLICITUD: ContactSubmission = {
  nombre: 'Ana y Luis',
  email: 'ana@example.com',
  telefono: '600000000',
  fecha: '2027-06-12',
  lugar: 'Hacienda de Sevilla',
  tipoEvento: 'boda',
  mensaje: 'Nos gustaría saber si tenéis libre esa fecha.',
  comoNosConociste: 'Instagram',
  consentimiento: 'si',
};

const META = { id: 'abc123', receivedAt: '2026-09-13T00:00:00.000Z' };

const ENTORNO = {
  SMTP_HOST: 'smtp.ionos.es',
  SMTP_USER: 'info@emefotografiasevilla.com',
  SMTP_PASS: 'lo-que-sea',
} as unknown as NodeJS.ProcessEnv;

describe('isMailConfigured', () => {
  it('exige las tres: servidor, usuario y contraseña', () => {
    expect(isMailConfigured(ENTORNO)).toBe(true);
    expect(isMailConfigured({ ...ENTORNO, SMTP_PASS: '' })).toBe(false);
    expect(isMailConfigured({ ...ENTORNO, SMTP_HOST: '   ' })).toBe(false);
    expect(isMailConfigured({} as NodeJS.ProcessEnv)).toBe(false);
  });
});

describe('sendContactEmail', () => {
  it('responde a la PAREJA, no al propio buzón del estudio', async () => {
    const enviar = vi.fn<EnviarCorreo>().mockResolvedValue({ messageId: '<1@ionos>' });
    await sendContactEmail(SOLICITUD, META, ENTORNO, enviar);

    const mensaje = enviar.mock.calls[0][0];
    // Es la línea que hace que «Responder» en el correo funcione sin pensar:
    // el aviso sale del buzón del estudio y llega al buzón del estudio, así
    // que sin esto responder sería escribirse a uno mismo.
    expect(mensaje.replyTo).toBe('ana@example.com');
    expect(mensaje.to).toEqual([DEFAULT_CONTACT_TO]);
    expect(mensaje.from).toContain('info@emefotografiasevilla.com');
  });

  it('lleva en el asunto y en el cuerpo lo que el estudio necesita para contestar', async () => {
    const enviar = vi.fn<EnviarCorreo>().mockResolvedValue({ messageId: '<1@ionos>' });
    await sendContactEmail(SOLICITUD, META, ENTORNO, enviar);

    const { subject, text, html } = enviar.mock.calls[0][0];
    expect(subject).toContain('Ana y Luis');
    for (const dato of ['2027-06-12', 'Hacienda de Sevilla', 'ana@example.com']) {
      expect(text).toContain(dato);
      expect(html).toContain(dato);
    }
  });

  it('admite varios destinatarios separados por coma', async () => {
    const enviar = vi.fn<EnviarCorreo>().mockResolvedValue({ messageId: '<1@ionos>' });
    await sendContactEmail(SOLICITUD, META, { ...ENTORNO, CONTACT_TO: 'a@x.com, b@x.com ' }, enviar);
    expect(enviar.mock.calls[0][0].to).toEqual(['a@x.com', 'b@x.com']);
  });

  it('escapa el HTML de lo que escribe quien rellena el formulario', async () => {
    const enviar = vi.fn<EnviarCorreo>().mockResolvedValue({ messageId: '<1@ionos>' });
    await sendContactEmail(
      { ...SOLICITUD, nombre: '<script>alert(1)</script>' },
      META,
      ENTORNO,
      enviar
    );
    // El correo lo abre el estudio en su cliente de correo: lo que llega del
    // formulario es entrada de un desconocido, aquí también.
    expect(enviar.mock.calls[0][0].html).not.toContain('<script>');
    expect(enviar.mock.calls[0][0].html).toContain('&lt;script&gt;');
  });

  it('convierte el fallo del servidor de correo en MailError, sin filtrar nada raro', async () => {
    const enviar = vi.fn<EnviarCorreo>().mockRejectedValue(new Error('535 Authentication failed'));
    await expect(sendContactEmail(SOLICITUD, META, ENTORNO, enviar)).rejects.toBeInstanceOf(MailError);
  });

  it('se niega a enviar si no hay configuración, en vez de fallar a medias', async () => {
    const enviar = vi.fn<EnviarCorreo>();
    await expect(
      sendContactEmail(SOLICITUD, META, {} as NodeJS.ProcessEnv, enviar)
    ).rejects.toBeInstanceOf(MailError);
    // Y sin haber intentado abrir nada.
    expect(enviar).not.toHaveBeenCalled();
  });
});
