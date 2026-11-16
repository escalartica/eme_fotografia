import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import nextConfig from '../next.config.mjs';
import { sesionesMascotasFamilias } from '@/content/sesiones-mascotas-familias';

/**
 * Las direcciones viejas que ya se han compartido tienen que llevar a su
 * página nueva, y con redirección permanente para que Google pase lo que
 * tuviera la vieja a la nueva.
 */
describe('redirecciones de páginas renombradas', () => {
  it('/mascotas/navidad lleva a las sesiones solidarias de mascotas y familias', async () => {
    const reglas = await nextConfig.redirects!();
    const regla = reglas.find((r) => r.source === '/mascotas/navidad');
    expect(regla).toMatchObject({ destination: sesionesMascotasFamilias.route, permanent: true });
  });

  it('la página de destino existe y la vieja ya no', () => {
    const app = path.join(process.cwd(), 'app', '(site)');
    expect(fs.existsSync(path.join(app, ...sesionesMascotasFamilias.route.split('/').filter(Boolean), 'page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(app, 'mascotas', 'navidad'))).toBe(false);
  });
});
