import { site } from '@/content/site';
import type { Project } from '@/content/types';

const SITE_URL = 'https://www.emefotografiasevilla.es';

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.brandName,
    url: SITE_URL,
    image: `${SITE_URL}/images/logo/eme-mark-square.png`,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.streetAddress,
      addressLocality: site.addressLocality,
      postalCode: site.postalCode,
      addressCountry: site.addressCountry,
    },
    areaServed: site.legalCity,
    sameAs: [site.instagramUrl, site.facebookUrl],
  };
}

export function creativeWorkSchema(project: Project) {
  const imageSrc = project.cover.type === 'image' ? project.cover.src : project.cover.poster;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    dateCreated: String(project.year),
    url: `${SITE_URL}/trabajos/${project.slug}`,
    ...(imageSrc ? { image: `${SITE_URL}${imageSrc}` } : {}),
  };
}
