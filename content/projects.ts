import type { Project } from './types';

export const projects: Project[] = [
  {
    slug: 'clara-y-manuel',
    title: 'Clara y Manuel',
    category: 'boda',
    year: 2025,
    client: 'Boda privada',
    location: 'Hacienda de San Rafael, Sevilla',
    description: 'Una boda de tarde-noche con luz dorada andaluza, contada como un editorial de moda.',
    cover: { type: 'image', src: '/images/trabajos/clara-y-manuel/placeholder-cover.webp', alt: 'Pareja de novios caminando al atardecer', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
    gallery: [
      { type: 'image', src: '/images/trabajos/clara-y-manuel/placeholder-01.webp', alt: 'Detalle del vestido de novia', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
      { type: 'image', src: '/images/trabajos/clara-y-manuel/placeholder-02.webp', alt: 'Anillos de boda sobre tela', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
      { type: 'image', src: '/images/trabajos/clara-y-manuel/placeholder-03.webp', alt: 'Primer baile de los novios', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
    ],
  },
  {
    slug: 'lucia-y-jorge',
    title: 'Lucía y Jorge',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Cortijo El Esparragal, Sevilla',
    description: 'Ceremonia íntima al aire libre con un enfoque documental y editorial a la vez.',
    cover: { type: 'image', src: '/images/trabajos/lucia-y-jorge/placeholder-cover.webp', alt: 'Novia sonriendo junto a un coche clásico', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
    gallery: [
      { type: 'image', src: '/images/trabajos/lucia-y-jorge/placeholder-01.webp', alt: 'Ceremonia civil al aire libre', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
      { type: 'image', src: '/images/trabajos/lucia-y-jorge/placeholder-02.webp', alt: 'Ramo de novia sobre mesa de madera', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
      { type: 'image', src: '/images/trabajos/lucia-y-jorge/placeholder-03.webp', alt: 'Brindis de los invitados', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
    ],
  },
  {
    // Real footage from an actual EME Fotografía wedding shoot (provided by
    // the client 2026-08-31; original raw clips shot on Canon EOS 5D Mark IV,
    // "com.apple.quicktime.author: EME FOTOGRAFIA" in the source metadata).
    // Couple name "Eva y Rafa" given by the client 2026-08-31, PROVISIONAL —
    // the client is still confirming the exact names with María Leal
    // (founder). Update if that confirmation differs.
    slug: 'boda-real-01',
    title: 'Eva y Rafa',
    category: 'video',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Selección de momentos reales del día de la boda: preparativos, salida y ceremonia.',
    cover: {
      type: 'video',
      src: '/videos/previews/real-boda-01-preview.mp4',
      poster: '/videos/posters/real-boda-01.webp',
      alt: 'Vista previa del vídeo de boda de Eva y Rafa: preparativos y salida de la novia',
      isPlaceholderMedia: false,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/boda-elena-y-pablo-video/placeholder-01.webp', alt: 'Fotograma de los votos', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
      {
        type: 'video',
        src: '/videos/previews/real-boda-01-full.mp4',
        poster: '/videos/posters/real-boda-01-full.webp',
        alt: 'Vídeo de la boda de Eva y Rafa: preparativos, salida y ceremonia',
        isPlaceholderMedia: false,
      },
    ],
  },
  {
    slug: 'gala-empresa-fotomaton-360',
    title: 'Gala Anual — Fotomatón & 360°',
    category: '360',
    year: 2025,
    client: 'Evento corporativo',
    location: 'Hotel Alfonso XIII, Sevilla',
    description: 'Fotomatón temático y plataforma 360° como protagonistas de una gala corporativa.',
    cover: { type: 'image', src: '/images/trabajos/gala-empresa-fotomaton-360/placeholder-cover.webp', alt: 'Invitados posando en la plataforma 360°', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
    gallery: [
      { type: 'image', src: '/images/trabajos/gala-empresa-fotomaton-360/placeholder-01.webp', alt: 'Fotomatón con atrezzo temático', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
      {
        type: 'video',
        src: '/videos/previews/placeholder-gala-360-preview.mp4',
        poster: '/videos/posters/placeholder-gala-360.webp',
        alt: 'Vídeo a cámara lenta desde la plataforma 360°',
        isPlaceholderMedia: true,
        sourceCredit: 'Pexels/Coverr (licencia CC0)',
      },
    ],
  },
];
