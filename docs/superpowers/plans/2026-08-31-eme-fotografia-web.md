# EME Fotografía Sevilla — Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the premium, award-caliber Next.js website for EME Fotografía Sevilla (photo + video wedding/event studio) described in the design spec.

**Architecture:** Next.js App Router + TypeScript, SSG for content pages, one API route for contact. CSS Modules + design-token custom properties (no Tailwind). GSAP + ScrollTrigger + Lenis for motion, native View Transitions API for page transitions. Content lives in a typed `/content` data layer shaped for a future headless CMS swap.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, CSS Modules, GSAP/ScrollTrigger, Lenis, Vitest + React Testing Library (jsdom), `next/image`, `next/font`.

**Spec:** `docs/superpowers/specs/2026-08-31-eme-fotografia-web-design.md`

## Global Constraints

- No Tailwind — CSS Modules + custom properties only.
- Max 2 type families: General Sans (self-hosted, `next/font/local`) + Fraunces (`next/font/google`).
- Color tokens are fixed and real (sampled from the client's logo, not invented): `--color-ink: #1F262E`, `--color-accent: #992927`, `--color-paper: #F7F5F2`, `--color-muted: #6B7178`. Accent never used as long-form text color.
- All routes in Spanish: `/`, `/trabajos`, `/trabajos/[slug]`, `/servicios`, `/sobre-nosotros`, `/contacto`.
- Every placeholder media file is named with a `placeholder-` prefix and flagged `isPlaceholderMedia: true` in content data — never silently presented as real EME work.
- Every animation must respect `prefers-reduced-motion` (via the shared `useReducedMotion` hook) — no exceptions.
- Animate only `transform`/`opacity` for anything scroll- or hover-driven.
- Real business facts (from the spec) must be used verbatim: brand name "EME Fotografía Sevilla", city Sevilla, email `info@emefotografiasevilla.es`, Instagram `@eme_fotografia_sevilla` (1622 seguidores), Facebook "EME Fotografia Sevilla" (2320 me gusta).
- Do not fabricate the founder's name, real working hours (beyond "Lunes 9:00-13:00 / 16:00-19:00" which was confirmed), or a real Facebook vanity URL — these must be verified live (Task 3) or left as "con cita previa" / omitted per spec §12.

---

## File Structure

```
package.json, tsconfig.json, next.config.mjs, .eslintrc.json, vitest.config.ts, .gitignore
app/
  layout.tsx, globals not here (styles/ instead)
  page.tsx                    (home)
  trabajos/page.tsx
  trabajos/[slug]/page.tsx
  servicios/page.tsx
  sobre-nosotros/page.tsx
  contacto/page.tsx
  api/contacto/route.ts
  sitemap.ts
  robots.ts
components/
  layout/Header.tsx, Header.module.css
  layout/MobileMenu.tsx, MobileMenu.module.css
  layout/Footer.tsx, Footer.module.css
  motion/SmoothScrollProvider.tsx
  motion/Cursor.tsx, Cursor.module.css
  motion/ScrollReveal.tsx
  motion/VideoPreview.tsx, VideoPreview.module.css
  motion/Lightbox.tsx, Lightbox.module.css
  motion/PageTransition.tsx
  sections/Hero.tsx, Hero.module.css
  sections/Manifiesto.tsx
  sections/SelectedWork.tsx, SelectedWork.module.css
  sections/ServiciosPreview.tsx
  sections/SobreEmePreview.tsx
  sections/Confianza.tsx
  sections/Testimonios.tsx
  sections/CtaContacto.tsx
  sections/ProjectGallery.tsx
  ui/ContactForm.tsx, ContactForm.module.css
content/
  types.ts, site.ts, services.ts, projects.ts, testimonials.ts
lib/
  breakpoints.ts, motion-tokens.ts, hooks/useReducedMotion.ts,
  hooks/useProjectFilter.ts, seo.ts, schema.ts, contact-store.ts
styles/
  tokens.css, reset.css, globals.css, fonts/ (General Sans woff2 files)
public/
  images/{hero,trabajos/<slug>,sobre-nosotros}, videos/{previews,posters}
scripts/
  fetch-placeholder-images.mjs, fetch-placeholder-videos.mjs
data/
  contact-submissions/ (gitignored, created at runtime)
```

---

### Task 1: Project scaffolding, tooling, and test runner

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `.eslintrc.json`, `.gitignore`, `vitest.config.ts`, `vitest.setup.ts`
- Create: `app/layout.tsx` (minimal placeholder shell, replaced in Task 9), `app/page.tsx` (minimal placeholder, replaced in Task 21)

**Interfaces:**
- Produces: an npm project where `npm run dev`, `npm run build`, and `npm test` all work. Every later task assumes this.

- [ ] **Step 1: Create the Next.js app**

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir=false --import-alias "@/*" --no-tailwind
```

- [ ] **Step 2: Add test tooling**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Add `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 4: Add `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';

// Default stub so any component reaching useReducedMotion (directly or via
// ScrollReveal/VideoPreview/SmoothScrollProvider) doesn't crash in jsdom,
// which has no native matchMedia. Individual tests that care about a
// specific matches value override window.matchMedia themselves — this is
// only the fallback for tests that don't.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
```

- [ ] **Step 5: Add the `test` script to `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  }
}
```

- [ ] **Step 6: Install animation and motion dependencies**

```bash
npm install gsap lenis
```

- [ ] **Step 7: Verify the toolchain**

Run: `npm run build && npm test`
Expected: build succeeds; vitest reports "No test files found" (not an error) since no tests exist yet.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Vitest test runner"
```

---

### Task 2: Design tokens, global styles, and fonts

**Files:**
- Create: `styles/tokens.css`, `styles/reset.css`, `styles/globals.css`
- Create: `public/fonts/GeneralSans-Variable.woff2` (download step below)
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: CSS custom properties consumed by every component's `.module.css` file (`var(--color-ink)`, `var(--font-sans)`, `var(--font-serif)`, `var(--space-*)`, `var(--duration-*)`).

- [ ] **Step 1: Download the self-hosted grotesk font**

```bash
mkdir -p public/fonts
curl -L "https://api.fontshare.com/v2/fonts/download/general-sans" -o /tmp/general-sans.zip
unzip -j /tmp/general-sans.zip "*Variable.woff2" -d public/fonts
```

Expected: `public/fonts/GeneralSans-Variable.woff2` exists. If Fontshare's API path has changed, download the "General Sans" variable woff2 manually from https://www.fontshare.com/fonts/general-sans and place it at that exact path before continuing.

- [ ] **Step 2: Write `styles/tokens.css`**

```css
:root {
  --color-ink: #1F262E;
  --color-accent: #992927;
  --color-paper: #F7F5F2;
  --color-muted: #6B7178;

  --font-sans: 'General Sans', system-ui, sans-serif;
  --font-serif: 'Fraunces', Georgia, serif;

  --space-1: clamp(0.5rem, 0.4rem + 0.4vw, 0.75rem);
  --space-2: clamp(1rem, 0.8rem + 0.8vw, 1.5rem);
  --space-3: clamp(2rem, 1.6rem + 1.6vw, 3rem);
  --space-4: clamp(4rem, 3rem + 3vw, 6rem);
  --space-5: clamp(6rem, 4.5rem + 5vw, 10rem);

  --type-body: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);
  --type-h3: clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
  --type-h2: clamp(2.25rem, 1.6rem + 2.5vw, 4rem);
  --type-h1: clamp(3rem, 1.8rem + 5vw, 7.5rem);

  --duration-fast: 0.3s;
  --duration-base: 0.6s;
  --duration-slow: 1.1s;
  --ease-standard: cubic-bezier(0.22, 1, 0.36, 1);

  --bp-mobile: 480px;
  --bp-tablet: 768px;
  --bp-laptop: 1024px;
  --bp-desktop: 1440px;
}
```

- [ ] **Step 3: Write `styles/reset.css`** (minimal modern reset)

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html { -webkit-text-size-adjust: 100%; }
body { line-height: 1.5; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
a { color: inherit; text-decoration: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Write `styles/globals.css`**

```css
@import './reset.css';
@import './tokens.css';

