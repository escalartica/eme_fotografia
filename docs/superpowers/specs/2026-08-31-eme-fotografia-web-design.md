# EME Fotografía Sevilla — Web premium (foto + vídeo)

**Fecha**: 2026-08-31
**Estado**: Aprobado para pasar a plan de implementación

## 1. Contexto y objetivo

EME Fotografía Sevilla es un estudio real de fotografía y vídeo de bodas/eventos
en Sevilla (fotografía, vídeo, fotomatón, experiencia 360°). Presencia real:
Facebook "EME Fotografia Sevilla" (2320 me gusta), Instagram
@eme_fotografia_sevilla (1622 seguidores), email
info@emefotografiasevilla.es. Dominio existente `emebodas.com` detectado pero
de relación ambigua con este proyecto — no se referencia ni enlaza desde el
sitio nuevo hasta que el cliente confirme su papel.

Objetivo: construir una web comercial de nivel "premiado" (Awwwards / CSS
Design Awards) que posicione a EME como estudio cinematográfico-editorial de
lujo para bodas y eventos, muy por encima del estándar genérico del sector en
España, con fotografía y vídeo al mismo nivel de protagonismo, scroll
storytelling diseñado con intención, y una base técnica sólida en SEO,
rendimiento y accesibilidad.

No es una landing genérica de WordPress ni una demo técnica de GSAP: la
tecnología está al servicio del diseño y de la conversión (contactos/
presupuestos de boda).

## 2. Contenido: real vs. placeholder

**Real desde el día uno**: nombre de marca, logo, colores de marca, servicios
ofrecidos (Fotografía de boda, Vídeo, Fotomatón, 360°), ciudad (Sevilla,
España), email de contacto, enlaces a Instagram/Facebook reales, cifras de
comunidad (2320 FB / 1622 IG) usadas como prueba social.

