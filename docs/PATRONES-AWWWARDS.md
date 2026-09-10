# Catálogo de patrones — 12 webs de boda premiadas en Awwwards

Analizadas con lectura real de DOM y bundles JS, no de capturas.
Complementa a docs/REFERENCIA-ADOVASIO.md.

Webs estudiadas: Adovasio (SOTD), Vero New-York (SOTD + Developer Award),
Chapter by Milla Nova (SOTD + Developer Award), Avagyan Photo, Tatiana Braoun,
of Skin and Souls, Ora Studio, Estudio Manzanero, OBSESD, Taras Yareha,
Bottega 53, Untraditional Weddingfilms, Elke Van den Ende.

## Tres conclusiones que cambian el enfoque

**1. El stack que ya tenemos es el correcto.** OBSESD usa GSAP 3.14 + Lenis 1.2.3
exactamente igual que este proyecto. No hay que cambiar de librería. Lo que falta
es criterio, no herramientas.

**2. Las notas del jurado premian la animación y castigan la accesibilidad.**
Chapter saca 8.40 en Animations/Transitions y 6.60 en Accessibility. Vero saca
7.60 y 7.00. Para una fotógrafa que necesita salir en Google por "fotógrafo de
bodas Sevilla", ese intercambio NO nos sirve. Copiamos el criterio visual, no el
desprecio por el HTML semántico.

**3. Tres de las webs premiadas no usan ninguna librería de motion.**
Tatiana Braoun está hecha en Tilda y saca 9.1 de media, la nota más alta de todas
las analizadas. Estudio Manzanero es WordPress y saca 8.1. Lo que premian es la
composición tipográfica y el ritmo editorial. El efecto no es lo que sube la nota.

---

# BLOQUE A — Los patrones de mayor retorno

## A1. Índice de bodas como composición tipográfica
Origen: Estudio Manzanero (española, 8.1 de media). VERIFICADO.

El índice de trabajos no es una rejilla de tarjetas. Es una lista tipográfica:

    W1 MARINA + JOAN—MALLORCA 2025
    W2 CLARA + NARCISO—BARCELONA 2025
    W3 ANDREA + JAVI—CANTABRIA 2025

La numeración crea sensación de colección. El destino hace de narrativa sin
escribir un párrafo. Encabezado: "Todos nuestros proyectos".

Para nosotros, la finca es el destino:

    W1 RAQUEL + FRAN—HACIENDA DE ORÁN 2025
    W2 ANDREA + JESÚS—SEVILLA 2025

Implementación: CSS Modules puro. `font-variant-numeric: tabular-nums`,
letter-spacing amplio, `text-wrap: balance`. Reveal por fila con
`gsap.from(rows, {yPercent:100, stagger:0.06, scrollTrigger:{...}})` sobre un
contenedor con `overflow:hidden`.

Coste: BAJO. Impacto: ALTO. Es el patrón con mejor relación de toda la lista.

## A2. Ciudad y radio de acción DENTRO del titular del hero
Origen: of Skin and Souls y Estudio Manzanero. VERIFICADO.

OSAS pone como tipografía más grande del sitio:
  "VIDÉASTE DE MARIAGE À ANNECY (FRANCE) DISPONIBLE PARTOUT EN EUROPE"

Manzanero: "SPAIN BASED EDITORIAL WEDDING PHOTOGRAPHY".

Es SEO local convertido en decisión editorial. No va en el footer: va en el H1.

Para nosotros, y EN CASTELLANO (Manzanero escribe en inglés porque persigue novias
internacionales en Mallorca; nuestro mercado es andaluz):

  "Fotografía y vídeo de bodas en Sevilla · Andalucía y donde haga falta"

Coste: BAJO. Impacto: ALTO. Es obligatorio.

## A3. Ficha de boda: título editorial + scroll vertical largo
Origen: Estudio Manzanero (~45 fotos) y Ora Studio (52 fotos). VERIFICADO.

Cada boda abre con un titular de revista que NO nombra a la pareja. El de
Marina + Joan es "LOVE IN A WINERY". Después, 40-50 fotos en flujo vertical
continuo alternando verticales a sangre y horizontales a media anchura. Sin
rejilla rígida, sin contador, sin lightbox.

Implementación: array de imágenes con campo `span: 'full' | 'wide' | 'half'` y
CSS Grid con `grid-column` variable. `priority` solo en las dos primeras,
lazy en el resto. Paralaje ligero por imagen: `y: -8%` a `+8%` con `scrub: true`.