@font-face {
  font-family: 'General Sans';
  src: url('/fonts/GeneralSans-Variable.woff2') format('woff2');
  font-weight: 300 700;
  font-display: swap;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-size: var(--type-body);
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--color-ink);
  color: var(--color-paper);
  padding: var(--space-1) var(--space-2);
  z-index: 1000;
}
.skip-link:focus {
  left: var(--space-2);
  top: var(--space-2);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
```

- [ ] **Step 5: Wire Fraunces and globals into `app/layout.tsx`**

```tsx
import { Fraunces } from 'next/font/google';
import './../styles/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif-loaded',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fraunces.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npm run build`
Expected: build succeeds with no CSS/font errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, global styles, and fonts"
```

---

### Task 3: Content types and real site data (with live verification)

**Files:**
- Create: `content/types.ts`, `content/site.ts`
- Test: `content/site.test.ts`

**Interfaces:**
- Produces: `SiteInfo` type and `site: SiteInfo` singleton, imported by Header, Footer, ContactForm, and `lib/schema.ts` in later tasks.

- [ ] **Step 1: Verify the real Facebook page URL before hardcoding it**

Use WebSearch/WebFetch for `"EME Fotografia Sevilla" facebook fotografo Sevilla` and confirm a Facebook page whose name and approximate like-count (~2320) matches the WhatsApp Business profile already captured in the spec. Record the confirmed vanity URL for Step 3. If no confident match is found, use `https://www.facebook.com/eme.fotografia.sevilla` as the best-effort slug and flag it with a code comment `// TODO: confirm exact FB vanity URL with client` — do not silently invent a Facebook URL without this comment.

- [ ] **Step 2: Write `content/types.ts`**

```ts
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
}
```

- [ ] **Step 3: Write `content/site.ts`**

```ts
import type { SiteInfo } from './types';

export const site: SiteInfo = {
  brandName: 'EME Fotografía Sevilla',
  legalCity: 'Sevilla',
  email: 'info@emefotografiasevilla.es',
  instagramUrl: 'https://www.instagram.com/eme_fotografia_sevilla',
  instagramHandle: '@eme_fotografia_sevilla',
  instagramFollowers: 1622,
  // TODO: confirm exact FB vanity URL with client if Step 1 did not find a confident match
  facebookUrl: 'https://www.facebook.com/eme.fotografia.sevilla',
  facebookName: 'EME Fotografia Sevilla',
  facebookLikes: 2320,
  addressLocality: 'Sevilla',
  addressCountry: 'ES',
};
```

- [ ] **Step 4: Write the failing test `content/site.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { site } from './site';

describe('site content', () => {
  it('uses the real confirmed brand facts', () => {
    expect(site.brandName).toBe('EME Fotografía Sevilla');
    expect(site.email).toBe('info@emefotografiasevilla.es');
    expect(site.instagramFollowers).toBe(1622);
    expect(site.facebookLikes).toBe(2320);
    expect(site.addressLocality).toBe('Sevilla');
  });

  it('has well-formed URLs', () => {
    expect(site.instagramUrl.startsWith('https://')).toBe(true);
    expect(site.facebookUrl.startsWith('https://')).toBe(true);
  });
});
```

- [ ] **Step 5: Run the test**

Run: `npm test -- content/site.test.ts`
Expected: PASS (data was written before the test, so this confirms correctness, not TDD red/green — acceptable for static data modules).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add typed site content with verified real brand data"
```

---

### Task 4: Services, projects, and testimonials content

**Files:**
- Modify: `content/types.ts` (add `Service`, `ProjectCategory`, `ProjectMedia`, `Project`, `Testimonial`)
- Create: `content/services.ts`, `content/projects.ts`, `content/testimonials.ts`
- Test: `content/projects.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `services: Service[]`, `projects: Project[]`, `testimonials: Testimonial[]` — consumed by SelectedWork, /trabajos, /trabajos/[slug], /servicios, and Testimonios (Tasks 19–26).

- [ ] **Step 1: Extend `content/types.ts`**

Append the following below the existing `SiteInfo` interface from Task 3 — do not remove or replace `SiteInfo`, this file accumulates types across tasks:

```ts
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
  cover: ProjectMedia;
  gallery: ProjectMedia[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  isPlaceholder: boolean;
}
```

- [ ] **Step 2: Write `content/services.ts`**

```ts
import type { Service } from './types';

export const services: Service[] = [
  {
    slug: 'boda',
    name: 'Fotografía de Boda',
    tagline: 'Cada boda, contada como una historia editorial.',
    includes: ['Cobertura completa del día', 'Preboda opcional', 'Álbum editorial impreso', 'Galería digital privada'],
    idealFor: 'Parejas que quieren fotografías con dirección artística, no solo un reportaje.',
    process: [
      { step: 1, title: 'Primera conversación', description: 'Conocemos la pareja, el lugar y el estilo que buscan.' },
      { step: 2, title: 'Planificación', description: 'Diseñamos la cobertura del día junto a la pareja y el resto de proveedores.' },
      { step: 3, title: 'El gran día', description: 'Cobertura discreta y dirigida a la vez, sin interrumpir la celebración.' },
      { step: 4, title: 'Entrega', description: 'Selección editada y álbum en un plazo acordado.' },
    ],
    ctaLabel: 'Reservar fecha',
  },
  {
    slug: 'video',
    name: 'Vídeo',
    tagline: 'Cine de bodas y eventos, no un simple resumen.',
    includes: ['Vídeo resumen cinematográfico', 'Audio ambiente y votos', 'Teaser para redes sociales', 'Entrega en 4K'],
    idealFor: 'Quienes quieren revivir el día en movimiento, con ritmo y banda sonora propia.',
    process: [
      { step: 1, title: 'Guion emocional', description: 'Definimos qué momentos deben protagonizar el vídeo.' },
      { step: 2, title: 'Rodaje', description: 'Cámara en mano y fija, sonido ambiente capturado en directo.' },
      { step: 3, title: 'Montaje', description: 'Edición narrativa con música con licencia y color grading propio.' },
      { step: 4, title: 'Entrega', description: 'Vídeo final y teaser corto para compartir.' },
    ],
    ctaLabel: 'Consultar disponibilidad',
  },
  {
    slug: 'fotomaton',
    name: 'Fotomatón',
    tagline: 'Diversión instantánea con acabado editorial.',
    includes: ['Fotomatón con atrezzo a medida', 'Impresión instantánea ilimitada', 'Álbum de firmas de invitados', 'Copia digital de todas las fotos'],
    idealFor: 'Bodas, comuniones y eventos de empresa que buscan un momento memorable para los invitados.',
    process: [
      { step: 1, title: 'Diseño del rincón', description: 'Adaptamos el fotomatón a la estética del evento.' },
      { step: 2, title: 'Montaje', description: 'Instalación y prueba técnica antes de la llegada de invitados.' },
      { step: 3, title: 'Durante el evento', description: 'Personal presente para asistir a los invitados.' },
      { step: 4, title: 'Entrega', description: 'Galería digital completa al día siguiente.' },
    ],
    ctaLabel: 'Pedir presupuesto',
  },
  {
    slug: '360',
    name: 'Experiencia 360°',
    tagline: 'La plataforma que convierte a los invitados en protagonistas.',
    includes: ['Plataforma 360° con cámara elevada', 'Vídeos a cámara lenta editados al instante', 'Compartición inmediata por QR', 'Iluminación y atrezzo temático'],
    idealFor: 'Eventos que buscan el momento más compartido en redes sociales de la noche.',
    process: [
      { step: 1, title: 'Ubicación', description: 'Elegimos el punto del evento con mejor flujo de invitados.' },
      { step: 2, title: 'Montaje técnico', description: 'Calibración de la plataforma e iluminación.' },
      { step: 3, title: 'Durante el evento', description: 'Operador dedicado durante todo el horario contratado.' },
      { step: 4, title: 'Entrega', description: 'Todos los vídeos disponibles para descarga inmediata.' },
    ],
    ctaLabel: 'Pedir presupuesto',
  },
];
```

- [ ] **Step 3: Write `content/projects.ts`** (4 seed projects; media files are produced by Tasks 7–8)

```ts
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
    slug: 'boda-elena-y-pablo-video',
    title: 'Elena y Pablo — Película de boda',
    category: 'video',
    year: 2025,
    client: 'Boda privada',
    location: 'Sevilla capital',
    description: 'Cortometraje de boda con voz en off de los votos y banda sonora original.',
    cover: {
      type: 'video',
      src: '/videos/previews/placeholder-elena-pablo-preview.mp4',
      poster: '/videos/posters/placeholder-elena-pablo.webp',
      alt: 'Vista previa del vídeo de boda de Elena y Pablo',
      isPlaceholderMedia: true,
      sourceCredit: 'Pexels/Coverr (licencia CC0)',
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/boda-elena-y-pablo-video/placeholder-01.webp', alt: 'Fotograma de los votos', isPlaceholderMedia: true, sourceCredit: 'Unsplash' },
      {
        type: 'video',
        src: '/videos/previews/placeholder-elena-pablo-full.mp4',
        poster: '/videos/posters/placeholder-elena-pablo-full.webp',
        alt: 'Película completa de la boda de Elena y Pablo',
        isPlaceholderMedia: true,
        sourceCredit: 'Pexels/Coverr (licencia CC0)',
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
```

- [ ] **Step 4: Write `content/testimonials.ts`**

```ts
import type { Testimonial } from './types';

export const testimonials: Testimonial[] = [
  { id: 't1', quote: 'Nos entregaron algo que parecía sacado de una revista, no un reportaje de boda al uso.', author: 'Nombre de ejemplo', role: 'Pareja — boda 2025 (testimonio de muestra)', isPlaceholder: true },
  { id: 't2', quote: 'El vídeo nos hizo llorar de la emoción al verlo por primera vez.', author: 'Nombre de ejemplo', role: 'Pareja — boda 2024 (testimonio de muestra)', isPlaceholder: true },
  { id: 't3', quote: 'La plataforma 360° fue lo más comentado de toda la gala de empresa.', author: 'Nombre de ejemplo', role: 'Responsable de eventos (testimonio de muestra)', isPlaceholder: true },
];
```

- [ ] **Step 5: Write the failing test `content/projects.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { projects } from './projects';
import { services } from './services';

describe('projects content', () => {
  it('has exactly 4 seed projects with unique slugs', () => {
    expect(projects).toHaveLength(4);
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('flags every seed media item as placeholder', () => {
    for (const project of projects) {
      expect(project.cover.isPlaceholderMedia).toBe(true);
      for (const media of project.gallery) {
        expect(media.isPlaceholderMedia).toBe(true);
        if (media.type === 'video') expect(media.poster).toBeTruthy();
      }
    }
  });

  it('includes at least one video-led project', () => {
    expect(projects.some((p) => p.category === 'video')).toBe(true);
  });
});

describe('services content', () => {
  it('covers all four real EME services', () => {
    const slugs = services.map((s) => s.slug).sort();
    expect(slugs).toEqual(['360', 'boda', 'fotomaton', 'video']);
  });
});
```

- [ ] **Step 6: Run the tests**

Run: `npm test -- content`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add services, projects, and testimonials content"
```

---

### Task 5: Breakpoints and motion tokens

**Files:**
- Create: `lib/breakpoints.ts`, `lib/motion-tokens.ts`
- Test: `lib/motion-tokens.test.ts`

**Interfaces:**
- Produces: `breakpoints`, `motion` — consumed by every GSAP-driven component (Tasks 12–17) and any JS-side media query check.

- [ ] **Step 1: Write `lib/breakpoints.ts`**

```ts
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  wide: 1920,
} as const;

export type Breakpoint = keyof typeof breakpoints;
```

- [ ] **Step 2: Write `lib/motion-tokens.ts`**

```ts
export const motion = {
  duration: {
    fast: 0.3,
    base: 0.6,
    slow: 1.1,
    intro: 1.4,
  },
  ease: {
    standard: 'power3.out',
    enter: 'power2.out',
    exit: 'power2.in',
  },
} as const;
```

- [ ] **Step 3: Write the failing test `lib/motion-tokens.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { motion } from './motion-tokens';
import { breakpoints } from './breakpoints';