**Placeholder hasta que el cliente entregue material real**: todas las
fotografías y vídeos de portfolio (stock editorial de bodas/eventos, con
licencia libre), testimonios de clientes, nombre/foto de fundador(a) o
equipo, biografía/historia del estudio (se escribe en voz de estudio, sin
inventar anécdotas personales atribuidas a una persona real), horario de
apertura (solo se vio "lunes" en la captura aportada — se usa "con cita
previa" en vez de inventar el resto de la semana).

**Convención de marcado de placeholder** (sin ensuciar la estética premium):
- Ficheros de imagen/vídeo con prefijo `placeholder-` en `/public/images` y
  `/public/videos`.
- Cada entrada de `/content/projects.ts` lleva un campo `isPlaceholderMedia:
  true` y un comentario con la fuente (Unsplash/Pexels/Coverr + autor/licencia).
- Aviso discreto en el footer ("Contenido de muestra, pendiente de imágenes
  reales") controlado por `NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE`, activado por
  defecto en desarrollo y desactivable con un solo flag cuando llegue el
  material real y el sitio vaya a producción.
- Ningún watermark superpuesto sobre las imágenes.

## 3. Arquitectura técnica

- **Framework**: Next.js (App Router) + TypeScript. Renderizado híbrido:
  páginas de contenido (home, trabajos, proyecto, servicios, sobre nosotros)
  generadas estáticamente (SSG) para rendimiento y SEO; una API route ligera
  para el formulario de contacto y para dejar preparado el terreno de CMS/
  reservas en una fase posterior sin reescribir el proyecto.
- **Estilos**: CSS Modules + custom properties (design tokens), sin Tailwind
  — control total sobre grids asimétricos y tipografía fluida, sin el
  vocabulario visual "ya visto" de un framework de utilidades.
- **Animación**: GSAP + ScrollTrigger + Lenis (smooth scroll, ~4kb,
  estándar en sitios premiados). Cursor personalizado como componente React
  propio (sin librería).
- **Imágenes**: `next/image` (WebP/AVIF automático, `sizes`/`srcset`,
  lazy-loading, `priority` solo en la imagen del hero).
- **Vídeo**: autohospedado, comprimido, corto (5-15s en loops de preview),
  reproducido/pausado según IntersectionObserver, `poster` obligatorio.
  Pieza completa en lightbox modal accesible. Arquitectura preparada para
  swap a embed de Vimeo si en el futuro suben un showreel largo.
- **Tipografía**: General Sans (grotesk, autohospedada vía `next/font/local`)
  + Fraunces (serif editorial variable, vía `next/font/google`).
- **Dependencias**: cada una justificada explícitamente (ver arriba); nada
  añadido "porque está de moda".

## 4. Sistema visual

**Paleta** (extraída por muestreo de píxeles del logo real, no inventada):
- `--color-ink: #1F262E` (carbón oscuro — texto, fondos oscuros)
- `--color-accent: #992927` (rojo tierra del punto del logo — uso puntual:
  CTA principal, subrayados activos, detalle del cursor)
- `--color-paper: #F7F5F2` (blanco cálido, no blanco puro — fondo)
- `--color-muted: #6B7178` (gris medio — texto secundario)
- El acento rojo se usa con moderación: nunca como color de texto largo, solo
  en elementos puntuales para no competir con la fotografía.

**Tipografía**: escala fluida con `clamp()`, máximo 2 familias, tracking
controlado, titulares Fraunces a gran escala en hero/manifiesto, UI/cuerpo en
General Sans.

**Grids de portfolio**: asimétricos, editoriales, mezcla de fullscreen,
vertical, horizontal — nunca una cuadrícula uniforme tipo galería de stock.

## 5. Arquitectura de información (rutas en español — mercado real es Sevilla)

- `/` — Home: Hero (foto + cinemagraph) → Manifiesto → Selected Work (grid
  mixto foto/vídeo, filtrable) → Servicios (preview) → Sobre EME (preview) →
  Confianza (cifras reales de comunidad) → Testimonios (placeholder) → CTA →
  Contacto (preview) → Footer
- `/trabajos` — portfolio filtrable: Todos / Bodas / Vídeo / Fotomatón / 360°
- `/trabajos/[slug]` — 4 proyectos semilla: 2 boda-fotografía, 1 evento con
  vídeo destacado, 1 fotomatón+360°. Navegación entre proyectos, CTA final.
- `/servicios` — Fotografía de Boda, Vídeo, Fotomatón, Experiencia 360°. Cada
  uno con: qué incluye, para quién es, proceso, CTA.
- `/sobre-nosotros` — voz de estudio: filosofía, proceso, equipo (placeholder
  con hueco claro para nombre/foto real).
- `/contacto` — formulario (nombre, email, tipo de evento, fecha, presupuesto
  aproximado, mensaje) + datos reales de contacto y redes.

## 6. Motion system

- **Intro**: revelado del símbolo "eme" del logo + máscara hacia la primera
  imagen del hero. Una vez por sesión (`sessionStorage`), rápido (<1.5s),
  nunca bloqueante; en navegación interna no se repite.
- **Cursor custom**: solo desktop (`(pointer: fine)`), estados VER /
  REPRODUCIR / ARRASTRAR, desaparece en táctil, nunca bloquea la navegación.
- **Scroll**: Lenis + ScrollTrigger — parallax en capas del hero, reveals con
  `clip-path`/máscara al entrar en viewport, pin puntual en la sección
  Selected Work, stagger en textos, contador animado en cifras de confianza,
  intercambio de imagen al hacer hover sobre nombres de servicio (técnica
  editorial). Nada de horizontal scroll salvo que aporte valor real.
- **Transiciones de página**: View Transitions API nativa con fallback GSAP
  (`clip-path`), subtiles y rápidas (<400ms).
- **`prefers-reduced-motion`**: desactiva Lenis (cae a scroll nativo),
  desactiva parallax/pin/autoplay de vídeo, deja solo fades simples. La
  experiencia debe seguir siendo excelente, no degradada.

## 7. Estructura de carpetas

```
app/
  layout.tsx              (fuentes, tokens globales, providers de motion)
  page.tsx                (home)
  trabajos/page.tsx
  trabajos/[slug]/page.tsx
  servicios/page.tsx
  sobre-nosotros/page.tsx
  contacto/page.tsx
  api/contacto/route.ts
  sitemap.ts
  robots.ts
components/
  layout/    (Header, Footer, Nav, MobileMenu)
  motion/    (Cursor, SmoothScrollProvider, ScrollReveal, Magnetic, PageTransition, VideoPreview)
  sections/  (Hero, Manifiesto, SelectedWork, ServiciosPreview, SobreEmePreview, Confianza, Testimonios, CTA, ContactForm)
  ui/        (Button, SectionHeading, ProjectCard, ImageReveal)
content/     (site.ts, services.ts, projects.ts, testimonials.ts — capa de datos tipada, con forma lista para un futuro CMS)
lib/         (schema.ts JSON-LD, seo.ts, motion-tokens.ts, breakpoints.ts)
styles/      (tokens.css, reset.css, globals.css)
public/
  images/{hero,portfolio,about,trabajos/<slug>}
  videos/{previews,full}
```

## 8. SEO y datos estructurados

- Metadata API de Next por página (title, description, OG, Twitter card),
  `canonical`, `app/sitemap.ts`, `app/robots.ts`.
- JSON-LD `LocalBusiness`/`ProfessionalService` con dirección Sevilla,
  email real, `sameAs` apuntando a Instagram/Facebook reales; `ImageObject`
  y `CreativeWork` en páginas de proyecto.
- URLs limpias en español, headings semánticos, alt text descriptivo en
  español (marcado como placeholder de descripción hasta tener fotos reales).

## 9. Rendimiento y accesibilidad

- Objetivo Lighthouse alto en las 4 categorías; evitar CLS (posters de vídeo
  obligatorios, `sizes` correctos en imágenes); animaciones solo con
  `transform`/`opacity`; code-splitting automático por ruta de Next.
- HTML semántico, skip-link, `focus-visible` con el color de acento,
  contraste verificado (carbón sobre blanco cálido = alto contraste; el rojo
  nunca se usa como color de texto largo), `aria-label` en cursor/vídeo,
  soporte completo de `prefers-reduced-motion` (sección 6).

## 10. QA (antes de dar por terminado)

- Lighthouse (perf/SEO/accesibilidad/best practices) sobre build de
  producción.
- Paso manual en breakpoints 375 / 768 / 1024 / 1440 / 1920.
- Navegación completa por teclado, comprobación de `prefers-reduced-motion`,
  consola sin errores, sin enlaces rotos, alt text presente en todas las
  imágenes.
- Revisión final contra los criterios de un jurado Awwwards/CSS Design
  Awards/CSS Winner (diseño visual, UX, creatividad, tipografía, animación,
  rendimiento, responsive, accesibilidad, efectividad comercial) — si algo es
  mediocre, se mejora antes de cerrar.

## 11. Fuera de alcance (fase 2, explícitamente diferida)

CMS real, blog, galerías privadas de clientes, sistema de reservas/pagos. La
capa de datos en `/content/*.ts` se diseña con forma de CMS headless para que
esa migración futura sea un cambio de fuente de datos, no una reescritura.

## 12. Riesgos / decisiones abiertas a confirmar con el cliente más adelante

- Relación entre este sitio y `emebodas.com` (¿se sustituye, coexiste, se
  redirige?).
- Nombre real del fundador/a o del equipo para la sección Sobre Nosotros.
- Horario real completo (solo se confirmó el lunes).
- Teléfono/WhatsApp de contacto (no se ha compartido; el formulario y el
  email son el canal de contacto inicial).