IMPORTANTE: el estado inicial del reveal se pone con `gsap.set` en JS, NUNCA en
CSS. Si el JS falla, el contenido tiene que verse igual.

Coste: BAJO-MEDIO. Impacto: ALTO.

## A4. Formulario multipaso conversacional en "vosotros"
Origen: Estudio Manzanero. VERIFICADO, copy literal.

Una pregunta por pantalla, tuteando en plural a la pareja:

  "¿Queréis saber más?" / "Hablemos"
  "Hola, ¿cómo os llamáis?"
  "¿Cuál es la fecha del evento?"
  "¿Dónde te casas?"
  "¿Cómo te enteraste de nosotros?"
  "Cuéntanos un poco sobre tu boda"

Sube la conversión frente al formulario-muro y cualifica el lead.

AVISO: Manzanero rompe la coherencia y salta a "acompañarle" en su FAQ.
Nosotros elegimos tuteo plural y no nos salimos de él en toda la web.

Implementación: índice de paso en estado local, transición con timeline de GSAP
o View Transitions. Autofoco en cada paso, Enter avanza, barra de progreso,
validación por paso.

Coste: MEDIO. Impacto: ALTO. Es lo más rentable en euros de todo el catálogo.

## A5. Créditos de proveedores nombrados y enlazados
Origen: Ora Studio. VERIFICADO.

Cada ficha de boda lleva relato cronológico del día (preparativos, ceremonia,
sesión, banquete) y créditos completos del equipo: planner, finca, floristería,
catering, con enlace real.

Es lo único que separa a Ora Studio de un WordPress cualquiera, y le valió el
Honorable Mention sin una sola animación destacable.

Para Sevilla: enlazar a las haciendas y wedding planners con los que trabaja
genera enlaces entrantes y recomendaciones cruzadas. Vale más que cualquier shader.

Coste: BAJO en código, MEDIO en redacción. Impacto: ALTO.

---

# BLOQUE B — Motion con criterio

## B1. El cableado canónico de Lenis + GSAP
Origen: OBSESD, código literal extraído de su bundle. VERIFICADO.

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    gsap.defaults({ ease: "power2.out", duration: 1.75 });
    ScrollTrigger.defaults({ toggleActions: "play none play reverse", start: "top bottom" });

Esto es lo primero que hay que verificar en nuestro SmoothScrollProvider. Si
`lenis.on('scroll', ScrollTrigger.update)` no está, los triggers no se recalculan
nunca y las animaciones se quedan a medias — que es exactamente el síntoma del
titular congelado en opacity 0.62 descrito en docs/DIAGNOSTICO-VISUAL.md.

Y en cada cambio de ruta: `lenis.scrollTo(0, {immediate:true})` + `ScrollTrigger.refresh()`.

## B2. Revelado declarativo: UN ScrollTrigger por sección, no por elemento
Origen: Elke Van den Ende. VERIFICADO en su bundle.

    ScrollTrigger.create({
      trigger: seccion, once: true,
      start: "top 90%", end: "bottom top",
      invalidateOnRefresh: true,
      onEnter: () => animaciones.forEach(a => a.play())
    });

Cada animación es una timeline PAUSADA. Un solo trigger por contenedor las
dispara todas. Con 126 imágenes en una ficha de proyecto, eso es la diferencia
entre 126 ScrollTriggers y 8.

Y todo envuelto en `gsap.matchMedia()`: por debajo del breakpoint móvil, las
animaciones se desactivan por completo y el contenido simplemente está ahí.
Añadir rama `(prefers-reduced-motion: reduce)` que no anima nada.

## B3. Hover que abre imágenes desde el centro
Origen: OBSESD, destacado por el jurado de Awwwards. Código literal:

    gsap.set(titleEls, { opacity: 0.5 });
    // onEnter:
    gsap.to(titleEls, { opacity: 1, duration: 1 });
    gsap.fromTo(mediaEls,
      { opacity: 0, clipPath: 'inset(50%)' },
      { opacity: 1, clipPath: 'inset(0%)', duration: 1, stagger: 0.3 });

Los títulos viven al 50% de opacidad; al pasar el cursor, tres imágenes se abren
simultáneamente desde el centro con 0,3 s de desfase.

Envuelto en `gsap.matchMedia("(min-width: 768px)")`. En móvil, la MISMA apertura
se dispara por ScrollTrigger con `stagger: 0.1`.

Coste: BAJO. Impacto: ALTO. Es el patrón de hover más elegante del catálogo.