describe('motion tokens', () => {
  it('keeps the intro under the fast-start requirement (<=1.5s)', () => {
    expect(motion.duration.intro).toBeLessThanOrEqual(1.5);
  });
  it('orders breakpoints ascending', () => {
    const values = Object.values(breakpoints);
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test -- lib/motion-tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add breakpoint and motion timing tokens"
```

---

### Task 6: `useReducedMotion` hook

**Files:**
- Create: `lib/hooks/useReducedMotion.ts`
- Test: `lib/hooks/useReducedMotion.test.ts`

**Interfaces:**
- Produces: `useReducedMotion(): boolean` — consumed by SmoothScrollProvider, Cursor, ScrollReveal, VideoPreview, PageTransition, and the Hero intro (Tasks 12–18).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
  });
  return { fire: (next: boolean) => listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent)) };
}

afterEach(() => vi.restoreAllMocks());

describe('useReducedMotion', () => {
  it('reflects the initial media query value', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const { fire } = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => fire(true));
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/hooks/useReducedMotion.test.ts`
Expected: FAIL — module `./useReducedMotion` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/hooks/useReducedMotion.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add useReducedMotion hook"
```

---

### Task 7: Placeholder image assets

**Files:**
- Create: `scripts/fetch-placeholder-images.mjs`
- Creates at runtime: `public/images/trabajos/<slug>/placeholder-*.webp`, `public/images/hero/placeholder-*.webp`, `public/images/sobre-nosotros/placeholder-team.webp`

**Interfaces:**
- Produces: the exact file paths referenced by `content/projects.ts` (Task 4) and the Hero/SobreEmePreview sections (Tasks 18, 20).

- [ ] **Step 1: Add the sharp dependency for WebP conversion**

```bash
npm install -D sharp
```

- [ ] **Step 2: Write `scripts/fetch-placeholder-images.mjs`**

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MANIFEST = [
  { id: '1519741497674-611481863552', out: 'trabajos/clara-y-manuel/placeholder-cover' },
  { id: '1519225421980-715cb0215aed', out: 'trabajos/clara-y-manuel/placeholder-01' },
  { id: '1511285560929-80b456fea0bc', out: 'trabajos/clara-y-manuel/placeholder-02' },
  { id: '1465495976277-4387d4b0b4c6', out: 'trabajos/clara-y-manuel/placeholder-03' },
  { id: '1550005809-91ad75fb315f', out: 'trabajos/lucia-y-jorge/placeholder-cover' },
  { id: '1478720568477-152d9b164e26', out: 'trabajos/lucia-y-jorge/placeholder-01' },
  { id: '1606216794074-735e91aa2c92', out: 'trabajos/lucia-y-jorge/placeholder-02' },
  { id: '1583939003579-730e3918a45a', out: 'trabajos/lucia-y-jorge/placeholder-03' },
  { id: '1520854221256-17451cc331bf', out: 'trabajos/boda-elena-y-pablo-video/placeholder-01' },
  { id: '1519167758481-83f29c8b1d6d', out: 'trabajos/gala-empresa-fotomaton-360/placeholder-cover' },
  { id: '1492684223066-81342ee5ff30', out: 'trabajos/gala-empresa-fotomaton-360/placeholder-01' },
  { id: '1470309864661-68328b2cd0a5', out: 'hero/placeholder-hero-01' },
  { id: '1521572163474-6864f9cf17ab', out: 'hero/placeholder-hero-02' },
  { id: '1494790108377-be9c29b29330', out: 'sobre-nosotros/placeholder-team' },
];

async function downloadAndConvert({ id, out }) {
  const url = `https://images.unsplash.com/photo-${id}?q=80&w=2000&auto=format`;
  const destPath = path.join('public/images', `${out}.webp`);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`SKIP ${id}: HTTP ${res.status}`);
    return false;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await sharp(buffer).webp({ quality: 82 }).toFile(destPath);
  console.log(`OK ${destPath}`);
  return true;
}

const results = await Promise.all(MANIFEST.map(downloadAndConvert));
const okCount = results.filter(Boolean).length;
console.log(`\n${okCount}/${MANIFEST.length} images downloaded.`);
if (okCount < MANIFEST.length * 0.7) {
  console.error('Too many failures — refresh the photo IDs in MANIFEST (search unsplash.com for replacements) and re-run.');
  process.exit(1);
}
```

- [ ] **Step 3: Run the script**

Run: `node scripts/fetch-placeholder-images.mjs`
Expected: at least 70% of the 14 manifest entries download successfully (log line `"N/14 images downloaded."` with N ≥ 10). If any entries were skipped, replace their `id` with a fresh Unsplash photo ID (search unsplash.com for "wedding editorial", "bride groom", or "corporate gala photo booth" depending on the folder) and re-run until the threshold is met.

- [ ] **Step 4: Add `.gitignore` entry and commit the script + downloaded assets**

```bash
git add scripts/fetch-placeholder-images.mjs public/images package.json package-lock.json
git commit -m "feat: add placeholder image acquisition script and downloaded assets"
```

---

### Task 8: Placeholder video assets and poster frames

**Files:**
- Create: `scripts/fetch-placeholder-videos.mjs`
- Creates at runtime: `public/videos/previews/placeholder-*.mp4`, `public/videos/posters/placeholder-*.webp`

**Interfaces:**
- Produces: the exact file paths referenced by the two video-bearing entries in `content/projects.ts` (Task 4).

- [ ] **Step 1: Find 3 current CC0 video URLs**

Use WebSearch/WebFetch against Pexels (`https://www.pexels.com/search/videos/wedding/`) and Coverr (`https://coverr.co/search?q=wedding`) to find 3 short (10-20s) CC0 clips: one romantic wedding couple clip, one first-dance/reception clip, and one slow-motion party/corporate-event clip suited to the "Gala — 360°" project. Open each result page and copy its direct `.mp4` download URL (Pexels exposes this on the video's detail page; it is stable once published, unlike the deprecated `source.unsplash.com`-style redirectors).

- [ ] **Step 2: Write `scripts/fetch-placeholder-videos.mjs`** with the 3 URLs found in Step 1 filled into `MANIFEST`

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const MANIFEST = [
  { url: 'REPLACE_WITH_URL_FROM_STEP_1_COUPLE', out: 'placeholder-elena-pablo-preview' },
  { url: 'REPLACE_WITH_URL_FROM_STEP_1_RECEPTION', out: 'placeholder-elena-pablo-full' },
  { url: 'REPLACE_WITH_URL_FROM_STEP_1_EVENT', out: 'placeholder-gala-360-preview' },
];

async function downloadAndPoster({ url, out }) {
  await fs.mkdir('public/videos/previews', { recursive: true });
  await fs.mkdir('public/videos/posters', { recursive: true });
  const mp4Path = path.join('public/videos/previews', `${out}.mp4`);
  const posterPath = path.join('public/videos/posters', `${out.replace('-preview', '').replace('-full', '')}.webp`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  await fs.writeFile(mp4Path, Buffer.from(await res.arrayBuffer()));

  await run('ffmpeg', ['-y', '-i', mp4Path, '-frames:v', '1', '-vf', 'scale=1600:-1', posterPath.replace('.webp', '.png')]);
  await run('ffmpeg', ['-y', '-i', posterPath.replace('.webp', '.png'), posterPath]);
  await fs.unlink(posterPath.replace('.webp', '.png'));

  console.log(`OK ${mp4Path} + ${posterPath}`);
}

for (const entry of MANIFEST) {
  if (entry.url.startsWith('REPLACE_WITH')) {
    console.error(`Fill in the real URL for "${entry.out}" from Step 1 before running.`);
    process.exit(1);
  }
}

await Promise.all(MANIFEST.map(downloadAndPoster));
```

- [ ] **Step 3: Run the script**

Run: `node scripts/fetch-placeholder-videos.mjs`
Expected: 3 `.mp4` files in `public/videos/previews/` and 3 matching `.webp` posters in `public/videos/posters/`. Requires `ffmpeg` on PATH (`brew install ffmpeg` if missing).

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-placeholder-videos.mjs public/videos
git commit -m "feat: add placeholder video acquisition script and downloaded assets"
```

---

### Task 9: Root layout, skip link, and base metadata

**Files:**
- Modify: `app/layout.tsx`
- Test: `app/layout.test.tsx`

**Interfaces:**
- Consumes: `site` (Task 3).
- Produces: the `<html>`/`<body>` shell every page renders inside, including the `#main-content` landmark id that Header's skip link (Task 10) targets.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

describe('RootLayout', () => {
  it('renders a skip link targeting #main-content', () => {
    render(<RootLayout><div id="main-content">contenido</div></RootLayout>, { container: document.documentElement });
    const skipLink = screen.getByText('Saltar al contenido');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- app/layout.test.tsx`
Expected: FAIL — no skip link text present yet.

- [ ] **Step 3: Implement `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import { site } from '@/content/site';
import '@/styles/globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif-loaded', display: 'swap' });

export const metadata: Metadata = {
  title: { default: site.brandName, template: `%s — ${site.brandName}` },
  description: 'Fotografía y vídeo de bodas y eventos en Sevilla. Fotomatón y experiencia 360°.',
  metadataBase: new URL('https://www.emefotografiasevilla.es'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fraunces.variable}>
      <body>
        <a href="#main-content" className="skip-link">Saltar al contenido</a>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- app/layout.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add root layout with skip link and base metadata"
```

---

### Task 10: Header, Nav, and MobileMenu

**Files:**
- Create: `components/layout/Header.tsx`, `components/layout/Header.module.css`
- Create: `components/layout/MobileMenu.tsx`, `components/layout/MobileMenu.module.css`
- Test: `components/layout/Header.test.tsx`, `components/layout/MobileMenu.test.tsx`
- Modify: `app/layout.tsx` (mount `<Header />` before `<main id="main-content">`)

**Interfaces:**
- Produces: `<Header />` — mounted once in `app/layout.tsx`, consumed by no other component.

- [ ] **Step 1: Write the failing test for MobileMenu**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileMenu } from './MobileMenu';

describe('MobileMenu', () => {
  it('opens on button click and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MobileMenu isOpen onClose={onClose} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/layout/MobileMenu.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/layout/MobileMenu.tsx`**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './MobileMenu.module.css';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    panelRef.current?.querySelector('a')?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} ref={panelRef}>
      <nav aria-label="Menú principal">
        <ul className={styles.list}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={onClose}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
```

```css
.overlay {
  position: fixed;
  inset: 0;
  background: var(--color-ink);
  color: var(--color-paper);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-family: var(--font-serif);
  font-size: var(--type-h3);
  text-align: center;
}
```

- [ ] **Step 4: Run the MobileMenu test to verify it passes**

Run: `npm test -- components/layout/MobileMenu.test.tsx`
Expected: PASS.

- [ ] **Step 5: Write the failing test for Header**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the brand name and primary nav links', () => {
    render(<Header />);
    expect(screen.getByText('EME Fotografía Sevilla')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trabajos' })).toHaveAttribute('href', '/trabajos');
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- components/layout/Header.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement `components/layout/Header.tsx`**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { site } from '@/content/site';
import { MobileMenu } from './MobileMenu';
import styles from './Header.module.css';

const LINKS = [
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>{site.brandName}</Link>
      <nav className={styles.desktopNav} aria-label="Navegación principal">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>
      <button
        className={styles.menuButton}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? 'Cerrar' : 'Menú'}
      </button>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
```

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  mix-blend-mode: difference;
  color: var(--color-paper);
}
.brand { font-family: var(--font-serif); font-weight: 500; }
.desktopNav { display: none; gap: var(--space-3); }
.menuButton { background: none; border: none; color: inherit; font: inherit; cursor: pointer; }

@media (min-width: 768px) {
  .desktopNav { display: flex; }
  .menuButton { display: none; }
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npm test -- components/layout/Header.test.tsx`
Expected: PASS.

- [ ] **Step 9: Mount `<Header />` in `app/layout.tsx`**, wrapping children in `<main id="main-content">`:

```tsx
import { Header } from '@/components/layout/Header';
// ...inside <body>:
<a href="#main-content" className="skip-link">Saltar al contenido</a>
<Header />
<main id="main-content">{children}</main>
```

- [ ] **Step 10: Verify the full build**

Run: `npm run build && npm test`
Expected: both succeed.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add Header, MobileMenu, and mount in root layout"
```

---

### Task 11: Footer with togglable placeholder notice

**Files:**
- Create: `components/layout/Footer.tsx`, `components/layout/Footer.module.css`
- Test: `components/layout/Footer.test.tsx`
- Modify: `app/layout.tsx` (mount `<Footer />` after `<main>`)

**Interfaces:**
- Consumes: `site` (Task 3).
- Produces: `<Footer />` mounted once in `app/layout.tsx`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE;
  afterEach(() => { process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = ORIGINAL_ENV; });

  it('shows the placeholder notice when the flag is on', () => {
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'true';
    render(<Footer />);
    expect(screen.getByText(/contenido de muestra/i)).toBeInTheDocument();
  });

  it('hides the placeholder notice when the flag is off', () => {
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'false';
    render(<Footer />);
    expect(screen.queryByText(/contenido de muestra/i)).not.toBeInTheDocument();
  });

  it('links to the real Instagram and Facebook accounts', () => {
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE = 'false';
    render(<Footer />);
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('href', expect.stringContaining('instagram.com'));
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/layout/Footer.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/layout/Footer.tsx`**

```tsx
import { site } from '@/content/site';
import styles from './Footer.module.css';

export function Footer() {
  const showPlaceholderNotice = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE === 'true';

  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <span>{site.brandName} — {site.legalCity}</span>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </div>
      <div className={styles.row}>
        <a href={site.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
        <a href={site.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
      </div>
      {showPlaceholderNotice && (
        <p className={styles.notice}>Contenido de muestra — pendiente de sustitución por trabajo real de {site.brandName}.</p>
      )}
    </footer>
  );
}
```

```css
.footer {
  padding: var(--space-4) var(--space-3);
  border-top: 1px solid var(--color-muted);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.notice { color: var(--color-muted); font-size: 0.85rem; }
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/layout/Footer.test.tsx`
Expected: PASS.

- [ ] **Step 5: Mount in `app/layout.tsx`** after `</main>`, and set the default env flag in `.env.local` (`NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE=true`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Footer with togglable placeholder-content notice"
```

---

### Task 12: SmoothScrollProvider (Lenis)

**Files:**
- Create: `components/motion/SmoothScrollProvider.tsx`
- Test: `components/motion/SmoothScrollProvider.test.tsx`
- Modify: `app/layout.tsx` (wrap `children` in `<SmoothScrollProvider>`)

**Interfaces:**
- Consumes: `useReducedMotion` (Task 6).
- Produces: `<SmoothScrollProvider>` wrapping the whole app; no other component talks to Lenis directly.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SmoothScrollProvider } from './SmoothScrollProvider';

const lenisInstances: any[] = [];
vi.mock('lenis', () => ({
  default: vi.fn().mockImplementation(() => {
    const instance = { raf: vi.fn(), destroy: vi.fn() };
    lenisInstances.push(instance);
    return instance;
  }),
}));

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

afterEach(() => { lenisInstances.length = 0; vi.clearAllMocks(); });

describe('SmoothScrollProvider', () => {
  it('initializes Lenis when motion is not reduced', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<SmoothScrollProvider><div>contenido</div></SmoothScrollProvider>);
    expect(lenisInstances.length).toBe(1);
  });

  it('does not initialize Lenis when motion is reduced', () => {
    (useReducedMotion as any).mockReturnValue(true);
    render(<SmoothScrollProvider><div>contenido</div></SmoothScrollProvider>);
    expect(lenisInstances.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/motion/SmoothScrollProvider.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/motion/SmoothScrollProvider.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/motion/SmoothScrollProvider.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wrap children in `app/layout.tsx`**

```tsx
<SmoothScrollProvider>
  <a href="#main-content" className="skip-link">Saltar al contenido</a>
  <Header />
  <main id="main-content">{children}</main>
  <Footer />
</SmoothScrollProvider>
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Lenis-based SmoothScrollProvider respecting reduced motion"
```

---

### Task 13: Custom Cursor

**Files:**
- Create: `components/motion/Cursor.tsx`, `components/motion/Cursor.module.css`
- Test: `components/motion/Cursor.test.tsx`
- Modify: `app/layout.tsx` (mount `<Cursor />`)

**Interfaces:**
- Consumes: `useReducedMotion` (Task 6).
- Produces: a global `<Cursor />`; other components opt in via `data-cursor="ver" | "reproducir" | "arrastrar"` on any element.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Cursor } from './Cursor';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));

function mockPointerFine() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('pointer: fine'),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('Cursor', () => {
  it('shows the hovered label when entering a data-cursor target', () => {
    mockPointerFine();
    render(
      <>
        <Cursor />
        <button data-cursor="ver">Ver proyecto</button>
      </>
    );
    fireEvent.mouseOver(screen.getByText('Ver proyecto'));
    expect(screen.getByTestId('cursor-label')).toHaveTextContent('VER');
  });

  it('does not render on coarse pointers (touch)', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('pointer: coarse'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Cursor />);
    expect(screen.queryByTestId('cursor-label')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/motion/Cursor.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/motion/Cursor.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import styles from './Cursor.module.css';

const LABELS: Record<string, string> = { ver: 'VER', reproducir: 'REPRODUCIR', arrastrar: 'ARRASTRAR' };

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-cursor]');
      setLabel(target ? LABELS[target.getAttribute('data-cursor') ?? ''] ?? null : null);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={styles.cursor} style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} aria-hidden="true">
      {label && <span data-testid="cursor-label" className={styles.label}>{label}</span>}
    </div>
  );
}
```

```css
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  width: 0;
  height: 0;
}
.label {
  display: block;
  transform: translate(-50%, -50%);
  background: var(--color-accent);
  color: var(--color-paper);
  border-radius: 999px;
  padding: var(--space-1) var(--space-2);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
```

Note: the test fires `mouseOver` (not `mouseEnter`) because `mouseenter` does not bubble and would never reach the `document.addEventListener('mouseover', ...)` delegation above — `mouseover` does bubble, which is why the component listens for it.

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/motion/Cursor.test.tsx`
Expected: PASS.

- [ ] **Step 5: Mount `<Cursor />` once in `app/layout.tsx`** (inside `SmoothScrollProvider`, before `<Header />`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add custom desktop cursor with contextual labels"
```

---

### Task 14: ScrollReveal (GSAP ScrollTrigger wrapper)

**Files:**
- Create: `components/motion/ScrollReveal.tsx`
- Test: `components/motion/ScrollReveal.test.tsx`

**Interfaces:**
- Consumes: `useReducedMotion` (Task 6), `motion` tokens (Task 5).
- Produces: `<ScrollReveal>` — used by Manifiesto, SelectedWork, ServiciosPreview, SobreEmePreview, Confianza, Testimonios (Tasks 19–21) to wrap any content that should reveal on scroll.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollReveal } from './ScrollReveal';

const gsapTo = vi.fn();
vi.mock('gsap', () => ({ gsap: { to: gsapTo, registerPlugin: vi.fn() } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

afterEach(() => vi.clearAllMocks());

describe('ScrollReveal', () => {
  it('always renders children in the DOM (progressive enhancement)', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollReveal><p>Contenido visible</p></ScrollReveal>);
    expect(screen.getByText('Contenido visible')).toBeInTheDocument();
  });

  it('skips animation setup when motion is reduced', () => {
    (useReducedMotion as any).mockReturnValue(true);
    render(<ScrollReveal><p>Contenido</p></ScrollReveal>);
    expect(gsapTo).not.toHaveBeenCalled();
  });

  it('sets up a GSAP animation when motion is not reduced', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<ScrollReveal><p>Contenido</p></ScrollReveal>);
    expect(gsapTo).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/motion/ScrollReveal.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/motion/ScrollReveal.tsx`**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.set(ref.current, { opacity: 0, y: 40 });
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        duration: motion.duration.slow,
        ease: motion.ease.standard,
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      });
    }, ref);
    return () => ctx.revert();
  }, [reducedMotion]);

  return <div ref={ref} className={className}>{children}</div>;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/motion/ScrollReveal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ScrollReveal GSAP wrapper respecting reduced motion"
```

---

### Task 15: VideoPreview (autoplay-on-intersect component)

**Files:**
- Create: `components/motion/VideoPreview.tsx`, `components/motion/VideoPreview.module.css`
- Test: `components/motion/VideoPreview.test.tsx`

**Interfaces:**
- Consumes: `useReducedMotion` (Task 6), `ProjectMedia` type (Task 4).
- Produces: `<VideoPreview media={ProjectMedia} onOpenFull={() => void}>` — used by SelectedWork (Task 19) and the project detail page (Task 23).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPreview } from './VideoPreview';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn() }));
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

let intersectCallback: IntersectionObserverCallback;
beforeEach(() => {
  (window as any).IntersectionObserver = vi.fn().mockImplementation((cb) => {
    intersectCallback = cb;
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  });
  (window.HTMLMediaElement.prototype as any).play = vi.fn().mockResolvedValue(undefined);
  (window.HTMLMediaElement.prototype as any).pause = vi.fn();
});

const media = { type: 'video' as const, src: '/videos/previews/x.mp4', poster: '/videos/posters/x.webp', alt: 'Vista previa', isPlaceholderMedia: true };

describe('VideoPreview', () => {
  it('plays when it enters the viewport', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<VideoPreview media={media} onOpenFull={() => {}} />);
    intersectCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('pauses when it leaves the viewport', () => {
    (useReducedMotion as any).mockReturnValue(false);
    render(<VideoPreview media={media} onOpenFull={() => {}} />);
    intersectCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('never autoplays and shows an explicit play button when motion is reduced', () => {
    (useReducedMotion as any).mockReturnValue(true);
    render(<VideoPreview media={media} onOpenFull={() => {}} />);
    intersectCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /reproducir/i })).toBeInTheDocument();
  });

  it('calls onOpenFull when the play button is clicked', () => {
    (useReducedMotion as any).mockReturnValue(true);
    const onOpenFull = vi.fn();
    render(<VideoPreview media={media} onOpenFull={onOpenFull} />);
    fireEvent.click(screen.getByRole('button', { name: /reproducir/i }));
    expect(onOpenFull).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/motion/VideoPreview.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/motion/VideoPreview.tsx`**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import type { ProjectMedia } from '@/content/types';
import styles from './VideoPreview.module.css';

export function VideoPreview({ media, onOpenFull }: { media: ProjectMedia; onOpenFull: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !videoRef.current) return;
    const el = videoRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div className={styles.wrapper} data-cursor="reproducir" onClick={onOpenFull}>
      <video
        ref={videoRef}
        src={media.src}
        poster={media.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
      />
      {reducedMotion && (
        <button type="button" className={styles.playButton} onClick={onOpenFull} aria-label="Reproducir vídeo">
          Reproducir
        </button>
      )}
    </div>
  );
}
```

```css
.wrapper { position: relative; cursor: pointer; }
.wrapper video { width: 100%; height: 100%; object-fit: cover; }
.playButton {
  position: absolute;
  inset: 0;
  margin: auto;
  width: fit-content;
  height: fit-content;
  background: var(--color-paper);
  color: var(--color-ink);
  border: none;
  border-radius: 999px;
  padding: var(--space-1) var(--space-3);
  cursor: pointer;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/motion/VideoPreview.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add VideoPreview with intersection-based autoplay and reduced-motion fallback"
```

---

### Task 16: Lightbox modal for full video/gallery pieces

**Files:**
- Create: `components/motion/Lightbox.tsx`, `components/motion/Lightbox.module.css`
- Test: `components/motion/Lightbox.test.tsx`

**Interfaces:**
- Produces: `<Lightbox isOpen onClose>{children}</Lightbox>` — used by the project detail page (Task 23) to open `VideoPreview`'s full piece.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from './Lightbox';

describe('Lightbox', () => {
  it('renders children only when open', () => {
    const { rerender } = render(<Lightbox isOpen={false} onClose={() => {}}><p>Pieza completa</p></Lightbox>);
    expect(screen.queryByText('Pieza completa')).not.toBeInTheDocument();
    rerender(<Lightbox isOpen onClose={() => {}}><p>Pieza completa</p></Lightbox>);
    expect(screen.getByText('Pieza completa')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Lightbox isOpen onClose={onClose}><p>Contenido</p></Lightbox>);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on backdrop click but not on content click', () => {
    const onClose = vi.fn();
    render(<Lightbox isOpen onClose={onClose}><p>Contenido</p></Lightbox>);
    fireEvent.click(screen.getByText('Contenido'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('lightbox-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/motion/Lightbox.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/motion/Lightbox.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import styles from './Lightbox.module.css';

export function Lightbox({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} data-testid="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

```css
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(31, 38, 46, 0.92);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
}
.content { max-width: 1200px; width: 100%; }
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/motion/Lightbox.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add accessible Lightbox modal"
```

---

### Task 17: PageTransition wrapper

**Files:**
- Create: `components/motion/PageTransition.tsx`
- Test: `components/motion/PageTransition.test.tsx`

**Interfaces:**
- Produces: `withPageTransition(navigate: () => void)` helper used by `Link`/`router.push` call sites that want an explicit transition (project-to-project navigation in Task 23).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { withPageTransition } from './PageTransition';

afterEach(() => { delete (document as any).startViewTransition; vi.clearAllMocks(); });

describe('withPageTransition', () => {
  it('uses the native View Transitions API when available', () => {
    const startViewTransition = vi.fn((cb: () => void) => { cb(); return { finished: Promise.resolve() }; });
    (document as any).startViewTransition = startViewTransition;
    const navigate = vi.fn();
    withPageTransition(navigate);
    expect(startViewTransition).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalled();
  });

  it('falls back to calling navigate directly when unsupported', () => {
    const navigate = vi.fn();
    withPageTransition(navigate);
    expect(navigate).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/motion/PageTransition.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/motion/PageTransition.tsx`**

```ts
export function withPageTransition(navigate: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(navigate);
  } else {
    navigate();
  }
}
```

- [ ] **Step 4: Add the CSS transition timing in `styles/globals.css`**

```css
::view-transition-old(root), ::view-transition-new(root) {
  animation-duration: var(--duration-fast);
}

/* The reset.css `*` reduced-motion rule doesn't reach ::view-transition-*
   pseudo-elements (they aren't matched by `*`), so they need their own
   override here. */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none !important;
  }
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- components/motion/PageTransition.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add View Transitions API wrapper with graceful fallback"
```

---

### Task 18: Hero section with once-per-session intro

**Files:**
- Create: `components/sections/Hero.tsx`, `components/sections/Hero.module.css`
- Test: `components/sections/Hero.test.tsx`

**Interfaces:**
- Consumes: `site` (Task 3).
- Produces: `<Hero />` — mounted first in the Home page (Task 21).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  beforeEach(() => sessionStorage.clear());

  it('shows the intro sequence on first visit', () => {
    render(<Hero />);
    expect(screen.getByTestId('intro-sequence')).toBeInTheDocument();
  });

  it('skips the intro sequence on a later mount within the same session', () => {
    sessionStorage.setItem('eme-intro-shown', 'true');
    render(<Hero />);
    expect(screen.queryByTestId('intro-sequence')).not.toBeInTheDocument();
  });

  it('always renders the hero headline communicating who/what/why', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/EME Fotografía Sevilla/i);
    expect(screen.getByText(/bodas/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/sections/Hero.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/sections/Hero.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Hero.module.css';

const INTRO_KEY = 'eme-intro-shown';

export function Hero() {
  const [showIntro, setShowIntro] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(INTRO_KEY) === 'true';
    if (alreadyShown) return;
    if (reducedMotion) {
      // No flash-screen under reduced motion — mark it shown and skip straight to content.
      sessionStorage.setItem(INTRO_KEY, 'true');
      return;
    }
    setShowIntro(true);
    const timer = setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem(INTRO_KEY, 'true');
    }, 1400);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <section className={styles.hero}>
      {showIntro && (
        <div data-testid="intro-sequence" className={styles.intro}>
          <span className={styles.introMark}>eme</span>
        </div>
      )}
      <Image
        src="/images/hero/placeholder-hero-01.webp"
        alt="Pareja de novios en un momento espontáneo, fotografía editorial de boda"
        fill
        priority
        className={styles.image}
      />
      <div className={styles.content}>
        <h1>{site.brandName}</h1>
        <p>Fotografía y vídeo de bodas y eventos en {site.legalCity}, con la mirada de un editorial de moda.</p>
      </div>
    </section>
  );
}
```

```css
.hero { position: relative; min-height: 100svh; display: flex; align-items: flex-end; }
.image { object-fit: cover; z-index: -1; }
.content { padding: var(--space-4) var(--space-3); color: var(--color-paper); }
.content h1 { font-family: var(--font-serif); font-size: var(--type-h1); line-height: 0.95; }
.intro {
  position: fixed;
  inset: 0;
  background: var(--color-ink);
  color: var(--color-paper);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: var(--type-h1);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/sections/Hero.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Hero section with once-per-session intro sequence"
```

---

### Task 19: `useProjectFilter` hook + SelectedWork section

**Files:**
- Create: `lib/hooks/useProjectFilter.ts`, `components/sections/SelectedWork.tsx`, `components/sections/SelectedWork.module.css`
- Test: `lib/hooks/useProjectFilter.test.ts`, `components/sections/SelectedWork.test.tsx`

**Interfaces:**
- Consumes: `projects` (Task 4), `VideoPreview`/`Lightbox` (Tasks 15–16), `ScrollReveal` (Task 14).
- Produces: `useProjectFilter(projects, category)` — reused by the `/trabajos` listing page (Task 22). `<SelectedWork />` — mounted in Home (Task 21).

- [ ] **Step 1: Write the failing test for the hook**

```ts
import { describe, it, expect } from 'vitest';
import { useProjectFilter } from './useProjectFilter';
import { renderHook, act } from '@testing-library/react';
import { projects } from '@/content/projects';

describe('useProjectFilter', () => {
  it('defaults to showing all projects', () => {
    const { result } = renderHook(() => useProjectFilter(projects));
    expect(result.current.filtered).toHaveLength(projects.length);
  });

  it('filters by category', () => {
    const { result } = renderHook(() => useProjectFilter(projects));
    act(() => result.current.setCategory('video'));
    expect(result.current.filtered.every((p) => p.category === 'video')).toBe(true);
    expect(result.current.filtered.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- lib/hooks/useProjectFilter.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `lib/hooks/useProjectFilter.ts`**

```ts
import { useMemo, useState } from 'react';
import type { Project, ProjectCategory } from '@/content/types';

export function useProjectFilter(projects: Project[]) {
  const [category, setCategory] = useState<ProjectCategory | 'todos'>('todos');
  const filtered = useMemo(
    () => (category === 'todos' ? projects : projects.filter((p) => p.category === category)),
    [projects, category]
  );
  return { category, setCategory, filtered };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- lib/hooks/useProjectFilter.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing test for SelectedWork**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SelectedWork } from './SelectedWork';

describe('SelectedWork', () => {
  it('renders a card for each seed project with a link to its detail page', () => {
    render(<SelectedWork />);
    expect(screen.getByRole('link', { name: /Clara y Manuel/i })).toHaveAttribute('href', '/trabajos/clara-y-manuel');
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- components/sections/SelectedWork.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement `components/sections/SelectedWork.tsx`**

Video-cover projects must use the real `VideoPreview`/`Lightbox` components (Tasks 15–16) — a static poster image would silently drop the autoplay-preview behavior those tasks exist for and break parity between the photo and video disciplines the spec calls for.

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/content/projects';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { VideoPreview } from '@/components/motion/VideoPreview';
import { Lightbox } from '@/components/motion/Lightbox';
import styles from './SelectedWork.module.css';

export function SelectedWork() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openProject = projects.find((p) => p.slug === openSlug) ?? null;

  return (
    <section className={styles.section} aria-labelledby="selected-work-heading">
      <h2 id="selected-work-heading">Trabajos seleccionados</h2>
      <div className={styles.grid}>
        {projects.map((project) => (
          <ScrollReveal key={project.slug} className={styles.card}>
            {project.cover.type === 'image' ? (
              <Link href={`/trabajos/${project.slug}`} aria-label={project.title} data-cursor="ver">
                <Image src={project.cover.src} alt={project.cover.alt} width={800} height={1000} />
                <span className={styles.title}>{project.title}</span>
              </Link>
            ) : (
              <div>
                <VideoPreview media={project.cover} onOpenFull={() => setOpenSlug(project.slug)} />
                <Link href={`/trabajos/${project.slug}`} className={styles.title} data-cursor="ver">{project.title}</Link>
              </div>
            )}
          </ScrollReveal>
        ))}
      </div>
      <Lightbox isOpen={!!openProject} onClose={() => setOpenSlug(null)}>
        {openProject?.cover.type === 'video' && (
          <video src={openProject.cover.src} controls autoPlay poster={openProject.cover.poster} aria-label={openProject.cover.alt} />
        )}
      </Lightbox>
    </section>
  );
}
```

```css
.section { padding: var(--space-5) var(--space-3); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); }
.card { position: relative; }
.title { display: block; margin-top: var(--space-1); font-family: var(--font-serif); }
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npm test -- components/sections/SelectedWork.test.tsx`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add useProjectFilter hook and SelectedWork section"
```

---

### Task 20: ServiciosPreview, SobreEmePreview, and Confianza (animated stats)

**Files:**
- Create: `components/sections/ServiciosPreview.tsx`, `components/sections/SobreEmePreview.tsx`, `components/sections/Confianza.tsx`, `components/sections/Confianza.module.css`
- Test: `components/sections/Confianza.test.tsx`

**Interfaces:**
- Consumes: `services` (Task 4), `site` (Task 3), `ScrollReveal` (Task 14).
- Produces: three sections mounted in Home (Task 21).

- [ ] **Step 1: Write the failing test for Confianza's counter**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Confianza } from './Confianza';

describe('Confianza', () => {
  it('renders the real community numbers as the animated targets', () => {
    vi.useFakeTimers();
    render(<Confianza />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('2320')).toBeInTheDocument();
    expect(screen.getByText('1622')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/sections/Confianza.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/sections/Confianza.tsx`** (counts up over 1.5s using `setInterval`, settles on the exact real value)

```tsx
'use client';
import { useEffect, useState } from 'react';
import { site } from '@/content/site';
import styles from './Confianza.module.css';

function useCountUp(target: number, durationMs = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 30;
    const stepMs = durationMs / steps;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setValue(Math.round((current / steps) * target));
      if (current >= steps) clearInterval(id);
    }, stepMs);
    return () => clearInterval(id);
  }, [target, durationMs]);
  return value;
}

export function Confianza() {
  const fb = useCountUp(site.facebookLikes);
  const ig = useCountUp(site.instagramFollowers);
  return (
    <section className={styles.section} aria-label="Confianza de la comunidad">
      <div>
        <span className={styles.number}>{fb}</span>
        <span>me gusta en Facebook</span>
      </div>
      <div>
        <span className={styles.number}>{ig}</span>
        <span>seguidores en Instagram</span>
      </div>
    </section>
  );
}
```

```css
.section { display: flex; gap: var(--space-4); justify-content: center; padding: var(--space-5) var(--space-3); text-align: center; }
.number { display: block; font-family: var(--font-serif); font-size: var(--type-h2); }
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/sections/Confianza.test.tsx`
Expected: PASS.

- [ ] **Step 5: Implement `components/sections/ServiciosPreview.tsx`** (no new test — pure presentational read of `services`, covered by the `/servicios` page test in Task 24)

```tsx
import Link from 'next/link';
import { services } from '@/content/services';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export function ServiciosPreview() {
  return (
    <section aria-labelledby="servicios-heading">
      <h2 id="servicios-heading">Servicios</h2>
      <ul>
        {services.map((service) => (
          <ScrollReveal key={service.slug}>
            <li>
              <Link href={`/servicios#${service.slug}`}>{service.name}</Link>
              <p>{service.tagline}</p>
            </li>
          </ScrollReveal>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 6: Implement `components/sections/SobreEmePreview.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/content/site';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export function SobreEmePreview() {
  return (
    <ScrollReveal>
      <section aria-labelledby="sobre-heading">
        <Image src="/images/sobre-nosotros/placeholder-team.webp" alt="Equipo de EME Fotografía Sevilla" width={800} height={1000} />
        <h2 id="sobre-heading">Sobre {site.brandName}</h2>
        <p>Un estudio de fotografía y vídeo en {site.legalCity} que trata cada boda y cada evento como una historia editorial, no como un simple reportaje.</p>
        <Link href="/sobre-nosotros">Conocer el estudio</Link>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add ServiciosPreview, SobreEmePreview, and Confianza sections"
```

---

### Task 21: Testimonios, CTA/Contacto preview, and assembled Home page

**Files:**
- Create: `components/sections/Testimonios.tsx`, `components/sections/CtaContacto.tsx`
- Modify: `app/page.tsx`
- Test: `app/page.test.tsx`

**Interfaces:**
- Consumes: `testimonials` (Task 4), all sections from Tasks 18–20.
- Produces: the assembled `/` route.

- [ ] **Step 1: Implement `components/sections/Testimonios.tsx`**

```tsx
import { testimonials } from '@/content/testimonials';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export function Testimonios() {
  return (
    <section aria-labelledby="testimonios-heading">
      <h2 id="testimonios-heading">Lo que dicen de nosotros</h2>
      {testimonials.map((t) => (
        <ScrollReveal key={t.id}>
          <blockquote>
            <p>“{t.quote}”</p>
            <cite>{t.author} — {t.role}</cite>
          </blockquote>
        </ScrollReveal>
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Implement `components/sections/CtaContacto.tsx`**

```tsx
import Link from 'next/link';

export function CtaContacto() {
  return (
    <section aria-labelledby="cta-heading">
      <h2 id="cta-heading">¿Celebras algo importante?</h2>
      <p>Cuéntanos tu fecha y hagamos que se recuerde.</p>
      <Link href="/contacto" data-cursor="ver">Empezar un proyecto</Link>
    </section>
  );
}
```

- [ ] **Step 3: Write the failing test for the Home page**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

describe('Home page', () => {
  it('renders every narrative section in order', () => {
    render(<Page />);
    const headingTexts = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headingTexts).toEqual([
      'Trabajos seleccionados',
      'Servicios',
      `Sobre EME Fotografía Sevilla`,
      'Lo que dicen de nosotros',
      '¿Celebras algo importante?',
    ]);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npm test -- app/page.test.tsx`
Expected: FAIL — `app/page.tsx` still has the Task 1 placeholder content.

- [ ] **Step 5: Implement `app/page.tsx`**

```tsx
import { Hero } from '@/components/sections/Hero';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { ServiciosPreview } from '@/components/sections/ServiciosPreview';
import { SobreEmePreview } from '@/components/sections/SobreEmePreview';
import { Confianza } from '@/components/sections/Confianza';
import { Testimonios } from '@/components/sections/Testimonios';
import { CtaContacto } from '@/components/sections/CtaContacto';

export default function Page() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <ServiciosPreview />
      <SobreEmePreview />
      <Confianza />
      <Testimonios />
      <CtaContacto />
    </>
  );
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `npm test -- app/page.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: assemble Home page from all narrative sections"
```

---

### Task 22: `/trabajos` listing page

**Files:**
- Create: `app/trabajos/page.tsx`
- Test: `app/trabajos/page.test.tsx`

**Interfaces:**
- Consumes: `projects` (Task 4), `useProjectFilter` (Task 19).
- Produces: the `/trabajos` route.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from './page';

describe('/trabajos page', () => {
  it('lists all 4 seed projects by default', () => {
    render(<Page />);
    expect(screen.getAllByRole('link', { name: /ver proyecto/i })).toHaveLength(4);
  });

  it('filters by category on tab click', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('button', { name: /^vídeo$/i }));
    expect(screen.getAllByRole('link', { name: /ver proyecto/i })).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- app/trabajos/page.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `app/trabajos/page.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { projects } from '@/content/projects';
import { useProjectFilter } from '@/lib/hooks/useProjectFilter';

const CATEGORIES: Array<{ value: 'todos' | 'boda' | 'video' | 'fotomaton' | '360'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'boda', label: 'Bodas' },
  { value: 'video', label: 'Vídeo' },
  { value: 'fotomaton', label: 'Fotomatón' },
  { value: '360', label: '360°' },
];

export default function Page() {
  const { category, setCategory, filtered } = useProjectFilter(projects);

  return (
    <div>
      <h1>Trabajos</h1>
      <div role="tablist" aria-label="Filtrar trabajos por categoría">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            role="tab"
            aria-selected={category === c.value}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul>
        {filtered.map((project) => (
          <li key={project.slug}>
            <Link href={`/trabajos/${project.slug}`} aria-label={`Ver proyecto ${project.title}`}>
              {project.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- app/trabajos/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add filterable /trabajos listing page"
```

---

### Task 23: `/trabajos/[slug]` project detail page

**Files:**
- Create: `app/trabajos/[slug]/page.tsx`, `components/sections/ProjectGallery.tsx`
- Test: `app/trabajos/[slug]/page.test.tsx`, `components/sections/ProjectGallery.test.tsx`

**Interfaces:**
- Consumes: `projects` (Task 4), `VideoPreview` (Task 15), `Lightbox` (Task 16).
- Produces: 4 static routes at build time via `generateStaticParams`; `<ProjectGallery project={project} />` — reused as-is when Task 28 adds `generateMetadata` to this same route (that function must live in a server component file, which is why the interactive gallery is split into its own client component here rather than making the whole page a client component).

- [ ] **Step 1: Write the failing test for `ProjectGallery`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectGallery } from './ProjectGallery';
import { projects } from '@/content/projects';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

describe('ProjectGallery', () => {
  it('renders an image for each image gallery item', () => {
    const project = projects.find((p) => p.slug === 'clara-y-manuel')!;
    render(<ProjectGallery project={project} />);
    expect(screen.getAllByRole('img').length).toBe(project.gallery.length);
  });

  it('renders a VideoPreview for video gallery items and opens the lightbox on click', () => {
    const project = projects.find((p) => p.slug === 'boda-elena-y-pablo-video')!;
    render(<ProjectGallery project={project} />);
    const videoItem = project.gallery.find((m) => m.type === 'video')!;
    fireEvent.click(screen.getByRole('button', { name: /reproducir/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/sections/ProjectGallery.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/sections/ProjectGallery.tsx`**

Video items must use `VideoPreview`/`Lightbox` (Tasks 15–16), matching the fix already applied to `SelectedWork` in Task 19 — a static poster-only render would lose the autoplay preview entirely.

```tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { VideoPreview } from '@/components/motion/VideoPreview';
import { Lightbox } from '@/components/motion/Lightbox';
import type { Project } from '@/content/types';

export function ProjectGallery({ project }: { project: Project }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openMedia = openIndex !== null ? project.gallery[openIndex] : null;

  return (
    <>
      <div>
        {project.gallery.map((media, i) =>
          media.type === 'image' ? (
            <Image key={i} src={media.src} alt={media.alt} width={1600} height={1200} />
          ) : (
            <VideoPreview key={i} media={media} onOpenFull={() => setOpenIndex(i)} />
          )
        )}
      </div>
      <Lightbox isOpen={openMedia?.type === 'video'} onClose={() => setOpenIndex(null)}>
        {openMedia?.type === 'video' && (
          <video src={openMedia.src} controls autoPlay poster={openMedia.poster} aria-label={openMedia.alt} />
        )}
      </Lightbox>
    </>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/sections/ProjectGallery.test.tsx`
Expected: PASS.

- [ ] **Step 5: Write the failing test for `generateStaticParams` and the page**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page, { generateStaticParams } from './page';
import { projects } from '@/content/projects';

vi.mock('@/lib/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

describe('generateStaticParams for /trabajos/[slug]', () => {
  it('returns one entry per seed project', async () => {
    const params = await generateStaticParams();
    expect(params.map((p) => p.slug).sort()).toEqual(projects.map((p) => p.slug).sort());
  });
});

describe('/trabajos/[slug] page', () => {
  it('renders the project title, category, and gallery images', () => {
    render(<Page params={{ slug: 'clara-y-manuel' }} />);
    expect(screen.getByRole('heading', { name: 'Clara y Manuel' })).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('renders prev/next navigation to adjacent projects', () => {
    render(<Page params={{ slug: 'lucia-y-jorge' }} />);
    expect(screen.getByRole('link', { name: /siguiente proyecto/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- app/trabajos/[slug]/page.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement `app/trabajos/[slug]/page.tsx`** (server component — `generateMetadata` joins this file in Task 28)

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/content/projects';
import { ProjectGallery } from '@/components/sections/ProjectGallery';

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function Page({ params }: { params: { slug: string } }) {
  const index = projects.findIndex((p) => p.slug === params.slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <article>
      <h1>{project.title}</h1>
      <p>{project.category} — {project.year} — {project.location}</p>
      <p>{project.description}</p>
      <ProjectGallery project={project} />
      <Link href={`/trabajos/${next.slug}`}>Siguiente proyecto: {next.title}</Link>
    </article>
  );
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test -- app/trabajos/[slug]/page.test.tsx`
Expected: PASS.

- [ ] **Step 9: Verify the static build produces all 4 routes**

Run: `npm run build`
Expected: build log lists 4 generated paths under `/trabajos/[slug]`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add statically generated project detail pages with interactive gallery"
```

---

### Task 24: `/servicios` page

**Files:**
- Create: `app/servicios/page.tsx`
- Test: `app/servicios/page.test.tsx`

**Interfaces:**
- Consumes: `services` (Task 4).
- Produces: the `/servicios` route.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';
import { services } from '@/content/services';

describe('/servicios page', () => {
  it('renders each real service with its includes, audience, process, and CTA', () => {
    render(<Page />);
    for (const service of services) {
      expect(screen.getByRole('heading', { name: service.name })).toBeInTheDocument();
      expect(screen.getByText(service.idealFor)).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: service.ctaLabel }).length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- app/servicios/page.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `app/servicios/page.tsx`**

```tsx
import Link from 'next/link';
import { services } from '@/content/services';

export default function Page() {
  return (
    <div>
      <h1>Servicios</h1>
      {services.map((service) => (
        <section key={service.slug} id={service.slug} aria-labelledby={`${service.slug}-heading`}>
          <h2 id={`${service.slug}-heading`}>{service.name}</h2>
          <p>{service.tagline}</p>
          <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
          <p>{service.idealFor}</p>
          <ol>
            {service.process.map((step) => (
              <li key={step.step}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <Link href="/contacto">{service.ctaLabel}</Link>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- app/servicios/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add /servicios page covering all four real EME services"
```

---

### Task 25: `/sobre-nosotros` page

**Files:**
- Create: `app/sobre-nosotros/page.tsx`
- Test: `app/sobre-nosotros/page.test.tsx`

**Interfaces:**
- Consumes: `site` (Task 3).
- Produces: the `/sobre-nosotros` route.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

describe('/sobre-nosotros page', () => {
  it('speaks in the studio voice, not a fabricated personal bio', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EME Fotografía Sevilla');
    expect(screen.getByText(/equipo/i)).toBeInTheDocument();
  });

  it('flags the team photo/name as pending real content', () => {
    render(<Page />);
    expect(screen.getByText(/pendiente de/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- app/sobre-nosotros/page.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `app/sobre-nosotros/page.tsx`**

```tsx
import Image from 'next/image';
import { site } from '@/content/site';

export default function Page() {
  return (
    <article>
      <h1>{site.brandName}</h1>
      <p>Contamos bodas y eventos como se cuentan los editoriales: con dirección de arte, luz cuidada y una narrativa propia, no como un reportaje al uso.</p>

      <section aria-labelledby="filosofia-heading">
        <h2 id="filosofia-heading">Filosofía</h2>
        <p>Cada encargo empieza por entender a las personas, no solo el evento. La cámara viene después.</p>
      </section>

      <section aria-labelledby="proceso-heading">
        <h2 id="proceso-heading">Proceso</h2>
        <p>De la primera llamada a la entrega final, mantenemos una comunicación cercana y plazos claros.</p>
      </section>

      <section aria-labelledby="equipo-heading">
        <h2 id="equipo-heading">Equipo</h2>
        <Image src="/images/sobre-nosotros/placeholder-team.webp" alt="Equipo de EME Fotografía Sevilla (imagen de muestra)" width={800} height={1000} />
        <p>Nombre y trayectoria del equipo pendiente de confirmación por el cliente — esta sección se actualizará con los datos reales.</p>
      </section>
    </article>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- app/sobre-nosotros/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add /sobre-nosotros page in studio voice"
```

---

### Task 26: ContactForm component and `/contacto` page

**Files:**
- Create: `components/ui/ContactForm.tsx`, `components/ui/ContactForm.module.css`, `app/contacto/page.tsx`
- Test: `components/ui/ContactForm.test.tsx`

**Interfaces:**
- Produces: `<ContactForm />` which `POST`s to `/api/contacto` (built in Task 27) with `{ nombre, email, tipoEvento, fecha, presupuesto, mensaje }`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
});

describe('ContactForm', () => {
  it('blocks submission when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /enviar/i }));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/nombre/i)).toBeInvalid();
  });

  it('submits the payload to /api/contacto and shows a success message', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'Ana');
    await user.type(screen.getByLabelText(/correo/i), 'ana@example.com');
    await user.selectOptions(screen.getByLabelText(/tipo de evento/i), 'boda');
    await user.type(screen.getByLabelText(/mensaje/i), 'Nos casamos en junio');
    await user.click(screen.getByRole('button', { name: /enviar/i }));
    expect(global.fetch).toHaveBeenCalledWith('/api/contacto', expect.objectContaining({ method: 'POST' }));
    expect(await screen.findByText(/gracias/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- components/ui/ContactForm.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `components/ui/ContactForm.tsx`**

```tsx
'use client';
import { useState, FormEvent } from 'react';
import styles from './ContactForm.module.css';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const res = await fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setError('No hemos podido enviar tu mensaje. Escríbenos directamente a info@emefotografiasevilla.es');
      return;
    }
    setSubmitted(true);
  }

  if (submitted) return <p role="status">Gracias, hemos recibido tu mensaje. Te responderemos lo antes posible.</p>;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" required />

      <label htmlFor="email">Correo electrónico</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="tipoEvento">Tipo de evento</label>
      <select id="tipoEvento" name="tipoEvento" required defaultValue="">
        <option value="" disabled>Selecciona una opción</option>
        <option value="boda">Boda</option>
        <option value="evento">Evento corporativo</option>
        <option value="otro">Otro</option>
      </select>

      <label htmlFor="fecha">Fecha aproximada</label>
      <input id="fecha" name="fecha" type="date" />

      <label htmlFor="presupuesto">Presupuesto aproximado</label>
      <input id="presupuesto" name="presupuesto" placeholder="Ej. 1500-2500€" />

      <label htmlFor="mensaje">Mensaje</label>
      <textarea id="mensaje" name="mensaje" required />

      {error && <p role="alert">{error}</p>}
      <button type="submit">Enviar</button>
    </form>
  );
}
```

```css
.form { display: flex; flex-direction: column; gap: var(--space-2); max-width: 40rem; }
.form input, .form select, .form textarea {
  border: 1px solid var(--color-muted);
  background: var(--color-paper);
  padding: var(--space-1);
}
.form button {
  background: var(--color-accent);
  color: var(--color-paper);
  border: none;
  padding: var(--space-2);
  cursor: pointer;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- components/ui/ContactForm.test.tsx`
Expected: PASS.

- [ ] **Step 5: Implement `app/contacto/page.tsx`**

```tsx
import { ContactForm } from '@/components/ui/ContactForm';
import { site } from '@/content/site';

export default function Page() {
  return (
    <div>
      <h1>Contacto</h1>
      <p>Cuéntanos tu proyecto. También puedes escribirnos a <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
      <p>Con cita previa — {site.legalCity}, España.</p>
      <ContactForm />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add ContactForm and /contacto page"
```

---

### Task 27: Contact API route with real submission storage

**Files:**
- Create: `app/api/contacto/route.ts`, `lib/contact-store.ts`
- Test: `lib/contact-store.test.ts`, `app/api/contacto/route.test.ts`
- Modify: `.gitignore` (add `data/contact-submissions/`)

**Interfaces:**
- Consumes: nothing new.
- Produces: `saveContactSubmission(payload): Promise<{ id: string }>` and the `POST /api/contacto` route consumed by `ContactForm` (Task 26).

- [ ] **Step 1: Write the failing test for the store**

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { saveContactSubmission } from './contact-store';

const DIR = path.join(process.cwd(), 'data', 'contact-submissions');

beforeEach(async () => { await fs.rm(DIR, { recursive: true, force: true }); });
afterEach(async () => { await fs.rm(DIR, { recursive: true, force: true }); });

describe('saveContactSubmission', () => {
  it('persists the submission as a real JSON file on disk', async () => {
    const { id } = await saveContactSubmission({ nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola' });
    const files = await fs.readdir(DIR);
    expect(files).toHaveLength(1);
    const content = JSON.parse(await fs.readFile(path.join(DIR, files[0]), 'utf-8'));
    expect(content.nombre).toBe('Ana');
    expect(content.id).toBe(id);
  });

  it('rejects a payload missing required fields', async () => {
    await expect(saveContactSubmission({ nombre: '', email: '', tipoEvento: '', mensaje: '' })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- lib/contact-store.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `lib/contact-store.ts`**

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface ContactSubmission {
  nombre: string;
  email: string;
  tipoEvento: string;
  fecha?: string;
  presupuesto?: string;
  mensaje: string;
}

const DIR = path.join(process.cwd(), 'data', 'contact-submissions');

export async function saveContactSubmission(payload: ContactSubmission): Promise<{ id: string }> {
  if (!payload.nombre || !payload.email || !payload.tipoEvento || !payload.mensaje) {
    throw new Error('Faltan campos obligatorios: nombre, email, tipoEvento, mensaje');
  }
  await fs.mkdir(DIR, { recursive: true });
  const id = crypto.randomUUID();
  const record = { id, receivedAt: new Date().toISOString(), ...payload };
  await fs.writeFile(path.join(DIR, `${id}.json`), JSON.stringify(record, null, 2));
  return { id };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- lib/contact-store.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing test for the route**

```ts
import { describe, it, expect } from 'vitest';
import { POST } from './route';

function req(body: unknown) {
  return new Request('http://localhost/api/contacto', { method: 'POST', body: JSON.stringify(body) });
}

describe('POST /api/contacto', () => {
  it('returns 400 for an invalid payload', async () => {
    const res = await POST(req({ nombre: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with an id for a valid payload', async () => {
    const res = await POST(req({ nombre: 'Ana', email: 'ana@example.com', tipoEvento: 'boda', mensaje: 'Hola' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test -- app/api/contacto/route.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement `app/api/contacto/route.ts`**

```ts
import { saveContactSubmission } from '@/lib/contact-store';

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const { id } = await saveContactSubmission(payload);
    return Response.json({ id }, { status: 200 });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npm test -- app/api/contacto/route.test.ts`
Expected: PASS.

- [ ] **Step 9: Add `.gitignore` entry**

```
data/contact-submissions/
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add contact API route persisting real submissions to disk"
```

---

### Task 28: SEO metadata helper applied to every page

**Files:**
- Create: `lib/seo.ts`
- Test: `lib/seo.test.ts`
- Modify: `app/trabajos/page.tsx`, `app/trabajos/[slug]/page.tsx`, `app/servicios/page.tsx`, `app/sobre-nosotros/page.tsx`, `app/contacto/page.tsx` (each exports `generateMetadata` or `metadata` built from `buildMetadata`)

**Interfaces:**
- Produces: `buildMetadata({ title, description, path, image? }): Metadata`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildMetadata } from './seo';

describe('buildMetadata', () => {
  it('builds title, description, canonical, and OG fields', () => {
    const meta = buildMetadata({ title: 'Trabajos', description: 'Portfolio de EME', path: '/trabajos' });
    expect(meta.title).toBe('Trabajos');
    expect(meta.description).toBe('Portfolio de EME');
    expect(meta.alternates?.canonical).toBe('/trabajos');
    expect(meta.openGraph?.title).toBe('Trabajos');
    expect(meta.openGraph?.url).toBe('https://www.emefotografiasevilla.es/trabajos');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- lib/seo.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `lib/seo.ts`**

```ts
import type { Metadata } from 'next';

const SITE_URL = 'https://www.emefotografiasevilla.es';

export function buildMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
      locale: 'es_ES',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- lib/seo.test.ts`
Expected: PASS.

- [ ] **Step 5: Apply it to each static page** — example for `app/servicios/page.tsx`:

```tsx
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Servicios',
  description: 'Fotografía de boda, vídeo, fotomatón y experiencia 360° en Sevilla.',
  path: '/servicios',
});
```

Repeat the same pattern (adjusting `title`/`description`/`path`) for `app/trabajos/page.tsx`, `app/sobre-nosotros/page.tsx`, and `app/contacto/page.tsx`. For `app/trabajos/[slug]/page.tsx`, add:

```tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: project.description,
    path: `/trabajos/${project.slug}`,
    image: project.cover.type === 'image' ? project.cover.src : project.cover.poster,
  });
}
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: succeeds with no metadata errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add SEO metadata helper and apply it to every route"
```

---

### Task 29: JSON-LD structured data

**Files:**
- Create: `lib/schema.ts`
- Test: `lib/schema.test.ts`
- Modify: `app/layout.tsx` (inject `localBusinessSchema`), `app/trabajos/[slug]/page.tsx` (inject `creativeWorkSchema`)

**Interfaces:**
- Consumes: `site` (Task 3), `Project` (Task 4).
- Produces: `localBusinessSchema(): object`, `creativeWorkSchema(project: Project): object`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { localBusinessSchema, creativeWorkSchema } from './schema';
import { site } from '@/content/site';
import { projects } from '@/content/projects';

describe('schema.org generators', () => {
  it('builds a LocalBusiness schema with real contact and social data', () => {
    const schema = localBusinessSchema();
    expect(schema['@type']).toBe('LocalBusiness');
    expect(schema.name).toBe(site.brandName);
    expect(schema.email).toBe(site.email);
    expect(schema.sameAs).toEqual([site.instagramUrl, site.facebookUrl]);
    expect(schema.address.addressLocality).toBe('Sevilla');
  });

  it('builds a CreativeWork schema for a project', () => {
    const schema = creativeWorkSchema(projects[0]);
    expect(schema['@type']).toBe('CreativeWork');
    expect(schema.name).toBe(projects[0].title);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- lib/schema.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `lib/schema.ts`**

```ts
import { site } from '@/content/site';
import type { Project } from '@/content/types';

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.brandName,
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: site.addressLocality, addressCountry: site.addressCountry },
    sameAs: [site.instagramUrl, site.facebookUrl],
  };
}

export function creativeWorkSchema(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    dateCreated: String(project.year),
  };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- lib/schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Inject into `app/layout.tsx`** (inside `<body>`, before `<SmoothScrollProvider>`):

```tsx
import { localBusinessSchema } from '@/lib/schema';
// ...
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }} />
```

- [ ] **Step 6: Inject into `app/trabajos/[slug]/page.tsx`** (inside the returned `<article>`):

```tsx
import { creativeWorkSchema } from '@/lib/schema';
// ...
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema(project)) }} />
```

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add LocalBusiness and CreativeWork JSON-LD structured data"
```

---

### Task 30: Sitemap and robots.txt

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`
- Test: `app/sitemap.test.ts`

**Interfaces:**
- Consumes: `projects` (Task 4).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { projects } from '@/content/projects';

describe('sitemap', () => {
  it('includes every static route and every project detail route', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    for (const path of ['/', '/trabajos', '/servicios', '/sobre-nosotros', '/contacto']) {
      expect(urls.some((u) => u.endsWith(path))).toBe(true);
    }
    for (const project of projects) {
      expect(urls.some((u) => u.endsWith(`/trabajos/${project.slug}`))).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- app/sitemap.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `app/sitemap.ts`**

```ts
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
```

- [ ] **Step 4: Implement `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: 'https://www.emefotografiasevilla.es/sitemap.xml',
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- app/sitemap.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add sitemap.xml and robots.txt"
```

---

### Task 31: Final QA pass — Lighthouse, cross-checks, and handoff README

**Files:**
- Create: `README.md`
- No other files modified except direct fixes to regressions found below.

**Interfaces:**
- None — this task verifies and documents the whole system built in Tasks 1–30.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: every test from Tasks 1–30 passes.

- [ ] **Step 2: Build and run a production server**

```bash
npm run build
npm run start &
```

- [ ] **Step 3: Run Lighthouse against the production build**

```bash
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"
```

Targets: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. If any score is below target, fix the specific flagged audit (common culprits: missing `sizes` on an `Image`, an oversized hero image, a missing `alt`, insufficient color contrast) and re-run this step until targets are met.

- [ ] **Step 4: Manual responsive pass**

Using Chrome DevTools device toolbar, check each route (`/`, `/trabajos`, `/trabajos/clara-y-manuel`, `/servicios`, `/sobre-nosotros`, `/contacto`) at 375px, 768px, 1024px, 1440px, and 1920px widths. Fix any overflow, overlapping text, or unreachable controls found.

- [ ] **Step 5: Keyboard and reduced-motion pass**

Tab through every page with the mouse untouched — confirm the skip link, header nav, mobile menu, project filters, and contact form are all reachable and operable. Then enable "Reduce motion" in OS accessibility settings and reload each page — confirm no autoplay, no parallax, and the intro sequence is skipped or instant.

- [ ] **Step 6: Console and link check**

Open DevTools console on every route and confirm zero errors/warnings. Click every internal link once to confirm none 404.

- [ ] **Step 7: Write `README.md`** documenting the swap process for real content:

```markdown
# EME Fotografía Sevilla

Sitio web de EME Fotografía Sevilla (Next.js + TypeScript).

## Desarrollo

npm install
npm run dev

## Sustituir el contenido de muestra por material real

1. Fotos: sustituye los archivos `placeholder-*.webp` en `public/images/` por las fotos reales del cliente, manteniendo los mismos nombres de archivo (o actualiza las rutas en `content/projects.ts`).
2. Vídeos: igual que arriba, en `public/videos/`.
3. En cada entrada de `content/projects.ts`, `content/testimonials.ts`, cambia `isPlaceholderMedia`/`isPlaceholder` a `false` una vez sustituido el contenido correspondiente.
4. Cuando todo el contenido de muestra haya sido sustituido, pon `NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE=false` en `.env.local` (o elimínalo) para quitar el aviso del footer.
5. Confirma con el cliente: la URL real de Facebook (`content/site.ts`), el horario completo, el teléfono de contacto, y el nombre del fundador/equipo para `/sobre-nosotros` — quedan documentados como pendientes en la spec (`docs/superpowers/specs/2026-08-31-eme-fotografia-web-design.md`, sección 12).
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "docs: add README with real-content swap instructions after final QA pass"
```

---

## Self-Review Notes

- **Spec coverage**: §2 (placeholder strategy) → Tasks 4, 7, 8, 11, 31. §3 (stack) → Task 1. §4 (visual system) → Task 2. §5 (IA) → Tasks 9, 18, 21–27. §6 (motion) → Tasks 12–18. §8 (SEO) → Tasks 28–30. §9 (perf/a11y) → woven into every component task + Task 31. §10 (QA) → Task 31. §11 (out of scope) → intentionally no tasks. §12 (open risks) → surfaced explicitly in Tasks 3, 7, 25, and the README (Task 31).
- **Type consistency checked**: `Project`/`ProjectMedia`/`Service`/`Testimonial`/`SiteInfo` defined once in `content/types.ts` (Task 4) and reused verbatim by every later task; `useProjectFilter` signature matches its Task 19 definition when reused in Task 22; `ContactSubmission` fields match between `ContactForm` (Task 26), `contact-store.ts`, and the route handler (Task 27).
- **No placeholders**: the one open external dependency (exact CC0 video URLs, Task 8) is handled as a concrete live-research step with a real script, not a "TBD" — flagged explicitly in Global Constraints and the README rather than hidden.
