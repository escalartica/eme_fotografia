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
    // LO QUE SE COMPRUEBA ES LA REGLA, NO UN NÚMERO. Aquí ponía «tres», y el
    // día que dos bodas más estrenaron su película la prueba se cayó sin que
    // nada estuviera mal: el sitemap hacía exactamente lo que tiene que hacer.
    //
    // LA REGLA: se lista la pieza montada de cada boda y ninguno de los planos
    // de apoyo. Lo que las separa es `durationSeconds`, que NO es un dato
    // técnico sino la marca editorial de «esto es una pieza» -- así lo dice el
    // comentario que acompaña a cada una en content/projects.ts. Los clips
    // aéreos de 5-14 s que cuelgan de una galería no la llevan, y por eso se
    // quedan fuera: listarlos como contenido principal de la página es
    // justamente lo que Google penaliza.
    //
    // La pieza puede estar en la portada (lo normal) o dentro de la galería
    // (Carmen y Alberto, cuyo tráiler no abre la ficha), así que se miran las
    // dos: fijarlo solo a la portada fue el error de la versión anterior de
    // esta prueba.
    const piezas = projects.flatMap((p) =>
      [p.cover, ...p.gallery].filter((m) => m.type === 'video' && m.poster && m.durationSeconds)
    );
    const clipsDeApoyo = projects.flatMap((p) =>
      p.gallery.filter((m) => m.type === 'video' && !m.durationSeconds)
    );
    expect(piezas.length).toBeGreaterThan(0);
    expect(clipsDeApoyo.length).toBeGreaterThan(0);
    const videos = entries.flatMap((e) => e.videos ?? []);
    expect(videos).toHaveLength(piezas.length);
    // Y ninguno de los de apoyo se ha colado.
    const listados = new Set(videos.map((v) => v.content_loc));
    for (const clip of clipsDeApoyo) {
      expect(listados.has(`${site.siteUrl}${clip.src}`)).toBe(false);
    }
    // Los tres campos obligatorios de la extensión de vídeo, presentes y
    // reales. La fecha de subida NO es uno de ellos, y por eso estos vídeos
    // se pueden listar mientras el VideoObject sigue bloqueado.
    for (const video of videos) {
      expect(video.title).toBeTruthy();
      expect(video.description).toBeTruthy();
      expect(video.thumbnail_loc).toMatch(/^https?:\/\/.+\.(webp|jpg)$/);
      expect(video.publication_date).toBeUndefined();
    }
    // Se comprueba contra la portada REAL del reportaje, no contra rutas y
    // una duración escritas a mano aquí. Lo que puede romperse de verdad es
    // que el constructor del sitemap deje de mirar `project.cover` -- y eso
    // esto lo caza. Con los valores copiados, cambiar la pieza de vídeo de una
    // boda rompía el test sin que nada estuviera mal, que es la clase de
    // prueba que se acaba actualizando a ciegas.
    const virginiaProyecto = projects.find((p) => p.slug === 'virginia-y-jorge')!;
    const virginia = entries.find((e) => e.url.endsWith('/trabajos/virginia-y-jorge'))!;
    expect(virginia.videos).toHaveLength(1);
    expect(virginiaProyecto.cover.type).toBe('video');
    expect(virginia.videos![0]).toMatchObject({
      title: 'Virginia y Jorge',
      duration: Math.round(virginiaProyecto.cover.durationSeconds!),
      thumbnail_loc: `${site.siteUrl}${virginiaProyecto.cover.poster}`,
      content_loc: `${site.siteUrl}${virginiaProyecto.cover.src}`,
    });
    // Un reportaje de foto no declara una lista de vídeos vacía. Se busca el
    // reportaje por su forma, no por su nombre: aquí iba fijado
    // gloria-y-andres, y el día que esa boda estrenó su película -- portada de
    // vídeo, como cualquier otra puede hacer mañana -- la prueba se cayó sin
    // que nada estuviera mal.
    const soloFoto = projects.find((p) => p.cover.type === 'image')!;
    const entradaFoto = entries.find((e) => e.url.endsWith(`/trabajos/${soloFoto.slug}`))!;
    expect(entradaFoto.videos).toBeUndefined();
    expect(entradaFoto.images!.length).toBeGreaterThan(0);
  });
});
