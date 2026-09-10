# Rediseño premium EME - dirección y primera fase

**Lectura del brief:** rediseño-overhaul del portfolio de un estudio de fotografía
de bodas, para parejas con criterio visual en Sevilla, en lenguaje editorial Didone,
sobre el stack que ya existe (Next.js 16 + CSS Modules + GSAP + Lenis).

**Dials:** `DESIGN_VARIANCE 9 / MOTION_INTENSITY 8 / VISUAL_DENSITY 3`.

## Qué se tomó de cada referencia

| Referencia | Qué hace | Qué adoptamos |
|---|---|---|
| bellephoto.com.au | Wordmark Didone a todo el ancho sobre papel, la fotografía empieza justo debajo. Nav horizontal persistente de 6 enlaces. | La estructura del hero (banda de masthead + banda de media a sangre) y el nav siempre visible. |
| danieleandmarilia.com | Columna de texto fijada mientras la columna de fotos scrollea a otro ritmo. Capitular. Menú overlay numerado 01-06. | El movimiento firma de Trabajos, la capitular del manifiesto y el overlay numerado. |
| bottega53.com | Cero espacio en blanco, la imagen llena el viewport. Sin color de acento. | La densidad de imagen y la decisión de retirar el acento por completo. |

## Decisiones de fondo

**Tipografía.** Fraunces fuera, Bodoni Moda dentro. Fraunces es la serif que todo
generador elige por defecto para "creativo": serifas en cuña, contraste bajo, y a
tamaño display no lee como cabecera de revista. Bodoni Moda es una Didone real
(contraste alto, serifas de pelo, eje vertical) y es la familia que usan las tres
referencias. Variable en peso y en tamaño óptico, así que aguanta desde el wordmark
de 13rem hasta una cita.

