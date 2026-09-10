export interface SiteInfo {
  brandName: string;
  /** Canonical origin of the public site, no trailing slash. */
  siteUrl: string;
  /** One-line positioning used in titles and descriptions. */
  tagline: string;
  legalCity: string;
  email: string;
  instagramUrl: string;
  instagramHandle: string;
  instagramFollowers: number;
  facebookUrl: string;
  facebookName: string;
  facebookLikes: number;
  tiktokUrl: string;
  tiktokHandle: string;
  /** Phone in E.164 without '+' (for wa.me links). */
  whatsappNumber: string;
  /** Phone as displayed to people. */
  phoneDisplay: string;
  addressLocality: string;
  addressCountry: string;
  streetAddress: string;
  postalCode: string;
  founderName: string;
  // Real, current stats from the studio's own Bodas.net profile -- see
  // content/site.ts for the verification note. Not a snapshot baked into
  // an image (like the trust badges), so these can be kept current by
  // updating the numbers here rather than re-exporting a graphic.
  bodasNetUrl: string;
  bodasNetRating: number;
  bodasNetReviewCount: number;
  bodasNetCoupleCount: number;
}

export type ServiceSlug = 'boda' | 'video';

export interface Service {
  slug: ServiceSlug;
  name: string;
  /**
   * Ruta de la página propia del servicio.
   *
   * Los dos servicios vivieron durante un tiempo en una sola URL con dos
   * anclas (`/servicios#boda`, `/servicios#video`), y eso obligaba a que las
   * dos decisiones de compra —que son distintas, y a menudo las toma gente
   * distinta— compartieran `<title>`, `description` y un único `<h1>`. Aquí
   * está el mapeo slug → ruta, y es el ÚNICO sitio donde debe estar: lo leen
   * el menú del pie, el panel de la home, el sitemap, el `Offer` del JSON-LD
   * y /llms.txt.
   */
  route: string;
  /** El `<h1>` de esa página. El `name` es la etiqueta corta de un enlace. */
  heading: string;
  /** `<title>` y `description` propios: es media razón para separarlas. */
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  includes: string[];
  idealFor: string;
  process: { step: number; title: string; description: string }[];
  ctaLabel: string;
  // Path under public/, e.g. '/videos/posters/real-boda-01-full.webp'. Not
  // every service has a matching asset yet — absent means "no image", not a
  // stock placeholder to fill the gap. See content/services.ts for which
  // services have a real vs. placeholder image and why.
  previewImage?: string;
  /** Alt text for previewImage when it is shown as content (not as a hover/decorative backdrop). */
  previewImageAlt?: string;
  /**
   * Landscape counterpart of `previewImage`, for the full-screen service
   * panel on the home (ServicioPanel, 100svh and roughly 1.9:1). The same
   * file cannot serve both surfaces: `previewImage` fills a 4:5 column, so
   * it is portrait, and a portrait photograph in a full-screen band shows
   * about a third of itself. Falls back to `previewImage` when absent.
   */
  panelImage?: string;
  /**
   * Optional looping clip for the service's image column (video service):
   * shown instead of `previewImage`, which then only serves as the poster
   * fallback under prefers-reduced-motion. Paths under public/.
   */
  previewVideo?: { src: string; poster: string; alt: string };
  /**
   * Optional strip of real work shown under the service copy -- a few
   * frames from projects already on the site, never stock. Dimensions are
   * the real intrinsic pixel sizes of the files (same rule as ProjectMedia).
   */
  gallery?: { src: string; alt: string; width: number; height: number }[];
  /**
   * Category on /trabajos this service maps to. Absent when there is not
   * yet a single published project in that category (an empty filter
   * would be a worse landing than no link at all).
   */
  relatedCategory?: ProjectCategory;
  /** Short editorial paragraph shown under the tagline. */
  intro?: string;
}

export type ProjectCategory = ServiceSlug;

export interface ProjectMedia {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
  isPlaceholderMedia: boolean;
  sourceCredit?: string;
  /**
   * Real intrinsic dimensions in px, from the source file — never guessed.
   * Optional: `next/image`'s own `width`/`height` props already reserve
   * correct space for images (see how callers already pass those from
   * this same `src`), so this pair matters specifically for `<video>`
   * elements, which have no equivalent built-in CLS protection — a video
   * rendered without a reserved box shifts layout once its own metadata
   * loads. Absent means "not yet measured", not "no aspect ratio" —
   * callers fall back to a fixed ratio rather than assuming square/16:9.
   */
  width?: number;
  height?: number;
  /**
   * Duración real del clip en segundos, MEDIDA sobre el fichero con
   * `ffprobe -v error -show_entries format=duration -of csv=p=0 <archivo>` —
   * nunca estimada a ojo ni deducida del montaje. Misma regla que
   * `width`/`height`: ausente significa "sin medir", no "sin duración".
   *
   * Solo la llevan los clips que son el contenido principal de su página (el
   * tráiler de la boda), porque es lo que app/sitemap.ts usa para decidir qué
   * entra en la extensión de vídeo del sitemap: los loops aéreos de apoyo de
   * 5-14 s que acompañan al tráiler se quedan fuera a propósito — listarlos
   * sería declararle a Google seis vídeos donde la página ofrece uno.
   */
  durationSeconds?: number;
  /**
   * Optional per-item width for the project detail page's editorial gallery
   * flow (components/sections/ProjectGallery.tsx, A3 pattern from
   * docs/PATRONES-AWWWARDS.md): 'full' renders full-bleed across the flow's
   * whole width, 'wide'/'half' render narrower, centered columns for
   * variety ("alternando verticales a sangre y horizontales a media
   * anchura", not one rigid width). Absent means "no curated width decision
   * made for this item yet" -- which width best suits a specific real photo
   * is real curatorial judgment, out of scope for this data file to invent
   * wholesale, so the gallery flow falls back to a deterministic
   * full/wide/half cycle by index rather than guessing.
   */
  span?: 'full' | 'wide' | 'half';
  /**
   * Focal point for cover crops as a CSS object-position value
   * (e.g. '50% 15%'). Defaults to the site-wide top-biased crop.
   */
  focus?: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: number;
  client: string;
  location: string;
  description: string;
  impactLine?: string;
  /**
   * Fecha de publicación del vídeo del reportaje, ISO 8601 (YYYY-MM-DD).
   *
   * Es el único campo que le falta a lib/schema.ts para poder emitir un
   * `VideoObject` completo: Google exige `uploadDate` y no acepta un
   * sustituto. `year` NO sirve — es el año de la boda, no el día en que se
   * publicó la pieza —, y rellenarlo con un 1 de enero fabricado fue
   * justamente lo que se retiró de creativeWorkSchema(). Mientras esté
   * ausente, la ficha se marca como `CreativeWork` y el vídeo se descubre por
   * la extensión de vídeo del sitemap, que no pide fecha.
   *
   * TODO(cliente): fecha real de publicación de cada vídeo.
   */
  videoUploadDate?: string;
  cover: ProjectMedia;
  /**
   * Portrait stand-in for the ONE slot whose shape cannot follow the
   * photograph: /trabajos' pinned desktop preview, which crossfades
   * between projects and so has to keep a fixed box. Six of the 29 covers
   * are landscape, and a 3:2 photograph in that 3:4 frame shows half its
   * width. Where the wedding has a portrait frame worth standing in, it
   * goes here; everywhere else the cover is used directly.
   */
  thumb?: ProjectMedia;
  gallery: ProjectMedia[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  isPlaceholder: boolean;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  isPendingConfirmation?: boolean;
}
