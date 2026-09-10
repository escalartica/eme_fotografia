import { describe, it, expect } from 'vitest';
import { GET } from './route';
import { faqs } from '@/content/faq';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

async function body() {
  return GET().text();
}

describe('/llms.txt', () => {
  it('is served as plain UTF-8 text', () => {
    expect(GET().headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });

  it('opens with the brand as an H1 and a one-paragraph summary', async () => {
    const text = await body();
    expect(text.startsWith(`# ${site.brandName}\n`)).toBe(true);
    expect(text).toContain('\n> ');
  });

  it('lists every published project with its absolute URL', async () => {
    const text = await body();
    for (const project of projects) {
      expect(text).toContain(`${site.siteUrl}/trabajos/${project.slug}`);
    }
  });

  it('quotes only the FAQ answers the studio has confirmed', async () => {
    const text = await body();
    // Mismo criterio que el FAQPage de lib/schema.ts: una respuesta sin
    // confirmar citada por un asistente se lee como una promesa del estudio.
    for (const faq of faqs) {
      expect(text.includes(faq.answer)).toBe(!faq.isPendingConfirmation);
    }
  });

  it('publishes no price and says so explicitly', async () => {
    const text = await body();
    // La web entera no publica tarifas; un fichero pensado para que lo cite
    // un modelo es justo donde más caro sale que se cuele una cifra.
    expect(/\d\s?€|€\s?\d|EUR\s?\d/.test(text)).toBe(false);
    expect(text).toContain('EME no publica tarifas');
  });

  it('never calls EME an "estudio"', async () => {
    // Regla del cliente: no hay local ni plató, es un equipo. Este fichero
    // está escrito para que un asistente lo cite literalmente, así que una
    // palabra equivocada aquí se repite en boca de terceros.
    const text = await body();
    expect(text.toLowerCase()).not.toContain('estudio');
  });

  it('never turns the five award editions into a range', async () => {
    const text = await body();
    expect(text).toContain('2019, 2021, 2022, 2023 y 2025');
    expect(text).not.toContain('2020');
    expect(text).not.toContain('2024, ');
    expect(text).toContain('no consecutivas');
  });

  it('gives the rating with a Spanish decimal comma', async () => {
    const text = await body();
    expect(text).toContain(`5,0 sobre 5 con ${site.bodasNetReviewCount} opiniones`);
  });
});
