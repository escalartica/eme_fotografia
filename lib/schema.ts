import { site } from '@/content/site';
import { services } from '@/content/services';
import type { FaqEntry, Project } from '@/content/types';
import { perteneceA } from '@/lib/project-filter';

const SITE_URL = site.siteUrl;

const SCHEMA_CONTEXT = 'https://schema.org';

/**
 * Los dos anclas del grafo. Cada nodo se describe UNA vez y el resto lo
 * referencia por `@id` (el `publisher` del WebSite, el `provider` de cada
 * oferta, el `author` de cada reportaje). Repetir el negocio entero en cada
 * bloque obliga a Google a reconciliar copias que pueden divergir; una sola
 * definición y referencias es lo que no diverge nunca.
 */
const BUSINESS_ID = `${SITE_URL}/#eme`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Provinces the studio names on the FAQ page; keeps schema and copy aligned. */
const AREA_SERVED = ['Sevilla', 'Cádiz', 'Huelva', 'Córdoba', 'Málaga', 'Granada', 'Jaén', 'Almería'].map((name) => ({
  '@type': 'AdministrativeArea',
  name,
}));

/**
 * Las cinco ediciones ganadas de los Wedding Awards de Bodas.net, una por
 * insignia real en `public/images/trust/` (wedding-awards-2019, -2021, -2022,
 * -2023 y las dos de 2025), que son las mismas que Testimonios.tsx enseña en
 * la página.
 *
 * Se escriben año a año y NUNCA como rango: faltan 2020 y 2024, así que
 * "2019-2025" o "cinco años consecutivos" serían dos premios inventados. Un
 * `award` es una afirmación comprobable contra el perfil de Bodas.net, y ese
 * es el listón de este sitio.
 */
const WEDDING_AWARD_YEARS = [2019, 2021, 2022, 2023, 2025];

/**
 * Fotografías reales del trabajo como imagen del negocio.
 *
 * `image` apuntaba a /images/og/default.jpg, que es el logotipo sobre el fondo
 * de marca (ver DEFAULT_OG_IMAGE en lib/seo.ts): correcto como tarjeta para
 * compartir un enlace sin foto propia, y engañoso como la imagen de lo que
 * hace este estudio, porque le enseña a Google un logotipo donde espera el
 * trabajo. El logotipo sigue estando, en `logo`, que es su sitio.
 *
 * Tres reportajes distintos y tres proporciones distintas -- 2:3 vertical, 3:2
 * apaisada y el recorte 1,91:1 -- porque Google recorta él mismo cuando solo
 * le das una forma, y el recorte automático de un vertical a una banda ancha
 * se come la mitad de la fotografía. Las tres rutas existen en public/ y las
 * medidas están leídas con ffprobe sobre el fichero, no deducidas del nombre.
 */
const BUSINESS_IMAGES = [
  `${SITE_URL}/images/trabajos/carmen-y-alberto/cover.webp`, // 1333x2000
  `${SITE_URL}/images/trabajos/virginia-y-jorge/cover.webp`, // 2000x1333
  `${SITE_URL}/images/trabajos/gloria-y-andres/cover-og.jpg`, // 1200x630
];

/**
 * The business, once, on every page. A LocalBusiness (no "Photographer"
 * type exists in schema.org) with the offer catalogue, the areas served
 * and the Bodas.net rating -- the same figures Cifras.tsx prints on the
 * page, which is what Google requires for a rating to be eligible.
 *
 * NO lleva `openingHoursSpecification` ni `geo`, y es una decisión, no un
 * olvido. El estudio no tiene local abierto al público (trabaja sobre
 * desplazamiento, ver .agents/product-marketing.md), así que un horario aquí
 * sería un horario de puertas que no existen -- y Google lo publica tal cual
 * en el panel de la derecha, con lo que la primera consecuencia sería una
 * pareja plantada en la calle Alicante un martes por la tarde. Las
 * coordenadas, igual: nadie ha confirmado un punto exacto y `geo` inventado
 * mueve el negocio de sitio en el mapa.
 */
