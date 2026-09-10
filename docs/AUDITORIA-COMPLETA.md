# Auditoría completa de localhost:3000

Navegador real, viewport 1440x900. Todos los valores están MEDIDOS con
getComputedStyle o leídos del DOM. Fecha: 1 de septiembre de 2026.

Páginas recorridas: /, /trabajos, /trabajos/raquel-y-fran, /contacto.

## DOS CORRECCIONES A INFORMES ANTERIORES

Las revisiones previas se hicieron con el panel del navegador oculto, con el
viewport reportando 0x0. Con viewport cero, ScrollTrigger no puede calcular nada
y las animaciones se quedan a medias. Dos cosas que di por bugs NO lo son:

1. "Todo lo que hay bajo el hero es invisible" — FALSO. Artefacto de captura.
2. "El titular del hero está congelado en opacity 0.62" — FALSO a 1440x900.
   Medido ahora en reposo: las dos líneas del H1 están en opacity 1.

Lo que SÍ se confirma en viewport real está abajo. Perdón por el ruido.

---

# 1. COLOR Y CONTRASTE

Se midió el ratio de contraste de todo el texto de la home contra su fondo real.

**Resultado: el resto de la web pasa. Solo falla el hero.** Cuatro elementos, y
los cuatro por la misma causa: texto color crema `#F7F5F2` sobre vídeo, sin
scrim que lo proteja.

    Menú (botón nav)          16px   crema sobre pared blanca del vídeo
    Subtítulo del hero        12,6px crema, opacity 0.85
    EME                       101px  crema
    Fotografía Sevilla        101px  crema

El overlay existe, pero es:

    linear-gradient(20deg,
      rgba(17,20,24,0.72)  0%,
      rgba(17,20,24,0.32) 32%,
      rgba(17,20,24,0)    60%)

A 20 grados la zona oscura cae abajo a la izquierda y desde el 60% es totalmente
transparente. **Arriba a la derecha, donde está el botón "Menú", no hay scrim.**
En la captura el botón es prácticamente invisible.

## Fallos de color

**C1. El scrim no protege la barra superior.**
Añadir un segundo degradado vertical desde arriba, independiente del diagonal:
`linear-gradient(to bottom, rgba(17,20,24,.5) 0, transparent 180px)`. Así la nav
se lee sea cual sea el fotograma.

**C2. El subtítulo del hero va al 85% de opacidad.**
Sobre vídeo, cualquier opacidad por debajo de 1 es contraste regalado. Subir a 1.

**C3. `--color-accent: #992927` prácticamente no se usa.**
No apareció como color de texto en ningún elemento medido de la home. O es un
token muerto, o se usa solo en hovers. Un rojo saturado es además la decisión
que más fácilmente abarata un sitio de bodas. Decidir: desaturarlo y usarlo con
intención, o eliminarlo del sistema.

**C4. No hay `theme-color`.**
Sin meta theme-color, la barra del navegador en móvil queda en gris del sistema.
Adovasio usa `#242d23`. Es una línea de HTML con efecto premium inmediato.

---

# 2. TIPOGRAFÍA

Familias: **Fraunces** (serif display) y **generalSans** (sans de texto).
El emparejamiento es bueno. El problema es la aplicación.

## Escala medida a 1440px

    H1  "EME Fotografía Sevilla"        101px  Fraunces  lh 0.86
    H2  "No contamos bodas..."           62px  Fraunces  lh 0.98
    H2  "Servicios"                      62px  Fraunces
    H2  "No dirigimos la boda..."        62px  Fraunces
    H2  "¿Celebras algo importante?"     62px  Fraunces
    H2  "Lo que dicen de nosotros"       36px  Fraunces  lh 1.5
    H2  "Trabajos seleccionados"         27px  generalSans  lh 1.5
    P   texto corrido                    18px  generalSans  lh 1.5
    A   "Conocer el estudio"           14,1px  generalSans
    P   subtítulo hero                 12,6px  generalSans

## Fallos de tipografía

