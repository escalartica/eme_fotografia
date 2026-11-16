import { describe, it, expect, vi } from 'vitest';
import { enviarEnlaceDeRecuperacion, destinoDeRecuperacion, MailError, DEFAULT_CONTACT_TO, type EnviarCorreo } from './mail';

/**
 * El correo con el enlace para cambiar la contraseña del panel. Lo que
 * importa: que vaya SOLO al buzón del estudio (nunca a una dirección que
 * venga de la petición), y que un fallo del servidor de correo no se trague.
 */

const ENTORNO = {
  SMTP_HOST: 'smtp.ionos.es',
  SMTP_USER: 'info@emefotografiasevilla.com',
  SMTP_PASS: 'lo-que-sea',
} as unknown as NodeJS.ProcessEnv;

const ENLACE = 'https://www.emefotografiasevilla.com/admin/recuperar/abc';

describe('destinoDeRecuperacion', () => {
  it('usa ADMIN_EMAIL, luego CONTACT_TO, luego el buzón por defecto', () => {
    expect(destinoDeRecuperacion({ ADMIN_EMAIL: 'a@x.com, b@x.com ' } as never)).toEqual(['a@x.com', 'b@x.com']);
    expect(destinoDeRecuperacion({ CONTACT_TO: 'c@x.com' } as never)).toEqual(['c@x.com']);
    expect(destinoDeRecuperacion({} as never)).toEqual([DEFAULT_CONTACT_TO]);
  });
});

describe('enviarEnlaceDeRecuperacion', () => {
  it('manda el enlace al buzón del estudio, en texto y en HTML', async () => {
    const enviar = vi.fn<EnviarCorreo>(async () => ({ messageId: 'm1' }));
    const r = await enviarEnlaceDeRecuperacion(ENLACE, new Date('2026-11-16T12:30:00Z'), ENTORNO, enviar);
    expect(r).toEqual({ id: 'm1' });
    const m = enviar.mock.calls[0][0];
    expect(m.to).toEqual([DEFAULT_CONTACT_TO]);
    expect(m.text).toContain(ENLACE);
    expect(m.html).toContain(`href="${ENLACE}"`);
    expect(m.subject).toMatch(/contraseña/);
  });

  it('escapa el enlace dentro del HTML', async () => {
    const enviar = vi.fn<EnviarCorreo>(async () => ({}));
    await enviarEnlaceDeRecuperacion('https://x/"><script>', new Date(), ENTORNO, enviar);
    expect(enviar.mock.calls[0][0].html).not.toContain('"><script>');
  });

  it('sin configuración no lo intenta', async () => {
    await expect(enviarEnlaceDeRecuperacion(ENLACE, new Date(), {} as never)).rejects.toBeInstanceOf(MailError);
  });

  it('convierte el fallo del servidor en MailError', async () => {
    const enviar = vi.fn<EnviarCorreo>(async () => {
      throw new Error('550 rechazado');
    });
    await expect(enviarEnlaceDeRecuperacion(ENLACE, new Date(), ENTORNO, enviar)).rejects.toThrow(/550 rechazado/);
  });
});
