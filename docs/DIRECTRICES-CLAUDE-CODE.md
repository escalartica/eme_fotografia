# Directrices de trabajo para Claude Code — eme_fotografia

Objetivo: una web de fotografía de bodas premium, dinámica y con animaciones de oficio.
Referencia visual: adovasio.it (Site of the Day en Awwwards).

Documentos hermanos, de lectura obligatoria antes de tocar código:
  docs/REFERENCIA-ADOVASIO.md   -> qué hace la referencia y por qué funciona
  docs/DIAGNOSTICO-VISUAL.md    -> qué falla hoy en localhost:3000

## Regla de oro sobre las skills

En este proyecto hay 576 skills instaladas en .claude/skills/. Claude Code NO las va a
encontrar solo: con ese volumen, la selección automática falla. Por eso este documento
NOMBRA la skill exacta que hay que invocar en cada fase.

Todas las skills listadas aquí están VERIFICADAS: existen en .claude/skills/.
Si alguna no carga, dilo y sigue sin ella. No la finjas.

Antes de cada fase, invoca las skills de esa fase. Después de invocarlas, di en una
línea cuáles has cargado. No empieces a escribir código antes de eso.

## Principio de dirección, por encima de todo

La web actual parece plantilla. La solución NO es añadir efectos.

Adovasio no tiene parallax por todas partes. Tiene vacío, tipografía enorme y CUATRO
momentos de animación muy caros. Su sensación premium viene de la contención.

  Menos efectos, mejor ejecutados, en menos sitios.

Parallax en cada sección, contadores por todos lados y reveals en cada bloque es
exactamente lo que hace que una web parezca plantilla de 2015.

---

## FASE 0 — Diagnóstico del bloqueante

Skills: agent-introspection-debugging, webapp-testing

Bug: al hacer scroll con teclado, todo lo que hay bajo el hero queda invisible aunque
el texto está en el DOM. Ver BLOQUEANTE 1 en docs/DIAGNOSTICO-VISUAL.md.

  - Encuentra la CAUSA RAÍZ antes de proponer ningún arreglo.
  - Descarta las dos hipótesis del documento una a una, con evidencia.
  - Prohibido el parche a ciegas.

Nada de lo que sigue importa mientras media web no se vea.

## FASE 1 — Dirección visual