## B4. Paralaje sutil con scroll-driven animations de CSS
Origen: Vero New-York (etiquetado "parallax scrolling").

Filas o columnas que avanzan a velocidades ligeramente distintas. Da profundidad
sin efecto llamativo.

Preferir CSS puro: `animation-timeline: view()`. Cero JS, corre en el compositor,
degrada a estático donde no hay soporte. Alternativa GSAP: ScrollTrigger con
`scrub: true` sobre `yPercent`.

Regla no negociable: mover solo `transform`. Nunca `top`.
Desplazamientos de 40 a 80 px como máximo. En cuanto se nota, parece plantilla.

## B5. Preloader corto que aterriza en el logo
Origen: Estudio Manzanero. Awwwards lo destaca como su pieza principal.

Las letras del nombre entran escalonadas a tamaño grande y centrado; al acabar
la carga, el bloque escala y viaja hasta la posición exacta del logo de la nav,
donde se sustituye por el logo real. Cero parpadeo entre estados. La marca nunca
"aparece", solo cambia de tamaño.

Implementación: medir la caja final con `getBoundingClientRect()`, animar con
GSAP Flip o transform calculado a mano. `lenis.stop()` durante la secuencia.

CONDICIONES INNEGOCIABLES:
  - Máximo 1,5 s. Un preloader de 4 s en una web de bodas es fuga de clientes.
  - Tope de tiempo absoluto: si los assets no llegan en 2,5 s, se revela igual.
  - Flag en sessionStorage: no se repite en cada navegación.

Coste: MEDIO. Impacto: ALTO percibido.

---

# BLOQUE C — Foto y vídeo mezclados (crítico para este proyecto)

Somos un estudio de foto Y vídeo, más fotomatón y 360°. Este bloque es el que
más nos diferencia.

## C1. Tile agnóstico al medio
Origen: Bottega 53 (198 img + 2 video = 200 tiles idénticos) y Untraditional
Weddingfilms. VERIFICADO.

Una única celda de rejilla que renderiza foto, vídeo, 360° o fotomatón sin
cambiar nada del contenedor, la retícula ni el hover.

    <a className={s.tile} data-type={type}>
      <div className={s.inner}>
        {type === 'video'
          ? <VideoTile src={src} poster={poster} width={w} height={h}/>
          : <Image src={src} alt={alt} fill sizes="(max-width:768px) 50vw, 25vw"/>}
      </div>
      <div className={s.info}>{nombres}</div>
    </a>

Todo el estilo vive en el CSS Module del wrapper, nunca en img/video.
Bottega 53 tiene "film" como un filtro más junto a "black & white", "bride",
"details", "editorial".

Sin este patrón, "fotomatón", "360°" y "vídeo" acaban siendo tres componentes
divergentes. Con él, añadir el 360° es una fila de datos.

Coste: BAJO. Impacto: FUNDACIONAL. Es lo primero de este bloque.

## C2. Vídeo perezoso CON DESCARGA al salir
Origen: Untraditional Weddingfilms. Código extraído de su main.js. VERIFICADO.

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !video.hasAttribute("data-loaded")) loadVideo(video);
        else if (!entry.isIntersecting && video.hasAttribute("data-loaded")) unloadVideo(video);
      });
    }, { rootMargin: "200px 0px", threshold: 0.1 });

    // unloadVideo — la mitad que casi nadie implementa:
    video.pause();
    source.removeAttribute("src");
    video.removeAttribute("data-loaded");
    video.load();               // libera búfer y decodificador

`<video>` NO tiene `loading="lazy"`: ese atributo es solo de img e iframe. Hay
que hacerlo a mano con IntersectionObserver + data-src.

La descarga importa: cada `<video>` con búfer retiene decenas de MB y un
decodificador. iOS limita los decodificadores simultáneos y, pasado el límite,
`play()` empieza a fallar en silencio.

Usar IntersectionObserver, no ScrollTrigger: es más barato y no depende de Lenis.

Coste: MEDIO. Impacto: OBLIGATORIO si mezclamos decenas de piezas de vídeo.

## C3. Caja de aspecto derivada de los metadatos
Origen: Untraditional Weddingfilms (paddingBottom calculado) y Elke Van den Ende.

    .inner { aspect-ratio: var(--ar, 16 / 9); overflow: hidden; }
    <div className={s.inner} style={{ '--ar': `${w} / ${h}` }}>

