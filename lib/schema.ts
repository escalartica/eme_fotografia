import { site } from '@/content/site';
import type { Project } from '@/content/types';

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.brandName,
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: site.addressLocality, addressCountry: site.addressCountry },
    sameAs: [site.instagramUrl, site.facebookUrl],
  };
}

export function creativeWorkSchema(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    dateCreated: String(project.year),
  };
}