**T1. Hay TRES tratamientos distintos de H2. No es un sistema.**

    62px Fraunces lh 0.98   -> cuatro secciones
    36px Fraunces lh 1.5    -> Testimonios
    27px generalSans lh 1.5 -> Trabajos seleccionados

"Trabajos seleccionados" es el encabezado de la sección más importante de la
home, y es el más pequeño de todos, en la fuente equivocada, a un tercio del
tamaño de "Servicios". Es el fallo tipográfico más grave de la web.

Decidir una regla y aplicarla: o todos los H2 de sección son display (62px
Fraunces), o los "eyebrow" de sección son label pequeño en generalSans y el
titular real va debajo. Mezclar los dos criterios sin regla es lo que produce
la sensación de plantilla.

**T2. El subtítulo del hero es demasiado pequeño.**
12,6px con letter-spacing 1,54px y opacity 0.85, sobre vídeo. Es la línea que
posiciona el estudio entero ("con la mirada de un editorial de moda") y es la
menos legible de la página.

El token `--type-label` tope a `.8125rem` (13px) está pensado para etiquetas,
no para un subtítulo de hero. Subir a 15-16px y opacidad 1, o crear un token
propio para esto.

**T3. El H1 rompe en tres líneas.**
"EME / Fotografía / Sevilla" a 101px. La marca queda partida y la tercera línea
se come el punto focal de la imagen. Añadir `text-wrap: balance` y considerar
bajar el tope de `--type-h1` de 7.5rem a 6rem, o reescribir el H1.

**T4. Los interlineados no siguen ninguna regla.**
lh 0.86 / 0.98 / 1.0 / 1.05 / 1.5 conviviendo en encabezados del mismo nivel.
Definir dos: uno para display (0.95) y uno para texto (1.5), y nada más.

**T5. Los CTA son más pequeños que el texto corrido.**
"Conocer el estudio" a 14,1px cuando el párrafo va a 18px. Un botón nunca debe
ser tipográficamente más débil que el texto que lo rodea.

---

# 3. ANIMACIONES

**A1. El vídeo del hero NO se reproduce. Confirmado en tres medidas.**

    paused: true, currentTime: 0, autoplay: false,
    muted: true, playsInline: true, poster: true, preload: "metadata"

Los atributos están casi bien puestos: `muted` y `playsInline` sí están, hay
poster. Lo que falta es `autoplay`, y con él la llamada a `play()` con su
`.catch()`. Ahora mismo el hero es un fotograma congelado del segundo cero.

En la home hay un segundo `<video>` (preview de "Eva y Rafa") también en pausa,
con `preload: "none"`. Ese está bien: debe arrancar al hover en escritorio y al
entrar en pantalla en móvil (ver patrón C4 de docs/PATRONES-AWWWARDS.md).

**A2. El H1 usa técnica de máscara y funciona.**
El "duplicado" que reporté antes es `headingBase` (H2 visible) + `headingMasked`
(span con `aria-hidden="true"` y `color: rgba(0,0,0,0)`). Es un reveal por
máscara, correctamente marcado para lectores de pantalla. **No es un bug, no
tocar.** Solo tenerlo en cuenta: hace que la frase aparezca dos veces en
`innerText`, lo que confunde a cualquier auditoría automática.

**A3. El escalonado del reveal es demasiado largo.**
Con tres tarjetas de Trabajos a la vez en pantalla se midieron opacidades
simultáneas de 0.64, 0.44 y 0.17. El usuario está mirando contenido al 17%.
`--duration-slow` (1.1s) es excesivo para una tarjeta. Reservarlo a la
transición de página y bajar el resto a 0.3-0.5s con stagger de 0.06-0.08.

**A4. No hay transición entre /trabajos y /trabajos/[slug].**
Es la pieza que más valora el jurado de Awwwards y la que más sube el tiempo de
sesión. View Transitions API con la portada como elemento compartido.

**A5. Nada de esto está verificado con `prefers-reduced-motion`.**
Comprobar que con la preferencia activa el contenido se ve completo y el vídeo
no arranca.

