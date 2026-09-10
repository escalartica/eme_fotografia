# Las 14 skills de este proyecto (de las 576 instaladas)

Inventario real de .claude/skills/ verificado el 1 de septiembre de 2026.
Hay 576 skills instaladas. Con ese volumen la selección automática falla, así que
este documento fija cuáles se usan y cuándo. Fuera de esta lista, no invocar nada
sin decirlo antes.

## El equipo titular

### Dirección visual
  high-end-visual-design    Define fuentes, espaciado, sombras, estructura de
                            tarjetas y animaciones al nivel de agencia. Es la que
                            ataca directamente el problema de "parece plantilla".
  design-taste-frontend     Anti-slop. Audita antes de proponer en un rediseño.
  frontend-design-direction Fija la dirección por escrito antes de tocar CSS.
  redesign-existing-projects  Esto es un rediseño, no un proyecto nuevo.

### Sistema y revisión de diseño
  web-design-guidelines     Las Web Interface Guidelines de Vercel. Layout,
                            tipografía, color, motion y accesibilidad.
                            Es la que resuelve los tres tratamientos de H2.
  design-system             Detecta valores hardcodeados y nombres inconsistentes.
                            Para el 144px que no corresponde a ningún token.

### Movimiento
  motion-foundations        Tokens de motion, presets de muelle, reglas de
                            rendimiento, accesibilidad y seguridad en SSR para
                            React/Next.js. Se carga ANTES que las demás de motion.
  motion-patterns           Patrones listos: botón, modal, stagger, transiciones
                            de página, animación al scroll.
  gsap-scrolltrigger        El cableado Lenis + ScrollTrigger. Es la que toca
                            cuando un reveal no termina.
  gsap-timeline             Timelines. Para el hero y el preloader.
  gsap-performance          Que todo corra a 60fps.
  emil-design-eng           Criterio de pulido y microinteracción.
  apple-design              Movimiento físico, materiales, tipografía.
  review-animations         Audita la animación ya escrita. Flaggea por defecto:
                            la aprobación se gana.

### Accesibilidad
  frontend-a11y             WCAG en código de frontend.
  accessibility             Auditoría general.

### Rendimiento
  react-performance         Core Web Vitals en React/Next.

### SEO local
  seo-local                 "fotógrafo de bodas en Sevilla".
  seo-schema                JSON-LD LocalBusiness + Photograph.
  seo-page                  Metadatos y estructura por página.
  seo-technical             Sitemap, robots, rastreo.

### Contenido
  ui-ux-pro-max             Copy de interfaz.
  copywriting               Textos.

### Verificación
  verification-loop         Verificación antes de dar nada por terminado.
  webapp-testing            Pruebas en navegador real.
  code-review               Revisión de código.

## Falsos amigos: NO usar en este proyecto

  taste                 Suena a lo que buscamos pero es dirección creativa para
                        videoclips musicales, estética angelcore y hyperpop.
                        Nada que ver con una web de bodas.
  tasteforge-video      Vídeo, no web.
  gpt-taste             Se anuncia como "Elite UX/UI & GSAP Motion Engineer" pero
                        impone aleatorización por Python para "variar el layout" y
                        una estructura AIDA rígida. Genera variación arbitraria, que
                        es justo lo contrario del criterio que necesitamos.
  liquid-glass-design   Es el sistema Liquid Glass de iOS 26 para SwiftUI/UIKit.
  swiftui-design        iOS, no web.
  animate-expo          React Native.
  motion-doctrine       Es para vídeo multiescena con HyperFrames, no para web.
  canvas-design         Lienzos de artboards, no una web en producción.
  design-taste-frontend-v1   Versión antigua. Usar siempre la sin sufijo.

## Regla de trabajo

Antes de cada fase, invocar las skills que esa fase indica en
docs/DIRECTRICES-CLAUDE-CODE.md y decir en una línea cuáles se han cargado.
Nunca fingir una skill que no cargue.

## Nada más que instalar

