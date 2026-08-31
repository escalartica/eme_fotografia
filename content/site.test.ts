import { describe, it, expect } from 'vitest';
import { site } from './site';

describe('site content', () => {
  it('uses the real confirmed brand facts', () => {
    expect(site.brandName).toBe('EME Fotografía Sevilla');
    expect(site.email).toBe('info@emefotografiasevilla.es');
    expect(site.instagramFollowers).toBe(1622);
    expect(site.facebookLikes).toBe(2320);
    expect(site.addressLocality).toBe('La Algaba');
    expect(site.founderName).toBe('María Leal');
  });

  it('has well-formed URLs', () => {
    expect(site.instagramUrl.startsWith('https://')).toBe(true);
    expect(site.facebookUrl.startsWith('https://')).toBe(true);
  });
});
