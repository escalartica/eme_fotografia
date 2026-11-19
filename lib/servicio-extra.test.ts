import { describe, expect, it } from 'vitest';
import { services } from '@/content/services';
import { faqs } from '@/content/faq';
import { bodasDelServicio, preguntasDelServicio } from './servicio-extra';

describe('preguntasDelServicio', () => {
  it('devuelve las preguntas en el orden de faqIds y deja fuera las pendientes', () => {
    const pendiente = faqs.find((f) => f.isPendingConfirmation)!;
    const r = preguntasDelServicio({ faqIds: ['precio', pendiente.id, 'disponibilidad', 'no-existe'] });
    expect(r.map((f) => f.id)).toEqual(['precio', 'disponibilidad']);
  });

  it('cada id que declaran los servicios existe en content/faq.ts', () => {
    for (const s of services) {
      for (const id of s.faqIds ?? []) {
        expect(faqs.some((f) => f.id === id), `${s.slug}: ${id}`).toBe(true);
      }
    }
  });
});

describe('bodasDelServicio', () => {
  it('solo bodas de la categoría, sin prebodas ni postbodas, de la más reciente a la más antigua', () => {
    const boda = services.find((s) => s.slug === 'boda')!;
    const r = bodasDelServicio(boda);
    expect(r.length).toBeGreaterThan(0);
    expect(r.length).toBeLessThanOrEqual(8);
    expect(r.some((p) => /^(pre|post)boda/i.test(p.title))).toBe(false);
    const years = r.map((p) => p.year);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it('el vídeo enlaza también los reportajes que están en vídeo por alsoIn', () => {
    const video = services.find((s) => s.slug === 'video')!;
    const r = bodasDelServicio(video);
    expect(r.some((p) => p.category === 'boda' && p.alsoIn?.includes('video'))).toBe(true);
  });

  it('sin categoría no hay lista', () => {
    expect(bodasDelServicio({ relatedCategory: undefined })).toEqual([]);
  });
});

describe('textos de los servicios', () => {
  it('no publican precios: el estudio da el precio a cada pareja al contactar', () => {
    for (const s of services) {
      const texto = [s.zonas ?? '', ...(s.estilo ?? []).map((b) => b.texto), s.metaDescription].join(' ');
      expect(texto).not.toMatch(/€|euros|desde \d/i);
    }
  });
});
