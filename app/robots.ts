import { site } from '@/content/site';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin and the private client galleries also carry their own
    // noindex (app/admin/layout.tsx, app/[slug]/page.tsx): a Disallow
    // stops the fetch, the meta stops the indexing, and a URL that leaks
    // into a link somewhere needs both.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] },
    sitemap: `${site.siteUrl}/sitemap.xml`,
  };
}
