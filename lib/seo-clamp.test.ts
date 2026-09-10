import { describe, it, expect } from 'vitest';
import { clampDescription } from './seo';
import { projects } from '@/content/projects';

describe('clampDescription', () => {
  it('leaves a short description untouched', () => {
    const s = 'Una boda de junio con la sierra al fondo.';
    expect(clampDescription(s)).toBe(s);
  });

  it('cuts at a sentence end when there is one far enough in', () => {
    // La primera frase tiene que pasar del carácter 90 para que se use este
    // camino. Mi versión anterior de este test usaba una frase que acababa en
    // el 74 y esperaba un corte de frase que la función, correctamente, no
    // hacía: por debajo del umbral devolvería una descripción raquítica.
    const s =
      'Una boda de junio en un pueblo blanco con la ermita al fondo y toda la vega a los pies del mirador. ' +
      'Segunda frase que ya no cabe en el fragmento porque el texto editorial de este sitio es largo.';
    const out = clampDescription(s);
    expect(out.endsWith('.')).toBe(true);
    expect(out).not.toContain('Segunda frase');
    expect(out.length).toBeLessThanOrEqual(156);
    expect(s.startsWith(out)).toBe(true);
  });

  it('falls back to a word boundary with an ellipsis when the first sentence ends too early', () => {
    // El umbral de 90 existe para no devolver un fragmento inútilmente corto:
    // más vale una frase cortada limpiamente por palabra que una de 20
    // caracteres que no dice nada.
    const s =
      'Frase corta que acaba pronto. ' +
      'Y a continuación un texto bastante más largo que sí llena el fragmento hasta pasar del límite que Google enseña en resultados.';
    const out = clampDescription(s);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(156);
    expect(s.startsWith(out.replace(/…$/, ''))).toBe(true);
  });

  it('never invents text: the result is always a prefix of the original', () => {
    for (const p of projects) {
      const out = clampDescription(p.description).replace(/…$/, '');
      expect(p.description.startsWith(out)).toBe(true);
    }
  });

  it('brings every project description under the length Google shows', () => {
    // 22 of the 29 were over 160 before this existed; the longest was 317.
    for (const p of projects) {
      expect(clampDescription(p.description).length).toBeLessThanOrEqual(156);
    }
  });
});