---

# 4. SECCIONES Y RITMO

Medido: **TODAS las secciones tienen exactamente 144px de padding arriba y
abajo.** Sin excepción.

    Manifiesto        144 / 144    alto 625
    SelectedWork      144 / 144    alto 1019
    ServiciosPreview  144 / 144    alto 1046
    SobreEmePreview   144 / 144    alto 1120
    Confianza         144 / 144    alto 407
    Testimonios       144 / 144    alto 1311
    CtaContacto       144 /  48    alto 487

**S1. Ritmo plano.** 288px de aire idéntico entre cada par de secciones produce
una página que respira siempre igual: monótona. Las webs premiadas alternan
secciones apretadas y secciones muy abiertas. Introducir al menos dos niveles:
respiro normal (`--space-4`) y respiro grande (`--space-5`) para los momentos
que deben destacar.

**S2. El valor 144px no corresponde a ningún token.**
`--space-4` tope a 6rem (96px) y `--space-5` a 10rem (160px). 144px = 9rem, que
no es ninguno. Hay un valor hardcodeado fuera del sistema.

**S3. Confianza (407px) está al mismo nivel de aire que Testimonios (1311px).**
Una sección de tres veces menos contenido no necesita el mismo margen.

---

# 5. CONTENIDO

## Fallos por página

### Home

**H1. Los contadores muestran cero.**
Texto renderizado: `"0 | me gusta en Facebook | 0 | seguidores en Instagram"`.
Un contador parado en cero comunica que el estudio no tiene audiencia. Peor que
no tenerlo. Conectar a dato real, sustituir por cifras sostenibles (bodas
fotografiadas, años, reseñas de Bodas.net) o eliminar la sección.

**H2. Dos CTAs distintos compitiendo.** "Conocer el estudio" y "Empezar un
proyecto". Ninguno es el CTA de disponibilidad. Unificar en uno solo repetido.

**H3. Dos assets placeholder visibles.**
`gala-empresa-fotomaton-360/placeholder-cover.webp` y
`sobre-nosotros/placeholder-team.webp`. Hay siete bodas reales con fotos en la
carpeta "fotos eme" del repositorio padre.

**H4. Dos imágenes con alt vacío.** El resto de alt son excelentes y en
castellano — de lo mejor de la web. Completar esos dos.

**H5. El title no compite por nada.** `"EME Fotografía Sevilla"`. El patrón del
sector es `"Fotógrafo de bodas en Sevilla | EME Fotografía"`. La meta
description sí está bien.

### /trabajos

**T1. Solo hay CUATRO proyectos**, y uno tiene slug genérico (`boda-real-01`) y
otro es el placeholder de la gala. Hay siete bodas reales disponibles:
andrea y enrique, andrea y jesús, eva y rafa, maría y francisco manuel,
marta y álvaro, raquel y fran, rocío y juanje.

**T2. La página no tiene NINGÚN CTA.** Cero. Es un callejón sin salida en la
página más visitada después de la home.

**T3. Solo hay un encabezado en toda la página**, el H1 "Trabajos". Los títulos
de proyecto no son encabezados. Malo para estructura y para SEO.

**T4. El H1 es "Trabajos".** Sin keyword. Debería nombrar el servicio y la
ciudad.

**T5. Los filtros funcionan** (Todos / Bodas / Vídeo / Fotomatón / 360°, con
`aria-pressed`) pero no cambian la URL. Cada filtro debería ser una URL propia:
es tráfico de búsqueda regalado.

### /trabajos/[slug] — la página más débil

**P1. Cinco imágenes en total en una ficha de boda.** Las referencias premiadas
tienen entre 40 y 52 (Estudio Manzanero ~45, Ora Studio 52). Cinco fotos no
cuentan una boda.

**P2. No hay créditos de proveedores.** Verificado: ni finca, ni planner, ni
floristería, ni catering, ni maquillaje, ni vestido. Es el patrón A5 del
catálogo y lo que genera enlaces entrantes de las haciendas sevillanas.

