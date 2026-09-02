import type { Project } from './types';

export const projects: Project[] = [
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client, organized by the client into a folder named "andrea y
    // enrique"). EXIF capture timestamps consistent across selected files
    // (2026-03-16). SPELLING NOTE, same class of gap as boda-real-01's
    // provisional-name comment: the client's own explicitly-confirmed name
    // list (given earlier for a different set of couples) spells this groom
    // "Andre y Enrique" (no final "a"); this folder is spelled "andrea y
    // enrique" (with it). Used the folder's own spelling here rather than
    // silently picking the other — unconfirmed, flag and correct if the
    // client clarifies.
    slug: 'andrea-y-enrique',
    title: 'Andrea y Enrique',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una ceremonia bajo arcos andaluces y una fiesta con mucha energía: de la risa nerviosa de los preparativos al abrazo compartido delante de todos.',
    cover: {
      type: 'image',
      src: '/images/trabajos/andrea-y-enrique/cover.webp',
      alt: 'Los novios riendo juntos bajo un arco de piedra durante la ceremonia',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1067,
      height: 1600,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/preparativos-novio.webp', alt: 'El novio riendo junto a un amigo mientras se viste', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/preparativos-novia.webp', alt: 'La novia con su ramo bajo una lámpara de araña durante los preparativos', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/fiesta.webp', alt: 'Invitados celebrando y agitando servilletas en la fiesta', isPlaceholderMedia: false },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client, organized into a folder named "marta y alvaro" — matches
    // exactly one of the couple names the client explicitly confirmed
    // earlier). EXIF capture timestamp 2026-06-22; the bouquet ribbon in
    // one selected photo is embroidered with the date "20.06.2026" and the
    // initials "M&A", independently corroborating both the couple and the
    // wedding date.
    slug: 'marta-y-alvaro',
    title: 'Marta y Álvaro',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Preparativos frente al espejo, una ceremonia al aire libre con los más pequeños de la familia como protagonistas, y un ramo con el día bordado en la cinta.',
    cover: {
      type: 'image',
      src: '/images/trabajos/marta-y-alvaro/cover.webp',
      alt: 'La novia sonriendo con su ramo de claveles y una cinta bordada con la fecha de la boda',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1067,
      height: 1600,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/preparativos-novio.webp', alt: 'El novio arreglándose frente al espejo antes de la ceremonia', isPlaceholderMedia: false, width: 1600, height: 1067 },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/ceremonia.webp', alt: 'Los novios y los pajes durante la ceremonia al aire libre', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/detalle.webp', alt: 'Detalle de la corbata y los gemelos del novio', isPlaceholderMedia: false },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client, organized into a folder named "maria y francisco
    // manuel" — a couple not previously named/confirmed elsewhere in this
    // project's records, no discrepancy to flag). EXIF capture timestamp
    // 2026-07-27.
    slug: 'maria-y-francisco-manuel',
    title: 'María y Francisco Manuel',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una novia con diadema de estrellas, un coche clásico rojo a la puerta y un abrazo con la cola del vestido extendida sobre el suelo.',
    cover: {
      type: 'image',
      src: '/images/trabajos/maria-y-francisco-manuel/cover.webp',
      alt: 'Retrato de la novia con diadema y ramo de rosas blancas y eucalipto',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1067,
      height: 1600,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/llegada.webp', alt: 'La novia llegando en un coche clásico rojo junto a su padre', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/pareja.webp', alt: 'Los novios abrazados con la cola del vestido extendida sobre el suelo', isPlaceholderMedia: false },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client, organized into a folder named "rocío y juanje" — matches
    // exactly one of the couple names the client explicitly confirmed
    // earlier). EXIF capture timestamps mostly 2026-05-05, one selected
    // file (the rings detail) dated 2026-06-02 -- only the year is stated
    // in this project's data model, so this day-level discrepancy doesn't
    // affect anything recorded here.
    slug: 'rocio-y-juanje',
    title: 'Rocío y Juanje',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'De un anillo con guiño personal a la novia esperando junto a un coche clásico, hasta el novio levantado en volandas por sus amigos en la fiesta.',
    cover: {
      type: 'image',
      src: '/images/trabajos/rocio-y-juanje/cover.webp',
      alt: 'Retrato de la novia con tiara y ramo de rosas blancas sobre suelo de damero',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1067,
      height: 1600,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/detalle.webp', alt: 'El novio mostrando un anillo con un guiño personal', isPlaceholderMedia: false },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/llegada.webp', alt: 'El novio esperando junto a un coche clásico mientras llega la novia', isPlaceholderMedia: false, width: 1600, height: 1067 },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/fiesta.webp', alt: 'El novio levantado en volandas por sus amigos durante la fiesta', isPlaceholderMedia: false },
    ],
  },
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
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1600,
      height: 1066,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/raquel-y-fran/detalle-ojal.webp', alt: 'Detalle del ojal de lavanda del novio', isPlaceholderMedia: false, width: 1066, height: 1600 },
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
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1600,
      height: 1066,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/preparativos.webp', alt: 'La novia reflejada en un espejo durante los preparativos', isPlaceholderMedia: false, width: 1066, height: 1600 },
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
      // Verified via `ffprobe -select_streams v:0 -show_entries stream=width,height`.
      width: 1280,
      height: 720,
    },
    gallery: [
      {
        type: 'video',
        src: '/videos/previews/real-boda-01-full.mp4',
        poster: '/videos/posters/real-boda-01-full.webp',
        alt: 'Vídeo de la boda de Eva y Rafa: preparativos, salida y ceremonia',
        isPlaceholderMedia: false,
        width: 1280,
        height: 720,
      },
      {
        type: 'video',
        src: '/videos/previews/real-boda-01-aerial.mp4',
        poster: '/videos/posters/real-boda-01-aerial.webp',
        alt: 'Vista aérea de la boda de Eva y Rafa: llegada y ceremonia en la hacienda',
        isPlaceholderMedia: false,
        width: 1280,
        height: 720,
      },
      {
        // Cut from a real DJI drone clip (18s-33s of the raw file), color
        // graded (contrast/saturation lift + sharpen, matching the aerial
        // clip's own treatment), compressed to 720p H.264/faststart, no
        // audio track (matches this project's grid-preview convention).
        type: 'video',
        src: '/videos/previews/real-boda-01-golden-hour.mp4',
        poster: '/videos/posters/real-boda-01-golden-hour.webp',
        alt: 'Vista aérea de los novios paseando por el jardín de la hacienda al atardecer',
        isPlaceholderMedia: false,
        // Verified via `ffprobe -select_streams v:0 -show_entries stream=width,height`.
        width: 1280,
        height: 720,
      },
      {
        // Cut from a third, previously-unused real DJI drone clip (26s-44s
        // of the raw file), same golden-hour grade as the aerial/
        // golden-hour clips above. The raw clip's first ~25s had a parked
        // guest shuttle bus in frame (visible in the wider establishing
        // pass); this window is entirely after the drone descends past it,
        // and a further top-15%-of-frame crop removes the last trace of it
        // from the horizon line -- verified by re-extracting and viewing a
        // frame after the crop, not assumed.
        type: 'video',
        src: '/videos/previews/real-boda-01-recepcion.mp4',
        poster: '/videos/posters/real-boda-01-recepcion.webp',
        alt: 'Vista aérea del banquete preparado en el patio de la hacienda al atardecer',
        isPlaceholderMedia: false,
        // Verified via `ffprobe -select_streams v:0 -show_entries stream=width,height`.
        width: 1280,
        height: 720,
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
    cover: {
      type: 'image',
      src: '/images/trabajos/gala-empresa-fotomaton-360/placeholder-cover.webp',
      alt: 'Invitados posando en la plataforma 360°',
      isPlaceholderMedia: true,
      sourceCredit: 'Unsplash',
      // Verified via `sips -g pixelWidth -g pixelHeight` — the stock photo
      // itself is a placeholder, but its pixel dimensions are real,
      // measured from the actual file, not guessed.
      width: 2000,
      height: 2692,
    },
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
