import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

describe('sitemap', () => {
  it('includes every static route and every project detail route', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    for (const path of [
      '/',
      '/trabajos',
      '/servicios',
      '/servicios/fotografia-de-boda',
      '/servicios/video-de-boda',
      '/sobre-nosotros',
      '/contacto',
    ]) {
      expect(urls.some((u) => u.endsWith(path))).toBe(true);
    }
    for (const project of projects) {
      expect(urls.some((u) => u.endsWith(`/trabajos/${project.slug}`))).toBe(true);
    }
  });

  it('ranks the two service pages above their index, since they are what a search lands on', () => {
    const entries = sitemap();
    const find = (path: string) => entries.find((e) => e.url === `${site.siteUrl}${path}`)!;
    expect(find('/servicios/fotografia-de-boda').priority).toBe(0.8);
    expect(find('/servicios/video-de-boda').priority).toBe(0.8);
    expect(find('/servicios').priority).toBe(0.6);
  });

  it('lists every photo of a project, since the gallery loads them client-side', () => {
    const entries = sitemap();
    const project = projects.find((p) => p.slug === 'virginia-y-jorge')!;
    const entry = entries.find((e) => e.url.endsWith('/trabajos/virginia-y-jorge'))!;
    // La portada de esta ficha es un vídeo, así que las imágenes son las de
    // la galería. `thumb` no cuenta: es un recorte de reserva de una foto que
    // ya está dentro.
    expect(entry.images).toHaveLength(project.gallery.filter((m) => m.type === 'image').length);
    expect(entry.images!.every((u) => u.startsWith(`${site.siteUrl}/images/trabajos/`))).toBe(true);
  });

  it('lists only the clips that are the main content of their page', () => {
    const entries = sitemap();
    // Tres en todo el sitio: el tráiler de Carmen y Alberto, el tráiler
    // completo de Eva y Rafa y el vídeo de portada de Virginia y Jorge. Si
    // este número sube, es que han entrado los planos aéreos de apoyo de
    // 5-14 s, que se dejan fuera a propósito.
    const videos = entries.flatMap((e) => e.videos ?? []);
    expect(videos).toHaveLength(3);
    // Los tres campos obligatorios de la extensión de vídeo, presentes y
    // reales. La fecha de subida NO es uno de ellos, y por eso estos vídeos
    // se pueden listar mientras el VideoObject sigue bloqueado.
    for (const video of videos) {
      expect(video.title).toBeTruthy();
      expect(video.description).toBeTruthy();
      expect(video.thumbnail_loc).toMatch(/^https?:\/\/.+\.(webp|jpg)$/);
      expect(video.publication_date).toBeUndefined();
    }
    const virginia = entries.find((e) => e.url.endsWith('/trabajos/virginia-y-jorge'))!;
    expect(virginia.videos).toHaveLength(1);
    // 19,72 s medidos con ffprobe, redondeados al entero que admite el formato.
    expect(virginia.videos![0]).toMatchObject({
      title: 'Virginia y Jorge',
      duration: 20,
      thumbnail_loc: `${site.siteUrl}/videos/posters/virginia-y-jorge-preview.webp`,
      content_loc: `${site.siteUrl}/videos/previews/virginia-y-jorge-preview.mp4`,
    });
    // Un reportaje de foto no declara una lista de vídeos vacía.
    const gloria = entries.find((e) => e.url.endsWith('/trabajos/gloria-y-andres'))!;
    expect(gloria.videos).toBeUndefined();
    expect(gloria.images!.length).toBeGreaterThan(0);
  });
});
