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
});
