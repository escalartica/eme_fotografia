import type { SiteInfo } from './types';

/**
 * Origen canónico del sitio público, sin barra final.
 *
 * Se lee del entorno para que el dominio definitivo se decida en el despliegue
 * y no en un literal del que dependen cuatro módulos a la vez (lib/seo.ts,
 * lib/schema.ts, app/sitemap.ts y app/robots.ts leen todos de aquí). Alimenta
 * cada canonical, cada og:url, las 37 URLs del sitemap, el Sitemap: de
 * robots.txt y los @id de todo el JSON-LD.
 *
 * Si en producción no se fija la variable, el sitio se autocanoniza al dominio
 * provisional: si ese no es el que sirve el HTML, Google descarta la URL
 * servida y no indexa nada. Es el único fallo capaz de dejar la web entera
 * fuera del índice, y por eso el valor deja de estar clavado en el código.
 *
 * DOMINIO DEFINITIVO: emefotografiasevilla.com. El estudio comprará también
 * el .es más adelante; cuando lo tenga, ese segundo dominio NO debe servir una
 * copia del sitio, sino redirigir al .com con un 308 (ver la sección
 * `redirects()` de next.config.mjs). Dos dominios sirviendo el mismo HTML es
 * contenido duplicado: Google elige uno por su cuenta y reparte la autoridad
 * entre los dos.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.emefotografiasevilla.com').replace(/\/$/, '');

export const site: SiteInfo = {
  brandName: 'EME Fotografía Sevilla',
  siteUrl: SITE_URL,
  tagline: 'Fotógrafo y vídeo de bodas en Sevilla',
  legalCity: 'Sevilla',
  // Dado por el estudio. Comprobada la letra de control contra el número
  // (algoritmo del DNI: número módulo 23 sobre la tabla TRWAGMYFPDXBNJZSQVHLCKE).
  legalNif: '53284928T',
  email: 'info@emefotografiasevilla.com',
  instagramUrl: 'https://www.instagram.com/eme_fotografia_sevilla',
  instagramHandle: '@eme_fotografia_sevilla',
  instagramFollowers: 1622,
  // Verified via web search: facebook.com/EmeFotografiaSevilla, name "EME Fotografia Sevilla",
  // ~2,329 likes reported (close to the ~2320 in the WhatsApp Business profile snapshot).
  facebookUrl: 'https://www.facebook.com/EmeFotografiaSevilla/',
  facebookName: 'EME Fotografia Sevilla',
  facebookLikes: 2320,
  tiktokUrl: 'https://www.tiktok.com/@emesevilla',
  tiktokHandle: '@emesevilla',
  // Contact number given by the studio for the floating WhatsApp button.
  whatsappNumber: '34635025378',
  phoneDisplay: '635 02 53 78',
  // Real registered address, verified via the studio's own Bodas.net profile
  // (bodas.net/fotografos/eme-fotografia-sevilla--e71289) on 2026-08-31.
  // Kept as the precise legal/structured-data address; `legalCity` above stays
  // "Sevilla" for marketing copy since that's the brand name and the metro
  // area they serve, not the exact home-base town.
  addressLocality: 'La Algaba',
  addressCountry: 'ES',
  streetAddress: 'Calle Alicante 8',
  postalCode: '41927',
  // Verified via the same Bodas.net profile.
  founderName: 'María Leal',
  // Live stats read directly off the studio's own Bodas.net profile
  // (bodas.net/fotografos/eme-fotografia-sevilla--e71289) on 2026-09-03 --
  // the client confirmed this is the correct/current profile after an
  // earlier, unrelated profile URL was mistakenly shared. 5.0/5 rating,
  // 67 reviews, "más de 125 parejas lo han contratado".
  bodasNetUrl: 'https://www.bodas.net/fotografos/eme-fotografia-sevilla--e71289',
  bodasNetRating: 5.0,
  bodasNetReviewCount: 67,
  // EL RECUENTO DE PAREJAS ES DEL ESTUDIO, NO DE BODAS.NET, y por eso ya no
  // se llama `bodasNetCoupleCount`. La ficha de Bodas.net dice "más de 125":
  // ésa es la cuenta de las parejas que llegaron POR LA PLATAFORMA, que es
  // lo único que la plataforma puede contar. El estudio lleva más de
  // trescientas bodas, cifra que confirmó el cliente. Mezclar las dos bajo un
  // nombre que empieza por `bodasNet` era la forma segura de que alguien
  // acabara citando la de dentro como si la avalara la de fuera.
  coupleCount: 300,
};
