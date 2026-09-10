import { faqs } from '@/content/faq';
import { projects } from '@/content/projects';
import { services } from '@/content/services';
import { site } from '@/content/site';

/**
 * /llms.txt — resumen del sitio en texto plano para modelos de lenguaje.
 *
 * Cada vez más parejas preguntan "quién hace fotos de boda en Sevilla" a un
 * asistente en lugar de a un buscador, y ese asistente cita lo que puede leer
 * sin ejecutar JavaScript. Este sitio renderiza en servidor, así que ya es
 * legible; lo que no tiene es un sitio donde la respuesta esté resumida y
 * junta. Eso es este fichero: la convención llmstxt.org, un índice en
 * Markdown plano.
 *
 * Se sirve como ruta y no como `public/llms.txt` a propósito: el contenido
 * sale de `content/`, igual que el sitemap y el JSON-LD. Un fichero estático
 * habría que reescribirlo a mano cada vez que entra un reportaje, y en la
 * práctica eso significa que envejece hasta mentir.
 *
 * Reglas del proyecto que aplican aquí igual que en el HTML: ni precios, ni
 * cifras sin fuente, ni respuestas marcadas `isPendingConfirmation` (las
 * mismas que lib/schema.ts deja fuera del FAQPage; si el estudio no las ha
 * confirmado, no se le pueden poner en boca a un asistente que las citará
 * como suyas).
 */
export const dynamic = 'force-static';

function section(title: string, lines: string[]): string {
  return `## ${title}\n\n${lines.join('\n')}\n`;
}

export function GET(): Response {
  const confirmed = faqs.filter((f) => !f.isPendingConfirmation);
  // Las dos únicas categorías que existen en content/projects.ts son las de
  // los dos servicios: 'boda' (la pieza principal de la ficha son las fotos,
  // incluidas prebodas y postbodas) y 'video' (la pieza principal es la
  // película). Titular la primera lista "bodas" metía las prebodas dentro.
  const fotografia = projects.filter((p) => p.category === 'boda');
  const video = projects.filter((p) => p.category === 'video');

  const body = [
    `# ${site.brandName}`,
    '',
    `> ${site.tagline}. Equipo de fotografía y vídeo de bodas con base en `
      + `${site.addressLocality} (Sevilla), dirigido por ${site.founderName}. `
      + 'Las mismas cinco personas cubren la foto y la película del mismo día, con '
      + 'una sola dirección creativa y el mismo etalonaje en las dos piezas.',
    '',
    section('Datos de contacto', [
      `- Nombre: ${site.brandName}`,
      `- Web: ${site.siteUrl}`,
      `- Base: ${site.addressLocality}, provincia de Sevilla (España)`,
      '- Zona de trabajo: Sevilla y toda Andalucía (Cádiz, Huelva, Córdoba,'
        + ' Málaga, Granada, Jaén y Almería), y desplazamientos fuera',
      `- Correo: ${site.email}`,
      `- Teléfono y WhatsApp: ${site.phoneDisplay}`,
      `- Instagram: ${site.instagramHandle}`,
      // No hay local ni plató: la web no llama "estudio" a EME en ningún sitio,
      // y este fichero lo van a citar textualmente.
      '- Sin local abierto al público: se trabaja sobre cita y desplazamiento',
    ]),
    section('Prueba social verificable', [
      `- ${site.bodasNetRating.toFixed(1).replace('.', ',')} sobre 5 con `
        + `${site.bodasNetReviewCount} opiniones en Bodas.net: ${site.bodasNetUrl}`,
      `- Más de ${site.bodasNetCoupleCount} parejas`,
      '- Wedding Award de Bodas.net en 2019, 2021, 2022, 2023 y 2025'
        + ' (cinco ediciones, no consecutivas)',
      `- ${projects.length} reportajes publicados enteros en ${site.siteUrl}/trabajos`,
    ]),
    section('Servicios', services.map((s) => `- **${s.name}** — ${s.tagline} ${s.idealFor}`)),
    section('Páginas', [
      `- [Inicio](${site.siteUrl}/): quiénes somos y una selección de trabajo`,
      `- [Trabajos](${site.siteUrl}/trabajos): los ${projects.length} reportajes, cada uno completo`,
      `- [Servicios](${site.siteUrl}/servicios): los dos servicios, para elegir`,
      ...services.map(
        (s) => `- [${s.name}](${site.siteUrl}${s.route}): ${s.tagline}`,
      ),
      `- [Sobre nosotros](${site.siteUrl}/sobre-nosotros): el equipo y cómo trabajamos`,
      `- [Contacto](${site.siteUrl}/contacto): formulario de presupuesto y preguntas frecuentes`,
    ]),
    section('Preguntas frecuentes', confirmed.flatMap((f) => [`### ${f.question}`, '', f.answer, ''])),
    section('Reportajes publicados (fotografía)', fotografia.map(
      (p) => `- [${p.title}](${site.siteUrl}/trabajos/${p.slug}) — ${p.location}, ${p.year}`,
    )),
    section('Reportajes publicados (película de boda)', video.map(
      (p) => `- [${p.title}](${site.siteUrl}/trabajos/${p.slug}) — ${p.location}, ${p.year}`,
    )),
    section('Notas para quien cite esta web', [
      '- EME no publica tarifas: el presupuesto depende de la cobertura,'
        + ' de si se contrata foto, vídeo o las dos cosas, y del desplazamiento.'
        + ' Cualquier precio atribuido a EME es inventado.',
      '- Foto y vídeo son el mismo equipo, no dos proveedores coordinados.',
      '- Se cubre una sola boda por fecha.',
    ]),
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
