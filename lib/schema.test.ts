import { describe, it, expect } from 'vitest';
import { localBusinessSchema, webSiteSchema, siteGraph, creativeWorkSchema, breadcrumbSchema } from './schema';
import { site } from '@/content/site';
import { projects } from '@/content/projects';
import { services } from '@/content/services';

describe('schema.org generators', () => {
  it('builds a LocalBusiness schema with real contact, social and rating data', () => {
    const schema = localBusinessSchema();
    expect(schema['@type']).toEqual(['LocalBusiness', 'ProfessionalService']);
    expect(schema.name).toBe(site.brandName);
    expect(schema.email).toBe(site.email);
    expect(schema.telephone).toBe(`+${site.whatsappNumber}`);
    expect(schema.sameAs).toEqual([site.instagramUrl, site.facebookUrl, site.tiktokUrl, site.bodasNetUrl]);
    expect(schema.address.addressLocality).toBe('La Algaba');
    expect(schema.aggregateRating).toMatchObject({ ratingValue: site.bodasNetRating, reviewCount: site.bodasNetReviewCount, bestRating: 5 });
    expect(schema.hasOfferCatalog.itemListElement).toHaveLength(2);
  });

  it('points each Offer at the service page, not at an anchor of the index', () => {
    // El catálogo declaraba `/servicios#boda` y `/servicios#video` cuando los
    // dos servicios compartían página. Un `Offer` con ancla apunta a media
    // página; ahora cada uno tiene URL propia y es la que se declara.
    const offers = localBusinessSchema().hasOfferCatalog.itemListElement;
    expect(offers.map((o) => o.itemOffered.url)).toEqual(
      services.map((s) => `${site.siteUrl}${s.route}`),
    );
    for (const offer of offers) {
      expect(offer.itemOffered.url).not.toContain('#');
    }
  });

  it('includes url, image and the Andalusian provinces served', () => {
    const schema = localBusinessSchema();
    expect(schema.url).toBe(site.siteUrl);
    // `image` dejó de ser la tarjeta de logo (/images/og/default.jpg, que
    // sigue siendo el fallback para compartir enlaces) y son fotografías del
    // trabajo. El logotipo se comprueba en `logo`, que es su campo.
    expect(schema.image).toHaveLength(3);
    expect(schema.image.every((url) => url.startsWith(`${site.siteUrl}/images/trabajos/`))).toBe(true);
    expect(schema.logo).toBe(`${site.siteUrl}/images/logo/eme-mark-square.png`);
    expect(schema.areaServed.map((a) => a.name)).toContain('Sevilla');
    expect(schema.areaServed.map((a) => a.name)).toContain('Cádiz');
  });

  it('lists the five real Wedding Awards editions and never as a range', () => {
    const schema = localBusinessSchema();
    // 2020 y 2024 NO se ganaron: si algún día aparecen aquí, es que alguien
    // ha convertido la lista en un rango.
    expect(schema.award).toEqual([
      'Wedding Award 2019 de Bodas.net',
      'Wedding Award 2021 de Bodas.net',
      'Wedding Award 2022 de Bodas.net',
      'Wedding Award 2023 de Bodas.net',
      'Wedding Award 2025 de Bodas.net',
    ]);
    expect(schema.numberOfEmployees).toMatchObject({ value: 5 });
    expect(schema.currenciesAccepted).toBe('EUR');
    expect(schema.founder.name).toBe(site.founderName);
  });

  it('does not declare opening hours or coordinates', () => {
    // El estudio no tiene local con horario de puertas abiertas y nadie ha
    // confirmado coordenadas. Google publica ambos campos tal cual.
    const schema: Record<string, unknown> = localBusinessSchema();
    expect(schema.openingHoursSpecification).toBeUndefined();
    expect(schema.geo).toBeUndefined();
  });

  it('builds a WebSite node published by the business, with no fake search action', () => {
    const schema: Record<string, unknown> = webSiteSchema();
    expect(schema['@type']).toBe('WebSite');
    expect(schema['@id']).toBe(`${site.siteUrl}/#website`);
    expect(schema.inLanguage).toBe('es-ES');
    expect(schema.publisher).toEqual({ '@id': `${site.siteUrl}/#eme` });
    // La web no tiene buscador interno: declarar un SearchAction sería
    // prometer una página de resultados que no existe.
    expect(schema.potentialAction).toBeUndefined();
  });

  it('emits both nodes in a single @graph, each with its own @id', () => {
    const graph = siteGraph();
    expect(graph['@context']).toBe('https://schema.org');
    expect(graph['@graph'].map((node) => node['@id'])).toEqual([
      `${site.siteUrl}/#eme`,
      `${site.siteUrl}/#website`,
    ]);
    // El @context va una sola vez, arriba: repetirlo dentro de cada nodo de
    // un @graph es inválido.
    expect(graph['@graph'].some((node) => '@context' in node)).toBe(false);
  });

  it('builds an ImageGallery for a photo project and never a dateless VideoObject', () => {
    const photo = projects.find((p) => p.category === 'boda')!;
    const video = projects.find((p) => p.category === 'video')!;
    expect(creativeWorkSchema(photo)['@type']).toBe('ImageGallery');
    expect(creativeWorkSchema(photo).name).toBe(photo.title);
    // Ningún reportaje tiene todavía `videoUploadDate` confirmada por el
    // estudio, y Google exige `uploadDate` en un VideoObject. Antes se
    // rellenaba con el 1 de enero del año de la boda: una fecha fabricada que
    // además se publica en los resultados. Sin fecha real, CreativeWork.
    expect(video.videoUploadDate).toBeUndefined();
    const schema: Record<string, unknown> = creativeWorkSchema(video);
    expect(schema['@type']).toBe('CreativeWork');
    expect(schema.uploadDate).toBeUndefined();
    expect(schema.contentUrl).toBeUndefined();
  });

  it('includes image and url on the project schema when the project has a cover image', () => {
    const project = projects.find((p) => p.cover.type === 'image')!;
    const schema = creativeWorkSchema(project);
    expect(schema.image).toContain(project.cover.src);
    expect(schema.url).toBe(`${site.siteUrl}/trabajos/${project.slug}`);
  });

  it('builds an ordered breadcrumb trail', () => {
    const schema = breadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Trabajos', path: '/trabajos' },
    ]);
    expect(schema.itemListElement[1]).toMatchObject({ position: 2, name: 'Trabajos', item: `${site.siteUrl}/trabajos` });
  });
});
