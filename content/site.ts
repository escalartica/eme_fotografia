import type { SiteInfo } from './types';

export const site: SiteInfo = {
  brandName: 'EME Fotografía Sevilla',
  legalCity: 'Sevilla',
  email: 'info@emefotografiasevilla.es',
  instagramUrl: 'https://www.instagram.com/eme_fotografia_sevilla',
  instagramHandle: '@eme_fotografia_sevilla',
  instagramFollowers: 1622,
  // Verified via web search: facebook.com/EmeFotografiaSevilla, name "EME Fotografia Sevilla",
  // ~2,329 likes reported (close to the ~2320 in the WhatsApp Business profile snapshot).
  facebookUrl: 'https://www.facebook.com/EmeFotografiaSevilla/',
  facebookName: 'EME Fotografia Sevilla',
  facebookLikes: 2320,
  // Real registered address, verified via the studio's own Bodas.net profile
  // (bodas.net/fotografos/eme-fotografia-sevilla--e71289) on 2026-08-31.
  // Kept as the precise legal/structured-data address; `legalCity` above stays
  // "Sevilla" for marketing copy since that's the brand name and the metro
  // area they serve, not the exact home-base town.
  addressLocality: 'La Algaba',
  addressCountry: 'ES',
  streetAddress: 'Calle Alicante 8',
  postalCode: '41927',
  // Verified via the same Bodas.net profile.
  founderName: 'María Leal',
};