**P3. No hay CTA de contacto.** Solo "Siguiente proyecto". El usuario que acaba
de enamorarse de una boda no tiene dónde escribir.

**P4. No hay lightbox.** No se puede ampliar ninguna foto.

**P5. Un solo encabezado.** Sin estructura interna.

**P6. No se nombra la finca.** "Bodas — 2026 — Sevilla" es correcto pero
genérico. El nombre del lugar es la credencial y la keyword a la vez.

### /contacto — la mejor página de la web

Lo que está bien: labels asociados correctamente a todos los campos,
`autocomplete` en nombre y email, FAQ con seis preguntas que atacan objeciones
reales (disponibilidad, reserva, plazos, desplazamiento, derechos, cambio de
fecha).

**K1. Ocho campos, cuatro obligatorios.** Cuanto más largo el formulario, más
abandono. Adovasio pide un solo campo cualificador.

**K2. "Presupuesto aproximado" como texto libre.** Es el campo que más abandono
provoca y el peor colocado en un posicionamiento premium. Sustituir por un
selector de cobertura al estilo Adovasio: 1 día / 2 días (cena de bienvenida +
boda) / 3 días. Cualifica igual, sin hablar de dinero.

**K3. No se declara plazo de respuesta.** Verificado: no aparece. Es el último
punto antes de convertir. "Respondemos en 48 h" cuesta una línea.

**K4. No hay teléfono ni WhatsApp.** Verificado: ninguno en toda la página. En
el mercado español, WhatsApp es esperado.

**K5. Falta `autocomplete` en seis campos.** Solo nombre y email lo tienen.

### Global

**G1. El pie de página lleva en TODAS las páginas el texto:**
`"Contenido de muestra — pendiente de sustitución por trabajo real de EME
Fotografía Sevilla."`
Está en producción, visible, en cada página. Es lo primero que hay que quitar.

**G2. No hay navegación visible en escritorio.** El header solo tiene el logo y
un botón "Menú". A 1440px no hay ni un enlace visible. Esconder el menú esconde
Contacto y Servicios, que son las páginas que convierten. Decisión a confirmar:
la recomendación es nav visible en escritorio, overlay solo en móvil.

---

# ORDEN DE TRABAJO

## Hoy, media hora, quita todo el aspecto de demo
  1. G1 — borrar el texto "Contenido de muestra" del footer
  2. H1 — contadores en cero: arreglar o eliminar
  3. H3 — sustituir los dos placeholders por fotos reales
  4. H4 — completar los dos alt vacíos
  5. C4 — añadir theme-color

## Esta semana, arregla lo que se ve
  6. A1 — arrancar el vídeo del hero (autoplay + play().catch())
  7. C1 — scrim vertical superior para la nav
  8. C2 y T2 — subtítulo del hero a 15-16px y opacidad 1
  9. T1 — unificar los tres tratamientos de H2 en una sola regla
 10. T3 — text-wrap: balance en el H1
 11. H2 — unificar los CTA en "Consultar disponibilidad"

## Después, la estructura
 12. T2 (trabajos) — CTA en /trabajos y en cada ficha de boda
 13. P1 — subir las fichas de boda de 5 a 30-40 fotos
 14. P2 — créditos de proveedores enlazados
 15. T1 (trabajos) — publicar las siete bodas reales
 16. K2, K3, K4 — cobertura en vez de presupuesto, plazo de respuesta, WhatsApp
 17. S1 y S2 — dos niveles de respiro entre secciones, desde tokens
 18. A3 — acortar duración y stagger de los reveals
 19. T5 (trabajos) — filtros con URL propia
 20. A4 — View Transitions entre índice y ficha
 21. G2 — decidir la navegación de escritorio

Verificación de cada punto: captura real a 390px y a 1440px, antes y después.
Y comprobar SIEMPRE con el viewport a tamaño real: con el panel oculto, el
viewport reporta 0x0 y todas las medidas salen falseadas.