Guardar width/height en el contenido junto al fichero. CLS cero aunque el medio
tarde. Con piezas 16:9 (vídeo), 4:5 (foto), 1:1 (fotomatón) y vertical (360°)
conviviendo, esto es lo que impide que la rejilla salte.

Coste: BAJO. Impacto: ALTO.

## C4. Hover en escritorio, autoplay en móvil
Origen: Untraditional Weddingfilms. VERIFICADO atributo a atributo: la variante
desktop NO lleva autoplay, la móvil SÍ.

En escritorio la rejilla está quieta y respira; al pasar el cursor, la pieza
cobra vida. En móvil, donde no hay hover, se reproduce al entrar en pantalla.

Usar la media query `(hover: hover) and (pointer: fine)`, NO el ancho: un iPad
Pro es ancho y no tiene hover.

El poster debe ser un fotograma REAL del clip. Si es una foto distinta, el salto
al reproducir se nota.

Un loop de 3 s de fotomatón o un barrido 360° al hover vende el servicio mejor
que cualquier texto.

Coste: BAJO-MEDIO. Impacto: ALTO para nuestro caso.

## C5. Art direction nativa: master horizontal y master vertical
Origen: Untraditional Weddingfilms. VERIFICADO: sirven ficheros 16:9 en desktop
y montajes verticales 4:5 recortados a propósito en móvil.

    <video muted loop playsinline preload="metadata" poster="/posters/boda-vertical.jpg">
      <source src="/v/boda-1080-169.mp4" type="video/mp4" media="(min-width: 768px)">
      <source src="/v/boda-720-45.mp4"   type="video/mp4" media="(max-width: 767px)">
    </video>

El móvil no recibe un 16:9 encogido: recibe un montaje vertical hecho a propósito,
servido por el navegador sin JS.

AVISO: `<source media>` solo se evalúa al cargar. Si el usuario gira el móvil no
se reevalúa. Solución en React: una `key` en el `<video>` ligada al breakpoint
para forzar el remontaje.

Coste: BAJO en código, MEDIO en producción (cada pieza se exporta dos veces).
Impacto: MUY ALTO. Nuestras clientas ven la web en el móvil, y el 4:5 vertical
es el formato nativo de todo lo que ya publicamos en Instagram.

---

# BUENAS PRÁCTICAS DE VÍDEO — obligatorio leer antes de tocar el hero

## Los atributos que nunca faltan

`muted loop playsinline` siempre. Untraditional añade `webkit-playsinline` para
iOS antiguo. Sin `muted`, ningún navegador reproduce solo. Sin `playsInline`,
iPhone abre el vídeo a pantalla completa y destroza la rejilla.

En React, `muted` como prop es POCO FIABLE: React lo asigna como propiedad y
puede llegar tarde. Ponerlo también de forma imperativa:

    <video ref={r} muted playsInline loop preload="metadata" poster={poster} />
    useEffect(() => { ref.current.muted = true; }, []);

Bottega 53 ilustra el fallo exacto: su `<video>` no tiene atributo `muted` en el
HTML, solo la propiedad puesta por Vue. Es frágil.

## poster no es opcional

Untraditional lo pone en la rejilla del archivo y NO lo pone en los vídeos de la
home, y se nota como marcos negros mientras carga. Bottega 53 tampoco lo pone.
Poner siempre poster, fotograma real del clip, en WebP o AVIF, al ancho
renderizado.

## preload calibrado por posición

  hero:            preload="auto"  (o ni eso)
  resto:           preload="metadata"
  rejilla larga:   preload="none" con src diferido (C2)

Ocho vídeos con preload="auto" en la home, como tiene Untraditional, es su punto
débil: descarga en paralelo antes de que el usuario decida nada.

## Formatos

Las tres webs con vídeo sirven SOLO MP4/H.264. Es pragmatismo: se decodifica por
hardware en todas partes y no calienta el móvil.

  - H.264 baseline/main, MP4 con faststart (moov atom al principio). Sin
    faststart el navegador descarga el fichero entero antes de mostrar nada.
  - WebM/VP9 solo si el ahorro compensa. Para clips de 5-15 s no compensa.
  - Peso objetivo: <= 1,5 MB por preview de rejilla, <= 4 MB por pieza de hero.
  - Previews de rejilla SIN pista de audio: reduce tamaño y elimina el problema
    de política de autoplay.

## Cuando el navegador rechaza play()

