# Referencia de dirección: adovasio.it

Auditoría de https://www.adovasio.it/ (Site of the Day en Awwwards, nota más alta en
Animations/Transitions: 8.20/10) para usar como norte visual de eme_fotografia.

## 0. Lo primero, porque cambia el enfoque

La web actual parece una plantilla. La solución NO es añadir más efectos.

Adovasio no tiene parallax por todas partes. Tiene lo contrario: vacío, tipografía
enorme, y tres o cuatro momentos de animación muy caros y muy bien ejecutados.
Su sensación premium viene de la CONTENCIÓN, no de la acumulación.

Añadir parallax, contadores y reveals a cada sección es exactamente lo que hace que
una web parezca plantilla de 2015. La regla de trabajo es:

  Menos efectos, mejor ejecutados, en menos sitios.

## 1. Stack de Adovasio (verificado)

- Next.js sobre Vercel
- DatoCMS + Imgix para imágenes (auto=format -> AVIF/WebP negociado)
- GSAP para motion
- Cero scripts de terceros: sin analítica, sin chat, sin GTM, sin píxeles

Nota: eme_fotografia ya usa GSAP + Lenis. El stack de motion coincide.
No hay que cambiar nada de infraestructura. El problema es de dirección, no de librerías.

## 2. Los cuatro momentos de animación que definen el sitio

1. PRELOADER con contador numérico animado dígito a dígito.
   Es lo primero que ve el visitante y establece el tono. Riesgo: penaliza el LCP.
   Solo la primera visita de la sesión, con sessionStorage.

2. TRANSICIÓN ENTRE PROYECTOS. Al pasar de una boda a la siguiente, la página
   transiciona en vez de recargar. Es lo más premiado del sitio.
   En eme: View Transitions API entre /trabajos y /trabajos/[slug], con la imagen
   compartida como elemento de continuidad.

3. MENÚ OVERLAY a pantalla completa, animado.

4. FILTROS DE GALERÍA con animación de reordenado.

Fuera de esos cuatro momentos, el sitio es quieto. Los reveals al hacer scroll son
sutiles y escalonados, no protagonistas.

## 3. Arquitectura: simplicidad agresiva

- Tres entradas de menú: Portfolio, About, Contact. Nada más.
- La HOME ES EL PORTFOLIO. No hay página índice intermedia.
- 11 bodas en un grid, sin paginación, sin "cargar más".
- Cada ficha de boda enlaza SOLO a la anterior y la siguiente, en bucle cerrado.
  Desde una boda solo puedes hacer dos cosas: ver otra boda, o contactar.

## 4. Anatomía de una ficha de boda (copiar esta estructura)

  Nombres de la pareja
  -> UN SOLO párrafo narrativo de 3-5 frases (no más)
  -> Ficha de datos: Lugar / Localidad / Formato
  -> Galería
  -> Créditos de proveedores (rol: nombre)
  -> Anterior / Siguiente
  -> CTA de cierre

El "Formato" es comercial, no descriptivo: "Boda (1 día)", "Boda 2 días",
"Boda 3 días". Cualifica al lead sin hablar de dinero.

## 5. Conversión

Un solo CTA en toda la web, repetido 3-4 veces por página, siempre con el mismo texto.

  "Check availability"

Y el bloque de cierre, en TODAS las páginas:

  "Your story deserves timeless images. Reach out to see if your date is available."

El ángulo es la ESCASEZ DE FECHA. No el precio, no la calidad. Adaptación al español:
"Consultar disponibilidad" / "Cada boda merece imágenes que duren. Escríbenos para
ver si tu fecha está libre."

Cero precios en todo el sitio. Ninguna web de gama alta revisada los publica
(Greg Finck, KT Merry, Corbin Gurkin, Santucci, Two Mann, Anée Atelier).

El formulario incluye un campo cualificador obligatorio de cobertura (1/2/3 días).

## 6. Copy: tono y estructura

  Hero:    "Weddings that never fade"
           "Capturing your love's legacy with an elegant, editorial, and Italian flair."
  About:   "Crafted With Flair" / "A Legacy Woven in Love"

El titular son tres o cuatro palabras que prometen permanencia. El subtítulo hace todo
el posicionamiento en una línea. Nada de "capturamos momentos únicos e irrepetibles".

Prueba social: NO hay logos de prensa ni premios. La autoridad la construyen los
nombres de los venues (Villa Cetinale, Villa Cimbrone, Il Borro, Belmond Caruso).
En eme, el equivalente son las fincas y haciendas reales donde se ha trabajado.

## 7. Detalles de oficio que sí merece copiar

- theme-color oscuro y con matiz, no negro puro. Adovasio: #242d23 (verde oliva muy
  oscuro). Tiñe la barra de estado del navegador en móvil.
- Alt descriptivos de verdad: "Ceremonia judía en el Belmond Hotel Caruso, Ravello,
  con vistas a la Costa Amalfitana." No keyword stuffing.
- meta name="pinterest" content="nopin" para bloquear el guardado de las fotos.
- Sin scripts de terceros. Es media victoria de rendimiento.

## 8. Sus fallos. NO heredar ninguno de estos

- /portfolio devuelve 404. La entrada del menú apunta a la home.
- viewport con maximum-scale=1 -> bloquea el zoom en móvil. Incumple WCAG 2.1 AA
  (criterio 1.4.4). Verificar que app/layout.tsx NO lo lleva.
- alt="Alt text" sin rellenar, en producción.
- Un <title> empieza por "ntimate": se perdió la I.
- Dos fichas de boda usan el title genérico por defecto en vez del patrón optimizado.
- Alice & Tom: el title dice Venecia y el campo Location dice Lago di Como.
- Los 7 testimonios están huérfanos en /about: sin foto, sin fecha, sin enlace a la
  boda que describen. En eme deben ir enlazados a su boda.
- Galerías probablemente sin alt.
- NO TIENE PÁGINAS DE DESTINO. Cuatro de sus once bodas son en Ravello y no existe
  ninguna página de localización. Es su mayor hueco y la ventaja más barata de todas.

## 9. Referencias secundarias

  gregfinck.com                              portfolio geoetiquetado por destino
  ktmerry.com                                logos de prensa en portada + Journal
  corbingurkin.com                           separa editorial de bodas, publica teléfono
  photosantucci.com                          navegación con vocabulario propio
  twomann.com                                prueba social cuantificada en portada
  aneeatelier.com                            inspirado en webs de arquitectura, no de foto
  jules-photographer.com/lake-como-weddings/ la mejor página de destino: 11 villas nombradas

Dato de contexto: en Awwwards no hay ningún fotógrafo de bodas premiado reciente salvo
un nominado de 2015. El sector no compite en diseño web. Ese es el hueco.
