# Auditoría EME Fotografía Sevilla — 2026-09-02

Revisión en navegador real (Chrome, localhost:3000, 1440×900 y 400×860) + revisión de código.
Rutas visitadas: `/`, `/trabajos`, `/servicios`, `/contacto`.

Prioridad: **P0** rompe la web · **P1** daña conversión o rendimiento de forma seria ·
**P2** calidad · **P3** pulido.

---

## P0 — Bloqueantes

### 1. La navegación es invisible en todas las páginas internas
**Dónde:** `components/layout/Header.module.css` → `.menuButton`, `.sectionLabel`

```css
.menuButton { mix-blend-mode: difference; color: var(--color-paper); }
```

`--color-paper` (#F7F5F2) está pintado en `body`. El fondo de `body` se propaga al
*canvas* del documento, y el canvas **no forma parte del backdrop de mezcla**. Por eso
`difference` no encuentra nada con lo que mezclarse y el texto se queda en #F7F5F2 sobre
un fondo #F7F5F2.

**Verificado:** en `/servicios` el árbol de accesibilidad devuelve
`button "Abrir menú" [ref_2]`, pero un zoom sobre toda la franja superior (0,0)–(1440,100)
solo muestra el logo. Igual en `/trabajos` y `/contacto`. Solo se ve en la home porque
ahí el vídeo del hero sí es un elemento pintado detrás.

**Impacto:** los enlaces (`Trabajos`, `Servicios`, `Sobre nosotros`, `Contacto`) viven
únicamente dentro de `MobileMenu`, y la única forma de abrirlo es ese botón. Un visitante
con ratón, en cualquier página que no sea la home, **no puede navegar** salvo volviendo al
logo. Teclado y lector de pantalla sí lo encuentran, lo que hace el fallo más difícil de
detectar en tests.

**Fix propuesto:** quitar `mix-blend-mode` y usar color por defecto `--color-ink`, con una
variante clara solo sobre el hero full-bleed:

```css
.menuButton, .sectionLabel { color: var(--color-ink); mix-blend-mode: normal; }
body:has([data-hero-fullbleed]) .header:not([data-scrolled]) .menuButton,
body:has([data-hero-fullbleed]) .header:not([data-scrolled]) .sectionLabel {
  color: var(--color-paper);
}
```

Alternativa: dar al `.header` un fondo real (`background: transparent` no basta —
`isolation: isolate` + capa de fondo) para que `difference` tenga con qué mezclarse.

### 2. 52 MB de vídeo servidos desde `/public`

```
12.5 MB  public/videos/previews/real-boda-01-golden-hour.mp4
12.2 MB  public/videos/previews/real-boda-01-aerial.mp4
 7.0 MB  public/videos/previews/placeholder-gala-360-preview.mp4
 7.0 MB  public/videos/previews/real-boda-01-hero-drone.mp4   ← el del hero
 6.1 MB  public/videos/previews/real-boda-01-full.mp4
 4.4 MB  public/videos/previews/real-boda-01-recepcion.mp4
 2.7 MB  public/videos/previews/real-boda-01-preview.mp4
```

Servidos por el propio servidor de Next, sin CDN, sin versiones por resolución, sin
streaming adaptativo. El hero descarga 7 MB en cada visita nueva.

**Fix:** recomprimir agresivamente los previews (H.264 CRF 26–28 a 720p suele bajarlos a
1,5–2 MB sin pérdida visible en un loop silenciado de fondo) y añadir una fuente AV1/WebM.
Para el catálogo, mover a un CDN de vídeo (Cloudflare Stream, Mux, Bunny) y dejar en local
solo los pósters.

### 3. `next.config.mjs` está vacío
No hay `images.formats`, ni `qualities`, ni cabeceras de caché para `/videos`, ni nada.
Todo funciona con los valores por defecto. Como mínimo: caché inmutable para
`/videos/*` y `/images/*`, y AVIF además de WebP.

### 4. Los mensajes del formulario de contacto se pierden
**Dónde:** `lib/contact-store.ts`

```js
export const DEFAULT_CONTACT_SUBMISSIONS_DIR = path.join(process.cwd(), 'data', 'contact-submissions');
await fs.writeFile(path.join(dir, `${id}.json`), ...)
```

Escribe un JSON en el disco del servidor. En Vercel (y en cualquier despliegue serverless
o con varias instancias) el sistema de archivos es efímero: **el lead desaparece**. No hay
email, ni webhook, ni base de datos, ni notificación a nadie.

**Fix:** enviar el formulario a un servicio de email (Resend, Postmark) y/o persistir en
una base de datos real. Y confirmar por email a quien escribe.

---

## P1 — Serios

### 5. Pantallas enteras en blanco al scrollear
Capturado repetidamente: viewports completos vacíos entre Manifiesto → Trabajos
seleccionados, y de nuevo antes de Testimonios. Causa combinada:

- `--space-5` llega a `10rem` de padding vertical por sección
- `ScrollReveal` dispara en `start: 'top 85%'`, así que el bloque sigue en `opacity: 0`
  cuando ya ocupa el 15% superior de la pantalla
- el parallax del hero añade recorrido muerto

En una web de fotografía, el efecto es "esto no ha cargado". Bajar el trigger a `top 92%`
y revisar el `min-height` de los spreads.

### 6. El efecto del Manifiesto se lee como texto roto
`components/sections/Manifiesto.tsx` hace un crossfade con `scrub: true` entre el `h2`
sólido y un duplicado con `background-clip: text`. Como es `scrub`, el usuario pasa la
mayor parte del tiempo en estados intermedios, donde las letras aparecen medio borradas y
con manchas. En la captura parece un fallo de renderizado, no un recurso editorial.

**Fix:** o quitar el `scrub` (una transición limpia de una vez al entrar), o aplicar la
máscara sobre el bloque entero en lugar de duplicar el texto.

### 7. Las fotos aparecen lavadas durante buena parte del scroll
Consecuencia del mismo trigger tardío: en Servicios, los ítems 03 y 04 se quedan en gris
claro mientras 01 y 02 ya están a plena opacidad. Se lee como jerarquía intencionada, pero
es la animación a medias.

### 8. Móvil: las imágenes no aprovechan el ancho
A 400px, la foto del primer proyecto ocupa ~355px y deja una banda muerta a la derecha.
Los spreads editoriales no colapsan a una columna full-bleed. En una web cuyo producto es
la imagen, es la peor pérdida posible de superficie.

### 9. `POST /api/contacto` sin anti-spam ni rate limit
Endpoint público que escribe ficheros en disco, sin honeypot, sin captcha, sin límite de
peticiones. La validación solo comprueba que los campos existan — el email no se valida
en formato. Un bot puede llenar el disco.

### 10. Falta aviso legal y política de privacidad
No existe ninguna referencia en el código. Para un negocio español con formulario de
contacto es obligatorio (LSSI-CE + RGPD): aviso legal, política de privacidad y checkbox
de consentimiento explícito en el formulario. Ahora mismo el formulario recoge datos
personales sin base legal declarada.

### 11. No hay teléfono ni WhatsApp en ninguna parte
Solo `info@emefotografiasevilla.es`. En bodas, WhatsApp es el canal principal de
conversión. Tampoco aparece `telephone` en el JSON-LD de `LocalBusiness`.

### 12. Contenido de muestra visible
`components/layout/Footer.tsx:34` imprime en producción:

> "Contenido de muestra — pendiente de sustitución por trabajo real de EME Fotografía Sevilla."

Y quedan `placeholder-*` reales en `content/projects.ts` (proyecto
`gala-empresa-fotomaton-360`, fotos de Unsplash con `isPlaceholderMedia: true`, y
`placeholder-gala-360-preview.mp4` de 7 MB). No puede salir así.

---

## P2 — Calidad

### 13. Testimonios sin datos estructurados
Hay 4 opiniones verificadas de Bodas.net en la home, pero el JSON-LD solo emite
`LocalBusiness`. Añadir `Review` / `AggregateRating` es lo que produce estrellas en Google.

### 14. `LocalBusiness` incompleto
`lib/schema.ts` no incluye `telephone`, `priceRange`, `geo`, `openingHoursSpecification`
ni `@type` más específico (`PhotographyBusiness` o `ProfessionalService`).

### 15. `sitemap.ts` marca todo como modificado hoy
`lastModified: new Date()` en cada build. El crawler pierde la señal de qué cambió de
verdad. Usar la fecha real del proyecto (`project.year` o un campo `updatedAt`).

### 16. La home no declara canonical
`app/layout.tsx` define `openGraph`/`twitter` a mano pero no `alternates.canonical`.
El resto de páginas sí lo hacen vía `buildMetadata`.

### 17. Faltan `not-found.tsx`, `error.tsx` y `loading.tsx`
Un 404 o un error de runtime cae en la pantalla por defecto de Next, que rompe por
completo la identidad de la marca.

### 18. `aria-label` sobre `<video>`
`Hero.tsx` describe la escena en un `aria-label` del `<video>`. Los lectores de pantalla
no anuncian eso de forma fiable. La descripción debería ir en texto visible o en el
`alt` del póster.

### 19. `--photo-grade` aplica un filtro CSS a todas las fotos
`saturate(1.06) contrast(1.04) brightness(1.01)` sobre trabajo ya editado por un
fotógrafo profesional. Además, `filter` sobre imágenes grandes fuerza capas de
composición extra. Merece una conversación con la clienta antes que una decisión técnica.

### 20. Tests y build no verificados
`npx vitest run` falla por bindings nativos (`@rolldown/binding-wasm32-wasi`) y
`next build` intenta descargar el SWC de Linux. Es una limitación del entorno remoto, no
del proyecto: **hay que ejecutarlos en tu Mac** antes de dar nada por bueno.

---

## P3 — Pulido

- `.eyebrow` del hero: `opacity: 0.85`, blanco, mayúsculas, ~13px sobre vídeo. En los
  frames claros de la hacienda baja de 4.5:1. El scrim diagonal ayuda pero no garantiza.
- `ScrollReveal` envuelve cada bloque en un `<div>` sin semántica; podría aceptar un prop
  `as` para no ensuciar el árbol.
- No hay `manifest.webmanifest` ni `theme-color`.
- El indicador de scroll queda muy pegado al borde en móvil.
- Sin analítica. Si se añade, hará falta banner de consentimiento (ver punto 10).
- El `<h1>` de la home mete el eyebrow dentro del heading por SEO. Funciona, pero el
  heading resultante es muy largo para lo que Google muestra.

---

## Orden sugerido de ataque

1. Header visible (#1) — una tarde, desbloquea la navegación entera
2. Vídeos + `next.config` (#2, #3) — el mayor salto de rendimiento
3. Formulario que llegue a alguien (#4) + legal (#10) — antes de publicar
4. Huecos en blanco y triggers de reveal (#5, #6, #7) — el diseño ya está, solo está mal temporizado
5. Móvil full-bleed (#8)
6. Limpiar placeholders (#12)
7. SEO estructurado (#13, #14, #15, #16)