function localBusinessNode() {
  return {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': BUSINESS_ID,
    name: site.brandName,
    alternateName: 'EME Fotografía',
    slogan: 'No contamos bodas. Contamos vuestra historia.',
    description:
      'Fotógrafo y vídeo de bodas en Sevilla y toda Andalucía. Cinco especialistas en foto y vídeo dirigidos por eme (María Leal): reportajes de boda con mirada editorial, color de cine y planos aéreos, en tierra y desde el aire.',
    url: SITE_URL,
    image: BUSINESS_IMAGES,
    logo: `${SITE_URL}/images/logo/eme-mark-square.png`,
    email: site.email,
    telephone: `+${site.whatsappNumber}`,
    founder: { '@type': 'Person', name: site.founderName, jobTitle: 'Fotógrafa y directora' },
    // El equipo permanente que se publica entero en /sobre-nosotros con
    // nombre y retrato: eme, Rafa, Raúl, Antonio y Manuel. Cinco personas
    // contadas, no una estimación de plantilla.
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 5 },
    // Solo la moneda, que es un dato del negocio y no una tarifa. Aquí había
    // además una banda de precio `'€€'`, y se ha retirado: la regla del
    // estudio es que no se publican precios "ni tarifas, ni horquillas", y esa
    // banda Google la puede enseñar en el resultado de búsqueda sin que nadie
    // del estudio la haya aprobado. Es justo la conversación que el estudio
    // quiere tener por teléfono, no en una ficha de Google.
    currenciesAccepted: 'EUR',
    award: WEDDING_AWARD_YEARS.map((year) => `Wedding Award ${year} de Bodas.net`),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.streetAddress,
      addressLocality: site.addressLocality,
      addressRegion: 'Sevilla',
      postalCode: site.postalCode,
      addressCountry: site.addressCountry,
    },
    areaServed: AREA_SERVED,
    knowsLanguage: 'es',
    sameAs: [site.instagramUrl, site.facebookUrl, site.tiktokUrl, site.bodasNetUrl],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: site.bodasNetRating,
      bestRating: 5,
      reviewCount: site.bodasNetReviewCount,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de boda',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          description: s.tagline,
          url: `${SITE_URL}${s.route}`,
          areaServed: AREA_SERVED,
          provider: { '@id': BUSINESS_ID },
        },
      })),
    },
  };
}

/**
 * El sitio como entidad, que es lo que faltaba en el grafo.
 *
 * Sin un nodo WebSite, el `publisher` del sitio no está declarado en ninguna
 * parte y Google tiene que inferir de quién es la web a partir del negocio
 * suelto. Con él, la cadena queda explícita: este sitio lo publica ESTE
 * negocio, y `alternateName` recoge la forma corta con la que la marca se
 * nombra a sí misma en la mitad del copy ("EME Fotografía").
 *
 * NO lleva `potentialAction`/SearchAction, deliberadamente. Ese bloque
 * declara un buscador interno y una URL de resultados, y esta web no tiene
 * buscador: marcar uno es prometer una página que no existe, que es
 * exactamente la clase de dato no comprobable que este proyecto no publica.
 * El día que haya /buscar?q=, se añade.
 */
function webSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: site.brandName,
    alternateName: 'EME Fotografía',
    inLanguage: 'es-ES',
    publisher: { '@id': BUSINESS_ID },
  };
}

/** El negocio suelto, con su `@context`. Se mantiene exportado porque es la
 *  unidad que comprueban los tests y la que consumiría cualquier página que
 *  necesite el nodo por separado. */
export function localBusinessSchema() {
  return { '@context': SCHEMA_CONTEXT, ...localBusinessNode() };
}

/** El sitio suelto, con su `@context`. Misma razón. */
export function webSiteSchema() {
  return { '@context': SCHEMA_CONTEXT, ...webSiteNode() };
}

/**
 * Los dos nodos en un solo `@graph`, que es lo que emite el layout.
 *
 * Dos `<script type="application/ld+json">` separados obligan a Google a
 * juntar por su cuenta dos documentos que hablan del mismo sitio; un `@graph`
 * los entrega ya relacionados, con el `@id` del negocio resuelto dentro del
 * mismo bloque en el que se referencia. Es además un `<script>` menos en cada
 * página del sitio.
 */
export function siteGraph() {
  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [localBusinessNode(), webSiteNode()],
  };
}

/**
 * La ficha de un reportaje.
 *
 * VIDEOOBJECT: solo con fecha de subida REAL.
 *
 * Esta función emitía `uploadDate: `${project.year}-01-01`` para cada
 * reportaje de vídeo, es decir, el 1 de enero del año de la boda. Ninguno de
 * esos vídeos se publicó ese día: la fecha estaba fabricada para rellenar un
 * campo que Google exige, y `uploadDate` es el dato con el que Google ordena
 * y fecha el vídeo en los resultados. Una fecha inventada no es un marcado
 * incompleto, es un marcado falso, y encima uno que se enseña.
 *
 * Mientras no haya fecha (`project.videoUploadDate`, pendiente del estudio),
 * el reportaje de vídeo se marca como `CreativeWork`: cierto, útil como
 * entidad y sin ningún campo obligatorio que haya que inventar. No como
 * `ImageGallery`, que sería mentir en la otra dirección sobre una página cuyo
 * contenido principal es una pieza de vídeo. En cuanto el estudio confirme
 * la fecha de publicación de cada vídeo, rellenar `videoUploadDate` en
 * content/projects.ts basta para que vuelva a emitirse el VideoObject
 * completo, con `contentUrl` y `duration`, sin tocar esta función.
 *
 * (El descubrimiento de esos vídeos no se queda esperando a ese dato: la
 * extensión de vídeo del sitemap NO exige fecha de subida y ya los lista con
 * póster y duración medida. Ver app/sitemap.ts.)
 */