Se ha comprobado: las catorce skills de anthropics/skills ya están, y
web-design-guidelines de vercel-labs también (symlink a .agents/skills,
commit upstream 4e799d45). Instalar más skills empeora la selección automática,
no la mejora. Si algo sobra, sobra; si algo falta, se verá al usarlo.

---

# Plan de acabado premium (actualizado 3 sept 2026)

Verificado contra el código real del worktree antes de escribir esto —no contra
la auditoría vieja. Lo que sigue abajo separa lo que YA está arreglado de lo
que queda, en el orden en que hay que hacerlo. Referencias a
`docs/AUDITORIA-COMPLETA.md` (bugs) y `docs/PATRONES-AWWWARDS.md` (patrones de
las webs premiadas de Awwwards) en cada punto.

## Ya resuelto — no volver a tocar

Comprobado leyendo el código, no de memoria:

- **Vídeo del hero**: ya no está en pausa. `Hero.tsx` hace `play()` imperativo
  con `.catch()` y fija `muted` por JS porque el atributo JSX solo no es
  fiable. El poster lleva `fetchPriority: high` como LCP. Esto era A1 en
  AUDITORIA-COMPLETA — cerrado.
- **Navegación**: `Header.tsx` tiene ahora nav persistente en escritorio
  (Trabajos / Servicios / Estudio / Contacto), con comentario propio en el
  código explicando que antes solo existía dentro del overlay móvil y era
  invisible fuera del home. Esto era el hallazgo "sin nav visible en
  escritorio" — cerrado.
- **Texto de relleno en el footer** ("Contenido de muestra — pendiente de
  sustitución...") ya no aparece en ningún componente. Era el bug de máxima
  prioridad de la auditoría — cerrado.
- **Páginas que faltaban**: `/servicios` y `/sobre-nosotros` ya existen.
- **H2 de "Trabajos seleccionados"**: ya no está a 27px suelto. Ahora
  `clamp(2rem, 4.2vw, 4rem)`, coherente con el resto de titulares. Era el peor
  bug tipográfico de la auditoría — cerrado.
- **Formulario de contacto**: ya no es un formulario plano de 8 campos. Es
  multi-paso ("Paso X de Y") — exactamente el patrón A4 de
  PATRONES-AWWWARDS.md (Estudio Manzanero). Buen trabajo, no rehacer esto.
- **Tests**: han aparecido `vitest.setup.ts` y `.test.tsx` en Hero, Header,
  Footer, MobileMenu, SelectedWork, Testimonios, Manifiesto, CtaContacto,
  ScrollReveal, TrabajosFilter y ambas páginas de trabajos. Antes de seguir
  añadiendo nada, correr `npm run test` y `npm run build` y confirmar que
  siguen en verde — si algo de lo de abajo rompe un test existente, es una
  señal real, no ruido.

## Lo que sigue en pie — por este orden

### 1. `/trabajos` sin ninguna llamada a la acción
`app/trabajos/page.tsx` no tiene ni un enlace a `/contacto` ni créditos.
Sigue siendo el hallazgo de AUDITORIA-COMPLETA con peor ratio esfuerzo/impacto
sin resolver. Aplicar el patrón A4 de PATRONES-AWWWARDS.md: un único CTA
repetido "Consultar disponibilidad" (no "Reservar", no precio) al final del
índice. Skills: `web-design-guidelines`, `copywriting`.

### 2. Página de boda individual sin créditos ni navegación de bucle
`app/trabajos/[slug]/page.tsx` no menciona proveedor, crédito ni venue en
ningún sitio. Añadir, siguiendo `docs/REFERENCIA-ADOVASIO.md` (anatomía de
página de boda) y A5 de PATRONES-AWWWARDS.md: créditos de proveedores con
enlace (fotógrafo/a, finca, catering, floristería — lo que aplique), lugar
nombrado explícitamente, y navegación anterior/siguiente en bucle cerrado
entre bodas (como Adovasio). También seguía habiendo muchas menos fotos por
boda que en las referencias premiadas (5 frente a 40-52) — hay material real
sin usar en `fotos eme/`, revisar cuántas de esas fotos están ya en el
componente de galería antes de pedir más. Skills: `high-end-visual-design`,
`web-design-guidelines`.

### 3. Presupuesto como texto libre en el formulario
`ContactForm.tsx` línea 187-188: `presupuesto` sigue siendo un `<input>` de
texto libre ("Ej. 1500-2500€"). Cambiarlo a un selector de rango/tramo de
cobertura — más fácil de rellenar en móvil y evita que la pareja se quede en
blanco. Además, de los campos del paso 2 (`fecha`, `lugar`,
`numeroInvitados`, `presupuesto`, `mensaje`) ninguno lleva `autoComplete`;
solo `nombre` y `email` en el paso 1 lo llevan. Añadir `autoComplete`
razonable donde aplique (p. ej. `lugar` no tiene autocompletado estándar,
pero no cuesta nada intentarlo con `off` explícito en vez de omitirlo).
Skills: `frontend-a11y`, `web-design-guidelines`.

### 4. Ritmo de sección y tokens
Seguía sin encontrarse ningún `--space-section` ni `padding-block` en
`styles/tokens.css` cuando se auditó por última vez el 144px fijo repetido
en todas las secciones. Confirmar si el rediseño del header/hero ya introdujo
un token de espaciado de sección; si no, crear uno en `tokens.css` y
sustituir los valores sueltos. Skill: `design-system`.

### 5. Los 4 momentos de animación de Adovasio (por este orden, según
`docs/REFERENCIA-ADOVASIO.md` y BLOQUE B de PATRONES-AWWWARDS.md)
1. **B1 — verificar el cableado Lenis+ScrollTrigger** contra el código
   verbatim extraído de OBSESD en PATRONES-AWWWARDS.md antes de tocar nada de
   animación nueva: `lenis.on('scroll', ScrollTrigger.update)` +
   `gsap.ticker.add(...)` + `gsap.ticker.lagSmoothing(0)`. Si el proveedor de
   scroll suave del proyecto no hace exactamente esto, arreglarlo primero —
   todo lo demás depende de que esto esté bien.
