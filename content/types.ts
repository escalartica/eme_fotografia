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
}

export type ProjectCategory = ServiceSlug;

export interface ProjectMedia {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
  isPlaceholderMedia: boolean;
  sourceCredit?: string;
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
