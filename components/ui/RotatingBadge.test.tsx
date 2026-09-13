// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const lee = (ruta: string) => readFileSync(join(process.cwd(), ruta), 'utf8');

/**
 * EL FALLO QUE ESTAS DOS PRUEBAS IMPIDEN QUE VUELVA, visto en el móvil en el
 * cierre de la portada: el rótulo circular de la insignia --«FOTOGRAFÍA ·
 * VÍDEO · BODAS · SEVILLA»-- salía dibujado del tamaño de media sección, con
 * las letras repartidas por encima de la fotografía y el sello vacío en medio.
 *
 * La causa no estaba en la insignia sino en quien la coloca. El anillo es un
 * SVG con `position: absolute; inset: 0`, así que se mide contra el ancestro
 * posicionado más cercano. En escritorio ése es la propia insignia
 * (`position: relative`); en móvil, CtaContacto le ponía `position: static`
 * para sacarla del rincón, y con eso el anillo pasaba a colgarse de la
 * sección entera.
 *
 * Llevaba así desde que se escribió esa regla y no se veía, porque el rótulo
 * era casi transparente sobre una fotografía clara. Se destapó al volverlo
 * tinta opaca: el mismo fallo, ahora a la vista de cualquiera.
 *
 * Son pruebas sobre el texto de dos hojas de estilo, que no es lo habitual
 * aquí. Se hace así a propósito: jsdom no calcula `position` heredada ni
 * resuelve contra qué ancestro se mide un `inset`, de modo que una prueba de
 * componente pasaría con el fallo puesto. Lo que se puede fijar es la regla.
 */
describe('la insignia circular y quien la coloca', () => {
  it('CtaContacto no le quita a la insignia su contenedor de posicionamiento', () => {
    const css = lee('components/sections/CtaContacto.module.css');
    const enMovil = css.slice(css.indexOf('@media (max-width: 899px)'));
    expect(enMovil).toContain('.badge');
    expect(enMovil).not.toMatch(/\.badge\s*\{[^}]*position:\s*static/);
    expect(enMovil).toMatch(/\.badge\s*\{[^}]*position:\s*relative/);
  });

  it('y la insignia recorta lo suyo, por si alguien vuelve a quitárselo', () => {
    const css = lee('components/ui/RotatingBadge.module.css');
    expect(css).toMatch(/\.badge\s*\{[^}]*overflow:\s*clip/);
  });
});