2. **B2 — un ScrollTrigger por sección**, no uno por elemento (patrón
   Elke Van den Ende), para que la web escale cuando se añadan las fotos que
   faltan en el punto 2 sin que el rendimiento se caiga.
3. Transición de página con **View Transitions API** entre `/trabajos` y
   `/trabajos/[slug]` (imagen compartida), como Adovasio.
4. Preloader corto estilo Manzanero (B5) SOLO si el LCP actual lo justifica —
   no añadir un preloader porque quede bonito; añadirlo si de verdad tapa una
   carga real.
Skills: `motion-foundations` (cargar primero), `gsap-scrolltrigger`,
`gsap-timeline`, `gsap-performance`, `review-animations` al final.

### 6. Vídeo con carga/descarga por scroll
Hay metraje de dron real en `video eme/` sin política de carga definida.
Aplicar C2 de PATRONES-AWWWARDS.md (IntersectionObserver que carga el
`<video>` al entrar en viewport y lo descarga al salir, código verbatim de
Untraditional Weddingfilms ya extraído en ese documento) y C4 (autoplay solo
con `(hover: hover)`, no en móvil). Skills: `gsap-performance`,
`react-performance`.

### 7. Contadores en Testimonios
Revisar `Testimonios.tsx` línea ~107 (`styles.counter`) — la auditoría vieja
marcó los contadores del home a cero. Confirmar si siguen a cero o si ya
tienen datos reales antes de tocar el componente.

## Verificación antes de decir que algo está listo

Por cada punto anterior: `npm run test`, `npm run build`, y una pasada de
`webapp-testing` en el navegador real a 375px y 1440px (no solo el panel
oculto — ver la advertencia de AUDITORIA-COMPLETA). `code-review` con un
agente fresco antes de cerrar cualquiera de estos puntos. `verification-loop`
antes de decir "terminado".