Skills: design-taste-frontend, high-end-visual-design, frontend-design-direction,
        taste, redesign-existing-projects

  - redesign-existing-projects primero: esto es un rediseño, no un proyecto nuevo.
    Audita antes de proponer.
  - Define la dirección por escrito en docs/DIRECCION-VISUAL.md antes de tocar CSS:
    tipografía, escala, color, densidad, referencias reales.
  - Revisa --color-accent (#992927). Un rojo saturado es la decisión que más
    fácilmente abarata el conjunto. Adovasio usa verde oliva muy oscuro (#242d23)
    contra papel cálido.
  - Usa --space-5 (10rem) de verdad entre secciones. El aire es el lujo.

## FASE 2 — Hero

Skills: web-design-engineer, web-design-guidelines, apple-design

  - Arregla el contraste: scrim en degradado sobre la foto, no overlay plano.
  - Elige una foto con zona muerta donde va el texto.
  - Evalúa el vídeo de dron de la carpeta "video eme" como hero: silenciado, con
    poster, con fallback a imagen y respetando prefers-reduced-motion.
  - La nav y el logo tienen que leerse siempre, en cualquier foto.

## FASE 3 — Animación

Skills: emil-design-eng, emilkowalski-motion, apple-design, animation-vocabulary,
        gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-react, gsap-performance

El proyecto ya usa GSAP + Lenis. Mismo stack que Adovasio. No cambies de librería.

Los CUATRO momentos, y solo esos:
  1. Preloader con contador numérico. Solo la primera visita de la sesión
     (sessionStorage). Si penaliza el LCP, se descarta.
  2. Transición entre /trabajos y /trabajos/[slug] con imagen compartida
     (View Transitions API).
  3. Menú overlay a pantalla completa.
  4. Filtros de galería con reordenado animado.

Reglas:
  - Fuera de esos momentos, la web está quieta.
  - Solo transform y opacity. 60fps o no se entrega.
  - Duraciones 150-400 ms. --duration-slow (1.1s) queda reservado a la transición
    de página, en ningún otro sitio.
  - gsap-scrolltrigger: enlaza Lenis con ScrollTrigger.update(). Es probablemente
    la causa del bloqueante de la fase 0.
  - prefers-reduced-motion con alternativa real, no con animaciones a medio quitar.

## FASE 4 — Auditoría de la propia animación

Skills: review-animations, find-animation-opportunities, improve-animations

  - review-animations sobre tu propio código. Esta skill flaggea por defecto: la
    aprobación se gana. Corrige lo que salga.
  - find-animation-opportunities es de solo lectura: propone, no implementa.
  - Rechaza tanto como aceptes. Si propone veinte cosas, implementa cinco.

## FASE 5 — Contenido y copy

Skills: copywriting, ui-ux-pro-max

  - El copy actual es bueno y tiene voz. No lo reescribas entero.
    "No contamos bodas. Contamos historias con fecha." se queda.
  - Elimina la duplicación de esa frase en la home.
  - Unifica en UN SOLO CTA repetido 3-4 veces por página: "Consultar disponibilidad".
    Ángulo de disponibilidad de fecha, nunca de precio.
  - Arregla o elimina los contadores que muestran 0.
  - Sin precios en la web.

## FASE 6 — Accesibilidad

Skills: frontend-a11y, accessibility, design-review

  - WCAG 2.1 AA.
  - Recorrido completo solo con teclado, incluido el lightbox (focus trap, Esc).
  - Verifica que el viewport NO lleva maximum-scale=1. Es el fallo de Adovasio.
  - alt descriptivo en todas las fotos de galería, en castellano y con el lugar real.
  - Busca en todo el repo placeholders sin rellenar: alt="Alt text", lorem, TODO.

## FASE 7 — Rendimiento

Skills: react-performance, gsap-performance

  - LCP < 2,5s / CLS < 0,1 / INP < 200ms.
  - AVIF y WebP, srcset y sizes, placeholder blur, priority solo en el LCP.
  - Cero scripts de terceros salvo los imprescindibles.
  - Mide antes y después, con capturas.

## FASE 8 — SEO local

Skills: seo-local, seo-page, seo-schema, seo-technical

El estudio es de Sevilla. Este es el mayor hueco del sector: Adovasio no tiene
páginas de destino y le cuesta tráfico.

  - Páginas por localización y por finca, con nombres reales de haciendas.
  - Cada página de destino: H1 con keyword, H2 por bloques, fincas nombradas una a
    una, FAQ con plazos de reserva, enlaces cruzados, CTA.
  - JSON-LD LocalBusiness + Photograph. Sitemap. Metadatos únicos por página.
  - Ninguna página puede quedarse con el title genérico por defecto.

## FASE 9 — Verificación

Skills: verification-loop, webapp-testing, design-review, code-review

No digas que algo funciona sin haberlo comprobado:

  - npm run build, npm run lint y npm test en verde.
  - Capturas reales a 390px y 1440px de CADA página, antes y después.
  - Consola sin errores.
  - Recorrido completo con teclado.
  - code-review con un agente fresco antes de cerrar.

## Forma de trabajar

  - Para al final de cada fase para que el usuario revise.
  - Usa la lista de tareas.
  - No reescribas a Tailwind. CSS Modules se queda.
  - No descartes las tareas ya revisadas del plan actual.
  - Si algo depende del gusto de la fotógrafa, pregunta en vez de decidir.
  - Cinco secciones excelentes valen más que doce mediocres.
