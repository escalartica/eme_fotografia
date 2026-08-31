import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';

const SITE_URL = 'https://www.emefotografiasevilla.es';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['/', '/trabajos', '/servicios', '/sobre-nosotros', '/contacto'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
  const projectRoutes = projects.map((p) => ({ url: `${SITE_URL}/trabajos/${p.slug}`, lastModified: new Date() }));
  return [...staticRoutes, ...projectRoutes];
}
