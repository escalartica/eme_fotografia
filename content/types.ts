export interface SiteInfo {
  brandName: string;
  legalCity: string;
  email: string;
  instagramUrl: string;
  instagramHandle: string;
  instagramFollowers: number;
  facebookUrl: string;
  facebookName: string;
  facebookLikes: number;
  addressLocality: string;
  addressCountry: string;
  streetAddress: string;
  postalCode: string;
  founderName: string;
}

export type ServiceSlug = 'boda' | 'video' | 'fotomaton' | '360';

export interface Service {
  slug: ServiceSlug;
  name: string;
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
  cover: ProjectMedia;
  gallery: ProjectMedia[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  isPlaceholder: boolean;
  photo?: string; // path under public/images/, e.g. '/images/testimonios/placeholder-01.webp'
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  isPendingConfirmation?: boolean;
}
