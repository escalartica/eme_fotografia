import type { SVGProps } from 'react';

/**
 * Shared icon primitives for the site's chrome (menu toggle, social links,
 * the theme switch, lightbox close). Until now the site carried zero
 * icons -- every control was set in type (Header's "Menú"/"Cerrar",
 * Footer's plain "Instagram"/"Facebook" links, Lightbox's "Cerrar"
 * button) -- deliberately, per the monochrome/editorial direction. Rather
 * than reach for a generic icon library (Lucide/Feather/Material), whose
 * geometric, uniform-weight strokes read as "default app UI" and would
 * sit oddly next to a Didone masthead, these are drawn to match the
 * hairline-serif's own visual idea: a single thin stroke
 * (strokeWidth 1.25, not a library's usual 1.5-2) carrying all the
 * weight, exactly like a Bodoni's hairlines carry a letterform. Icons are
 * ALWAYS paired with existing visible text or an aria-label -- never the
 * sole accessible name for a control (accessibility skill anti-pattern:
 * icon-only buttons need a text alternative).
 *
 * `currentColor` throughout, so every icon inherits color (and the
 * dark-mode token swap) from its context with no extra wiring.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps) {
  const { size = 18, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.25,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
}

/** Two hairlines -> becomes an X via CSS transform in Header (the button
 * that carries the visible "Menú"/"Cerrar" label already; this is purely
 * decorative reinforcement, aria-hidden). */
export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <line x1="3.5" y1="8" x2="20.5" y2="8" />
      <line x1="3.5" y1="16" x2="20.5" y2="16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.1" cy="6.9" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 21v-7.2h2.4l.4-2.8h-2.8v-1.8c0-.8.2-1.4 1.4-1.4h1.5V5.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.4H9.3v2.8h2.5V21" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13.5 3v11.2a2.9 2.9 0 1 1-2.5-2.9" />
      <path d="M13.5 3c.3 2.6 2 4.3 4.5 4.5" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20l1.2-3.6A8 8 0 1 1 8.2 19.3z" />
      <path d="M9.3 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.5l-.5.6c-.1.1-.1.3 0 .4.4.7 1.3 1.7 2.4 2.3.2.1.3.1.4 0l.6-.7c.2-.2.3-.2.5-.1l1.5.7c.2.1.3.3.3.5-.1.8-.7 1.5-1.5 1.6-1.9.2-5.3-2.4-6.1-5-.2-.9.1-1.8.2-2.3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Small arrow-out-of-box glyph marking a link that leaves the site
 * (Bodas.net stat line, social links target=_blank). Purpose: state
 * indication -- tells the reader before the click that this is not
 * internal navigation. */
export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8.5 15.5L19 5" />
      <path d="M11 5h8v8" />
      <path d="M18 13.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V7.5A1.5 1.5 0 0 1 6 6h4.5" />
    </svg>
  );
}

/** Envelope glyph for the direct-email link on /contacto — pairs with the
 * visible mailto text, matching this file's own icon-always-paired-with-
 * text rule. */
export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

/** Plus glyph used as the FAQ disclosure marker (Faq.tsx) -- rotates 45deg
 * on the parent <details>'s [open] state, the same icon-morph-via-rotate
 * mechanism as Header's .menuGlyph/.closeGlyph, but as a single icon
 * rather than a two-icon crossfade (a plus rotated 45deg already reads as
 * the state change). Replaces the native disclosure triangle, which
 * carries no transition of its own. */
export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4.2" />
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
      <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" />
      <line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
    </svg>
  );
}

/** Heart glyph for the client gallery's "me gusta" selection toggle
 * (app/[slug]/GalleryClient.tsx). Outline by default; the caller fills it
 * (fill="currentColor") to show the liked state, the same on/off
 * language SunIcon/MoonIcon already use for ThemeToggle. */
export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20.2s-7.5-4.6-9.8-9C.7 7.8 2.4 4.5 5.6 4c2-.3 3.9.6 5 2.3.9-1.5 2.9-2.6 5-2.3 3.2.5 4.9 3.8 3.4 7.2-2.3 4.4-9.8 9-9.8 9z" />
    </svg>
  );
}

/** Speech-bubble glyph for the per-photo comment control. A small filled
 * dot badge (rendered by the caller, not this icon) marks a photo that
 * already has a comment, the same way an unread-count badge would. */
export function CommentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5h16v11H9.5L5 20.5v-4H4z" />
    </svg>
  );
}

/** Check glyph for the gallery's "selección enviada" confirmation state. */
export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

/** Upward-arrow-into-tray glyph for the admin photo dropzone
 * (app/admin/galerias/nueva). Paired with visible "Arrastra tus fotos
 * aqui..." copy, never the sole label. */
export function UploadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 15.5V4" />
      <path d="M7.5 8.5L12 4l4.5 4.5" />
      <path d="M4.5 15.5V18a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5" />
    </svg>
  );
}

/** Trash glyph for removing a staged file before upload (admin new-gallery
 * form) -- always paired with an aria-label naming the file it removes. */
export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 7h15" />
      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
      <path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7" />
      <line x1="10" y1="10.5" x2="10" y2="17" />
      <line x1="14" y1="10.5" x2="14" y2="17" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a7 7 0 0 0 10.2 10.2z" />
    </svg>
  );
}
