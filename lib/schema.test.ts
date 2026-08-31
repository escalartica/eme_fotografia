import { describe, it, expect } from 'vitest';
import { localBusinessSchema, creativeWorkSchema } from './schema';
import { site } from '@/content/site';
import { projects } from '@/content/projects';

describe('schema.org generators', () => {
  it('builds a LocalBusiness schema with real contact and social data', () => {
    const schema = localBusinessSchema();
    expect(schema['@type']).toBe('LocalBusiness');
    expect(schema.name).toBe(site.brandName);
    expect(schema.email).toBe(site.email);
    expect(schema.sameAs).toEqual([site.instagramUrl, site.facebookUrl]);
    expect(schema.address.addressLocality).toBe('La Algaba');
  });

  it('builds a CreativeWork schema for a project', () => {
    const schema = creativeWorkSchema(projects[0]);
    expect(schema['@type']).toBe('CreativeWork');
    expect(schema.name).toBe(projects[0].title);
  });

  it('includes url, image, and areaServed on the LocalBusiness schema', () => {
    const schema = localBusinessSchema();
    expect(schema.url).toBe('https://www.emefotografiasevilla.es');
    expect(schema.image).toBe('https://www.emefotografiasevilla.es/images/logo/eme-mark-square.png');
    expect(schema.areaServed).toBe('Sevilla');
    expect(schema.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: site.streetAddress,
      addressLocality: site.addressLocality,
      postalCode: site.postalCode,
      addressCountry: site.addressCountry,
    });
  });

  it('includes image and url on the CreativeWork schema when the project has a cover image', () => {
    const project = projects.find((p) => p.cover.type === 'image')!;
    const schema = creativeWorkSchema(project);
    expect(schema.image).toContain(project.cover.src);
    expect(schema.url).toBe(`https://www.emefotografiasevilla.es/trabajos/${project.slug}`);
  });
});
