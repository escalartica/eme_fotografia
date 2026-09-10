# Diagnóstico de localhost:3000

Revisión en navegador real, 1 de septiembre de 2026, viewport 1280x720.
Todos los valores de abajo están MEDIDOS con getComputedStyle, no estimados.

CORRECCIÓN a la versión anterior de este documento: dije que todo lo que había bajo
el hero quedaba invisible. ERA FALSO. Fue un artefacto de captura del panel del
navegador. Todas las secciones están en opacity 1, transform none, visibility visible,
y las imágenes cargan. Ese "bloqueante 1" no existe. Ignórese.

## Lo que está bien. No tocar

- El copy tiene voz propia: "No contamos bodas. Contamos historias con fecha."
- Los alt son descriptivos y en castellano: "Los novios celebrando de pie en un coche
  descapotable clásico frente a un edificio señorial". Muy por encima de la media.
- viewport correcto: "width=device-width, initial-scale=1". SIN maximum-scale=1.
  (Adovasio sí lo lleva y por eso incumple WCAG. Aquí está bien.)
- lang="es" presente. Un solo H1. Jerarquía de encabezados limpia.
- El hero SÍ tiene scrim: un linear-gradient. El problema es su ángulo, no su ausencia.
- Los testimonios son reales y verificables (Bodas.net).
- Las secciones revelan al hacer scroll con opacidad y translateY. El mecanismo funciona.

---

## BUG 1 — El titular del hero nunca llega a opacidad completa

Medido en reposo, con scrollY = 0, tras esperar 1,8 s:

    h1 (contenedor)      opacity: 1
    linea "EME"          opacity: 0.8829
    linea "Fotografía Sevilla"  opacity: 0.6203

Las líneas del H1 se quedan CONGELADAS a mitad de la animación de entrada. La segunda
línea del titular principal se ve al 62%. Esto es exactamente lo que hace que el hero
parezca lavado y barato.

No es un problema de diseño. Es una animación que no termina.

Dónde mirar: components/sections/Hero.tsx y el ScrollReveal / timeline que anima las
líneas. Probable causa: el tween nunca llega a su estado final (falta un onComplete,
un clearProps, o el trigger se recalcula y reinicia). Skills: gsap-timeline, gsap-core.

## BUG 2 — El vídeo del hero está parado

    videoPaused: true
    videoTime: 0
    autoplay (atributo): false
    muted: true, loop: true, poster: presente
    src: /videos/previews/real-boda-01-full.mp4

El hero es un vídeo que nunca arranca. Se está viendo un fotograma congelado del
segundo cero. De ahí la sensación de foto mal elegida: no es una foto, es un vídeo
parado.

El elemento no tiene autoplay, así que depende de un play() por JS que no se ejecuta,
o que el navegador rechaza. Para autoplay silencioso hacen falta muted + playsInline
+ autoplay, y capturar la promesa de play() por si el navegador la rechaza.

## BUG 3 — El scrim no cubre donde está la navegación

    overlay: linear-gradient(20deg,
               rgba(17,20,24,0.72)  0%,
               rgba(17,20,24,0.32) 32%,
               rgba(17,20,24,0)    60%)

A 20 grados, la zona oscura queda abajo a la izquierda. A partir del 60% el degradado
es totalmente transparente. Y arriba a la derecha, que es donde vive el botón de menú,
NO HAY NADA DE SCRIM.

    botón "Menú": color rgb(247,245,242) sobre pared blanca sin oscurecer.

Resultado: el control de navegación es invisible. Es el fallo de accesibilidad más
serio de la home: no es que se lea mal, es que no se ve.

Arreglo: además del degradado diagonal actual, añadir un segundo degradado vertical
desde arriba (rgba(17,20,24,0.45) -> transparente en 180px) que proteja la barra
superior sea cual sea la imagen o el fotograma de vídeo.

## BUG 4 — Frase duplicada

"No contamos bodas. Contamos historias con fecha." aparece DOS veces en el texto de
la home. Verificado: 2 ocurrencias exactas.

## BUG 5 — Los contadores muestran cero

Sección Confianza, texto literal renderizado:

    "0 | me gusta en Facebook | 0 | seguidores en Instagram"

Un contador animado parado en cero comunica que el estudio no tiene audiencia. Es
peor que no tener la sección. O se conecta a un dato real, o se sustituye por cifras
que se puedan sostener (bodas fotografiadas, años, reseñas verificadas en Bodas.net),
o se elimina.

## BUG 6 — Assets placeholder en producción

    /images/trabajos/gala-empresa-fotomaton-360/placeholder-cover.webp
    /images/sobre-nosotros/placeholder-team.webp

Hay siete bodas reales con fotos en la carpeta "fotos eme" del repositorio padre.
No hay razón para que dos tarjetas visibles en la home usen placeholders.

---

## PROBLEMAS DE DIRECCIÓN, no bugs

### El subtítulo del hero es demasiado pequeño

    font-size: 12.32px, letter-spacing: 1.72px, opacity: 0.85

12 px con tracking amplio y al 85% de opacidad, sobre vídeo. Es la línea que posiciona
el estudio entero ("con la mirada de un editorial de moda") y es la menos legible de
la página. Subir a 14-16 px y a opacidad 1.

### No hay navegación visible en escritorio

El header solo contiene el logo y un botón "Menú". A 1280 px de ancho no hay ni un
solo enlace visible.

Es una decisión defendible (Adovasio también usa overlay), pero Adovasio SÍ muestra
Portfolio / About / Contact en escritorio y reserva el overlay para el menú completo.
Esconder toda la navegación tras un botón en escritorio cuesta clics. Decisión a
confirmar con el usuario, no a cambiar por cuenta propia.

### Dos CTAs distintos compitiendo

    "Conocer el estudio"
    "Empezar un proyecto"

Ninguno es el CTA de disponibilidad. Unificar en uno solo, repetido 3-4 veces por
página: "Consultar disponibilidad". El ángulo es la fecha libre, no el precio.
El texto de cierre actual, "Cuéntanos tu fecha y hagamos que se recuerde", ya apunta
en la dirección correcta: mantener ese ángulo.

### El title de la home no tiene keywords

    title: "EME Fotografía Sevilla"

No compite por ninguna búsqueda. El patrón del sector es
"Fotógrafo de bodas en Sevilla | [Marca]". La meta description sí está bien.

### Falta theme-color

No hay meta theme-color. Adovasio usa #242d23 y tiñe la barra de estado en móvil.
Detalle barato con efecto premium.

### Escala de reveal demasiado lenta

Con tres tarjetas de Trabajos simultáneamente en pantalla se midieron opacidades de
0.64, 0.44 y 0.17 a la vez. El escalonado es tan largo que el usuario ve contenido
al 17% mientras ya está mirándolo. Acortar duración y stagger.

---

## ORDEN DE TRABAJO

  1. BUG 1 — titular congelado al 62%. Es lo que más abarata la primera impresión.
  2. BUG 2 — arrancar el vídeo del hero.
  3. BUG 3 — scrim superior para la navegación.
  4. BUG 5 y 6 — contadores y placeholders. Son cinco minutos y quitan aspecto de demo.
  5. BUG 4 — frase duplicada.
  6. Subtítulo del hero: tamaño y opacidad.
  7. Unificar CTA.
  8. Title de la home con keyword.
  9. Ajustar duración y stagger de los reveals.

Verificación de cada punto: captura real a 390 px y a 1440 px, antes y después.
