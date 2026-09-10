import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.brandName,
    short_name: 'EME',
    description: 'Fotografía y vídeo de bodas en Sevilla y Andalucía.',
    start_url: '/',
    display: 'browser',
    background_color: '#F8F7F2',
    theme_color: '#F8F7F2',
    icons: [{ src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  };
}