**Paleta.** Monocroma. El acento oxblood (#992927) y el papel crema formaban
exactamente la familia beige + latón + oxblood que usan todas las plantillas de
"artesanal premium", y competía con las fotos. Las tres referencias no llevan
ningún color de acento en su interfaz: la fotografía es el único color de la página.
`--color-accent` queda como alias de tinta para no romper módulos sin migrar.

**Filtro de foto.** `--photo-grade` retirado (ahora `none`). Re-graduaba por CSS
trabajo que un fotógrafo ya había terminado, y costaba una capa de composición en
cada imagen grande.

**Numerales fantasma.** El `01`/`02` gigante en gris claro de `.chapterNumber`
ocupaba casi un viewport y leía como una imagen que no había cargado. Reducido a
etiqueta de índice discreta; los callers siguen funcionando sin tocarlos.

## Qué cambió en esta fase

1. **`styles/tokens.css`** - paleta monocroma, escala tipográfica nueva, ritmo
   vertical recortado (`--space-5` de 10rem a 7rem), `--gutter` nuevo.
2. **`app/layout.tsx`** - Bodoni Moda sustituye a Fraunces.
3. **`components/layout/Header.*`** - fin del `mix-blend-mode` invisible. Nav
   horizontal persistente desde 900px, fondo de papel translúcido al scrollear,
   subrayado que crece desde la izquierda, estado `aria-current` en la ruta activa.
4. **`components/layout/MobileMenu.*`** - overlay numerado 01-05 en Didone, entrada
   escalonada con GSAP desde una máscara por fila, bloqueo de scroll del body,
   pie con email e Instagram.
5. **`components/sections/Hero.*`** - masthead sobre banda de media, sin scrim. El
   degradado oscuro existía para hacer legible la tipografía sobre el vídeo y estaba
   apagando el único activo que vende la página. Reveal por carácter con SplitText
   dentro de máscara por línea, tras `document.fonts.ready`. Indicador de scroll
   retirado.
6. **`components/sections/Manifiesto.*`** - fuera el crossfade enmascarado (el
   scrub dejaba al lector parado en estados intermedios que parecían un fallo de
   render). Reveal por línea con SplitText y capitular real con `::first-letter`.
7. **`components/sections/SelectedWork.*`** - reescrito. Índice editorial: la ficha
   de cada proyecto es `position: sticky` dentro de su fila, así el nombre se queda
   quieto mientras la foto pasa. El sticky es CSS puro (sobrevive a resize, a
   reduced-motion y a que falle el JS); GSAP solo aporta la velocidad diferencial
   de la foto dentro del marco. Seis proyectos y un enlace al archivo completo.
8. **`components/motion/ScrollReveal.tsx`** - trigger de `top 85%` a `top 92%`,
   recorrido de 40px a 24px. Era la causa de las fotos lavadas y de las pantallas
   en blanco entre secciones.
9. **`components/layout/Footer.*`** - fuera "Sevilla - Sevilla" y el punto medio
   como separador.

Todos los archivos sustituidos tienen su `.bak` al lado.

## Pendiente

- **Servicios, Sobre el estudio y Testimonios** heredan la tipografía y el ritmo
  nuevos, pero no se han recompuesto. Testimonios sigue centrado y con una cita
  enorme; merece el tratamiento de slider editorial de las referencias.
- **Formulario de contacto tipo D&M**: "Somos ___ y nos casamos el ___ en ___",
  una frase que se completa en vez de una pila de campos. Es el detalle más
  copiable de las tres referencias y el que más sube la percepción de precio.
- **Páginas internas** (`/trabajos`, `/servicios`, `/sobre-nosotros`) siguen usando
  `EditorialSpread` y los numerales antiguos.
- Todo lo P0/P1 de `auditoria-2026-09-02.md` que no era visual: vídeos de 52 MB,
  `next.config.mjs` vacío, formulario que no llega a nadie, aviso legal.
- `npx vitest run` y `next build` **no se han ejecutado**: el entorno remoto no
  tiene los binarios nativos. Hay que pasarlos en el Mac.

---

# Fase 2 - Estilo Bellé Photo aplicado

Análisis completo de bellephoto.com.au y traducción de su lenguaje al contenido de EME.

## El vocabulario de Bellé, elemento por elemento

| Recurso | Cómo lo hace Bellé | Dónde está en EME |
|---|---|---|
| Masthead | Wordmark Didone centrado ocupando el ancho completo sobre papel crema, sin foto detrás. La fotografía empieza justo debajo, a sangre. | `Hero` |
| Énfasis en itálica | "YOUR LOVE STORY CAPTURED *BEAUTIFULLY*." Una palabra de la misma familia en su itálica real, nunca una segunda fuente. | `.displayEm` en `styles/layout.css` |
| Titulares de sección | "*The* PORTFOLIO", "*Featured* WEDDINGS": palabra en itálica minúscula contra palabra romana en versales. | `Manifiesto`, `SelectedWork`, `ServiciosPreview`, `Testimonios` |
| Bloque negro | La sección de estudio invierte a negro total: foto contenida a la izquierda, copy a la derecha, un enlace con flecha. | `SobreEmePreview` con `.nightBlock` |
| Fichas de boda | Retrato, nombre en versales Didone partido en dos líneas, lugar debajo, "VIEW GALLERY ↗". | `SelectedWork` |
| Cierre | Foto a sangre, velo oscuro, línea en itálica sobre statement enorme en versales, frase en sans, "ENQUIRE ↗". | `CtaContacto` |
| Enlaces | Nunca un botón relleno. Versales, tracking abierto, flecha ↗, y una regla que se dibuja al pasar. | `.arrowLink` global |

## Decisiones propias, no copiadas

**Un solo bloque oscuro.** Bellé alterna crema y negro varias veces. Aquí el cambio
ocurre exactamente una vez, en la sección de estudio, para que se lea como un cambio
de registro deliberado y no como una página que pierde el hilo de su propio tema.

**Nav sin ocultarse.** Bellé mantiene la barra visible toda la página. Se ha quitado
el `hide-on-scroll`: una barra que desaparece es una barra que hay que ir a buscar.

**El reveal de cortina no lleva fade.** `ScrollReveal` con `clipReveal` ya no anima
opacidad. Hacer las dos cosas dejaba cada foto medio transparente durante casi todo
el reveal, que era justo lo que hacía parecer que las imágenes no habían cargado.

**Fuera el badge magnético del CTA.** Venía de danieleandmarilia.com. Dos CTAs firma
de dos estudios distintos en la misma página es uno de más, y era el último elemento
del sitio animándose en bucle sin motivo declarado.

**El scrim vuelve, pero solo en el cierre.** En el hero se quitó porque el texto tiene
su propia banda de papel. En `CtaContacto` la tipografía sí va encima de la foto, y
la foto es oscura y con mucho detalle, así que el velo es necesario para el contraste.

## Paleta final

```
--color-ink    #0B0B0B   negro que no es #000 (el negro puro mata los finos de una Didone)
--color-paper  #F8F7F2   crema cálido, muestreado de Bellé
--color-night  #060606   el único bloque oscuro
--color-muted  #6C6C68
```

Sin color de acento. La fotografía es el único color de la página.

---

# Fase 3 - Acabados

Detalles de oficio, no estructura. Cada uno es pequeño; juntos son la diferencia
entre "bien maquetado" y "caro".

## Tipografía

**`font-optical-sizing: auto`.** Es la razón por la que merece la pena cargar una
Didone variable. Bodoni Moda lleva un eje `opsz` real: a 9rem el navegador usa el
corte display, con serifas de pelo y contraste extremo, y a 1rem usa el corte de
texto, con esos mismos finos engordados para que sobrevivan a tamaño de lectura.
Sin esa línea el mismo contorno se escala a los dos sitios: el masthead pierde los
finos y el texto pequeño se queda esquelético.

**`hanging-punctuation: first last`.** Mete las comillas de apertura en el margen para
que el bloque de texto mantenga el borde izquierdo recto, que es justo el motivo por
el que se compone una cita en una fuente display. Solo Safari hoy, inofensivo en el resto.

**Cifras alineadas y tabulares** en el contador de testimonios, los números de servicio
y el año de cada ficha: `lining-nums` para que se sienten a la altura de las versales
en vez de bajar por debajo, `tabular-nums` para que el contador no cambie de ancho
mientras cuenta.

**`::selection` monocromo.** El azul por defecto del navegador no tiene nada que ver
con esta paleta y aparece en cuanto alguien arrastra sobre un titular.

**Anillo de foco de 1px con 4px de separación**, no 2px pegado. A 2px se lee como un
borde que el diseño no pidió; lo que lo hace legible es la separación, no el grosor.

**Barra de scroll** en la paleta. Es cromo que la página no puede quitar, así que al
menos que sea suyo.

## Movimiento

**La cortina de apertura se levanta.** Antes desaparecía. Una pantalla de apertura que
se esfuma se lee como una página que iba lenta; una que sale por arriba se lee como
una apertura deliberada, y además entrega la mirada al masthead que hay debajo en
vez de dejarla caer ahí.

**Crossfade en los testimonios.** Sin él la cita se sustituía entre dos frames y el
lector no distinguía si había cambiado el texto o había saltado la página. Es una
transición de estado, que es una de las cuatro razones válidas para animar algo.

**Las filas de servicios se desplazan a la derecha bajo el cursor.** Es el único
movimiento de esa lista, y en una paleta monocroma dice "estás señalando esta fila"
mucho más claro de lo que puede decirlo un cambio de color.

**El pie de cada ficha sube con su foto.** Tres píxeles. Hace que la tarjeta se lea
como un objeto bajo el cursor y no como una imagen que casualmente tiene texto cerca.

**Un solo `ScrollReveal` para toda la lista de servicios**, no uno por fila. Con uno
por fila cada una esperaba su propio trigger, así que media lista estaba a opacidad
baja mientras la otra media estaba sólida: se leía como una jerarquía que nadie quiso.

## Contenido

**Testimonios reencuadrados.** Fuera las dos comillas grises gigantes flotando arriba
y abajo; las comillas ahora son parte de la frase y cuelgan en el margen. La cita baja
de tamaño display a tamaño de lectura, porque una cita compuesta tan grande como un
titular deja de ser algo que alguien lee de verdad. Y la medida sube a 46ch: 34ch de
una Didone caían en unas siete palabras por línea, que se lee como un poema, no como
una reseña.

**Controles de testimonio como flechas** con contador `01 / 04`. El nombre accesible
sigue llevando "Testimonio anterior" y "Testimonio siguiente" (`aria-label`), así que
un lector de pantalla no pierde nada, y el control visible deja de competir con la
cita. Área de pulsación real de 44px.

**404 y error propios.** Caer en la pantalla por defecto de Next es lo menos premium
que puede hacer una web: saca al visitante de la marca entera, con estética de traza
de error y sin más salida que el botón de atrás. Ahora las dos usan el registro del
bloque de cierre: línea corta en itálica sobre statement en versales, y salidas con
flecha. El 404 lleva además su propio `title` y `robots: noindex`.