`play()` devuelve una promesa que RECHAZA (NotAllowedError por política de
autoplay, AbortError si pausas antes de que resuelva). Las tres webs con vídeo
envuelven todas sus llamadas en `.catch()`. Lo mínimo:

    const p = v.play();
    if (p !== undefined) {
      p.catch(err => {
        if (err.name === 'NotAllowedError') {
          v.muted = true;
          v.play().catch(() => mostrarPoster());
        }
      });
    }

REGLA DE ORO: el poster tiene que ser un estado final aceptable. Si el vídeo
nunca llega a reproducirse (ahorro de datos, batería baja en iOS,
prefers-reduced-motion), la página tiene que verse bien igual.

Esto es exactamente lo que falla hoy en nuestro hero: videoPaused true,
videoTime 0, sin autoplay y sin catch.

## Desbloqueo por gesto

Solo un `play()` originado en un gesto de usuario puede llevar sonido.
Untraditional reproduce y pausa a los 500 ms todos los vídeos tras el primer
gesto, para "pre-autorizarlos":

    const unlock = async () => {
      for (const v of document.querySelectorAll('video[data-unlock]')) {
        try { await v.play(); setTimeout(() => v.pause(), 300); } catch {}
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });

Después, un botón de sonido explícito puede hacer `v.muted = false`.
NO arrancar audio automáticamente: para un estudio de Sevilla eso solo genera
fricción.

## Movimiento reducido

Ninguna de las cinco webs con vídeo respeta prefers-reduced-motion. Es un fallo
de las cinco. Nosotros sí:

    @media (prefers-reduced-motion: reduce) {
      .tile video { display: none; }
      .tile .poster { display: block; }
    }

Y no llamar a play() si `matchMedia('(prefers-reduced-motion: reduce)').matches`.

## Transiciones de ruta

Al salir de una ruta, pausar todos los vídeos y poner currentTime = 0. Si no, en
una SPA los vídeos siguen decodificando en páginas que ya nadie ve.

## Piezas largas

Loops cortos autoalojados en la rejilla. Para el vídeo completo de la boda o un
lightbox de 4 minutos, streaming adaptativo (Mux, Cloudflare Stream, Vimeo) con
HLS y `controls`. Un MP4 progresivo de 4 minutos no se adapta a una conexión mala.

---

# LO QUE NO VAMOS A COPIAR

**La rejilla de Bottega 53 con 200 tiles posicionados por JS frame a frame.**
Impresiona, pero es JS en el hilo principal en cada frame, no responde a Ctrl+F,
y tienen un overlay que pide al usuario que gire el móvil, que es una rendición.
Con CSS Grid + `content-visibility: auto` + C2 se consigue el 85% del efecto por
el 15% del coste.

**El scroll infinito de Avagyan.** Tiene un problema serio para nosotros: mata el
footer, y en el footer está el formulario de contacto. Avagyan puede permitírselo
porque vende por Instagram. Nosotros vivimos del formulario. Carga infinita
DENTRO de una galería de boda, sí; paginación normal en el índice, también sí.

**El menú overlay en escritorio.** Vero saca 7.09 en usabilidad y Chapter 6.60 en
accesibilidad, y el overlay es parte del motivo. Esconder el menú esconde
Contacto y Servicios, que son las páginas que convierten.
Decisión: header visible siempre en escritorio, overlay solo en móvil.

**El visualizador de audio de Untraditional.** Es genial porque su producto es el
ritmo y el sonido. El nuestro es más amplio. Un botón de sonido explícito basta.

**El WebGL de Taras Yareha.** Distorsión de imagen por velocidad de scroll con
shaders OGL. Espectacular y completamente desproporcionado para el objetivo.

---

# ORDEN DE APLICACIÓN SUGERIDO

  1. B1  — verificar el cableado Lenis + ScrollTrigger (probable causa del bug
           del titular congelado)
  2. A2  — ciudad en el H1 del hero
  3. C1  — tile agnóstico al medio
  4. C3  — aspect-ratio desde metadatos
  5. Buenas prácticas de vídeo — arreglar el hero
  6. A1  — índice de bodas tipográfico
  7. A3  — ficha de boda con scroll largo
  8. B2  — revelado declarativo, un trigger por sección
  9. C2 y C4 — vídeo perezoso y hover/autoplay
 10. C5  — masters vertical y horizontal
 11. A5  — créditos de proveedores
 12. A4  — formulario multipaso
 13. B3  — hover de apertura desde el centro
 14. B4  — paralaje sutil
 15. B5  — preloader (el último, y solo si todo lo demás está)
