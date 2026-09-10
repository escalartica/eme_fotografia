/**
 * One place to format the studio's Bodas.net rating.
 *
 * There were four call sites and three different renderings of the same
 * number on the same page:
 *   Cifras.tsx          `.toFixed(1).replace('.', ',')`  -> "5,0"   correct
 *   contacto/page.tsx   `.toFixed(1).replace('.', ',')`  -> "5,0"   correct
 *   Testimonios.tsx     `.toFixed(1)`                    -> "5.0"   English separator
 *   GuiaBodasSevilla    `String(x).replace('.', ',')`    -> "5"     outright bug
 *
 * The last one is worth spelling out, because it looks like it works:
 * `site.bodasNetRating` is the numeric literal 5.0, and `String(5.0)` is
 * "5" -- there is no "." left for the replace to find, so the home page
 * advertised "tenemos 5 sobre 5" instead of "5,0 sobre 5". A perfect score
 * written without its decimal reads like a rounded guess, which is the
 * opposite of what a verified rating is for.
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1).replace('.', ',');
}
