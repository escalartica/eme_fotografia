import type { Project } from './types';

export const projects: Project[] = [
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client 2026-09-01, organized by the client into a folder named
    // "raquel y fran"). EXIF capture timestamps on the source files are
    // consistent across all of them (2026-06-16, same morning) — a real,
    // verified date, not a guess. Replaces a previous placeholder entry
    // ("Clara y Manuel", stock Unsplash photos).
    slug: 'raquel-y-fran',
    title: 'Raquel y Fran',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una boda con un pie de foto y otro en la carretera: coche clásico, jardines y una celebración sin postureo.',
    cover: {
      type: 'image',
      src: '/images/trabajos/raquel-y-fran/cover.webp',
      alt: 'Los novios celebrando de pie en un coche descapotable clásico frente a un edificio señorial',
      isPlaceholderMedia: false,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/raquel-y-fran/detalle-ojal.webp', alt: 'Detalle del ojal de lavanda del novio', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/primer-baile.webp', alt: 'Primer baile de los novios', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/candido.webp', alt: 'Momento cómplice y desenfadado del novio', isPlaceholderMedia: false },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client 2026-09-01, organized by the client into a folder named
    // "andrea y jesus"). Source files' EXIF capture date was not reliably
    // preserved (metadata matches file-copy time, not a real capture
    // timestamp), so only the year is stated, not a specific date — no
    // guessed detail beyond what's actually confirmed. Replaces a previous
    // placeholder entry ("Lucía y Jorge", stock Unsplash photos).
    slug: 'andrea-y-jesus',
    title: 'Andrea y Jesús',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'De los preparativos al primer baile bajo luces de escenario: una boda con mucha fiesta y ningún momento posado de más.',
    cover: {
      type: 'image',
      src: '/images/trabajos/andrea-y-jesus/cover.webp',
      alt: 'Primer baile de los novios bajo luces de escenario',
      isPlaceholderMedia: false,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/preparativos.webp', alt: 'La novia reflejada en un espejo durante los preparativos', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/fiesta.webp', alt: 'Invitadas bailando y celebrando en la fiesta', isPlaceholderMedia: false },
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
      {
        type: 'video',
        src: '/videos/previews/real-boda-01-full.mp4',
        poster: '/videos/posters/real-boda-01-full.webp',
        alt: 'Vídeo de la boda de Eva y Rafa: preparativos, salida y ceremonia',
        isPlaceholderMedia: false,
      },
      {
        type: 'video',
        src: '/videos/previews/real-boda-01-aerial.mp4',
        poster: '/videos/posters/real-boda-01-aerial.webp',
        alt: 'Vista aérea de la boda de Eva y Rafa: llegada y ceremonia en la hacienda',
        isPlaceholderMedia: false,
      },
      { type: 'image', src: '/images/trabajos/boda-real-01/real-boda-01-maquillaje.webp', alt: 'Maquillaje de la novia antes de la ceremonia', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/boda-real-01/real-boda-01-anillos.webp', alt: 'Intercambio de anillos durante la ceremonia', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/boda-real-01/real-boda-01-familia.webp', alt: 'Los novios abrazados por sus sobrinos', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/boda-real-01/real-boda-01-pajes.webp', alt: 'Los pajes de la boda con gafas de sol', isPlaceholderMedia: false },
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