export function creativeWorkSchema(project: Project) {
  const imageSrc = project.cover.type === 'image' ? project.cover.src : project.cover.poster;
  // `perteneceA`, no `===`: Virginia y Jorge lleva etiqueta de Fotos (son
  // dieciséis fotografías frente a cuatro clips) pero abre con el tráiler y
  // tiene película entregada. Con la comparación estricta dejaba de emitir su
  // VideoObject el día que se le corrigió la etiqueta, y eso es perder un
  // resultado enriquecido en Google por un cambio de rótulo.
  const isVideoPage = perteneceA(project, 'video') && project.cover.type === 'video';
  const hasRealUploadDate = Boolean(project.videoUploadDate);
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': isVideoPage ? (hasRealUploadDate ? 'VideoObject' : 'CreativeWork') : 'ImageGallery',
    name: project.title,
    headline: `${project.title}: ${project.category === 'video' ? 'vídeo de boda' : 'fotografía de boda'} en ${project.location}`,
    description: project.description,
    dateCreated: String(project.year),
    contentLocation: { '@type': 'Place', name: project.location },
    url: `${SITE_URL}/trabajos/${project.slug}`,
    author: { '@id': BUSINESS_ID },
    ...(imageSrc ? { image: `${SITE_URL}${imageSrc}`, thumbnailUrl: `${SITE_URL}${imageSrc}` } : {}),
    // `contentUrl` viaja con `uploadDate` o no viaja: suelto, en un
    // CreativeWork, apunta al .mp4 sin decir cuándo se publicó, que es el
    // medio marcado que provocó esto.
    ...(isVideoPage && project.videoUploadDate && project.cover.type === 'video'
      ? { contentUrl: `${SITE_URL}${project.cover.src}`, uploadDate: project.videoUploadDate }
      : {}),
  };
}

/** Inicio › Trabajos › Proyecto -- the trail Google shows under the result. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * The FAQ block on /contacto, as structured data.
 *
 * The six questions are already on the page in a <details> list, which is
 * what Google requires: FAQPage markup for answers that are not visible to
 * the reader is a manual-action risk, not a shortcut. Questions that the
 * studio still has to confirm commercially (`isPendingConfirmation`) are
 * left OUT of the markup -- a rich result is a promise, and this site does
 * not make one on a figure nobody has signed off.
 */
export function faqSchema(entries: FaqEntry[]) {
  const confirmed = entries.filter((f) => !f.isPendingConfirmation);
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: confirmed.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/**
 * SERIALIZA UN BLOQUE JSON-LD PARA METERLO EN UN `<script>`.
 *
 * `JSON.stringify` a secas NO es seguro dentro de un `<script>`, y es un fallo
 * que pasa desapercibido porque el JSON sale perfectamente válido: el
 * analizador de HTML corta el bloque en cuanto ve la secuencia `</script`, sin
 * importar que esté dentro de una cadena JSON. Un título de reportaje, una
 * respuesta de las preguntas frecuentes o cualquier texto que algún día venga
 * de fuera y contenga `</script><script>…` se convierte en código ejecutable
 * en el dominio del estudio.
 *
 * Hoy todo lo que entra aquí sale de ficheros de content/, o sea que lo
 * escribimos nosotros y no hay agujero. Esto existe para el día que deje de
 * ser así --el nombre de una pareja, una reseña, un campo del panel-- que es
 * exactamente cuando nadie se acuerda de revisar este fichero.
 *
 * Se escapan tres cosas y ninguna cambia el significado del JSON, porque las
 * tres son secuencias de escape Unicode válidas dentro de una cadena:
 *   `<`  cierra cualquier intento de abrir o cerrar una etiqueta;
 *   `>`  por simetría, y cubre el cierre de un comentario HTML;
 *   `&`  impide que una entidad HTML se cuele por otro camino.
 * `U+2028` y `U+2029` se escapan además porque son saltos de línea para
 * JavaScript aunque no lo sean para JSON, y romperían el script.
 */
export function jsonLd(datos: unknown): string {
  return JSON.stringify(datos)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    // Escapados con `\u2028`, NO con el carácter literal: dentro de una
    // expresión regular, U+2028 ES un salto de línea para JavaScript, así que
    // escribirlo a pelo deja la expresión sin cerrar y el fichero no compila.
    // Es la misma trampa que esta función existe para evitar, una capa más
    // abajo.
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
