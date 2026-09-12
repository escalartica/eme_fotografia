import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda } from 'next/font/google';
import localFont from 'next/font/local';
import { site } from '@/content/site';
import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';
import { Cursor } from '@/components/motion/Cursor';
import { siteGraph, jsonLd } from '@/lib/schema';
import { ogImage } from '@/lib/seo';
import '../styles/globals.css';

// Bodoni Moda: a true Didone. High stroke contrast, unbracketed hairline
// serifs, vertical stress -- the masthead family all three reference
// studios use (bellephoto.com.au, danieleandmarilia.com). Replaces
// Fraunces, whose soft wedge serifs and low contrast read as a generic
// "creative" webfont at display size rather than as an editorial masthead.
// Variable across weight AND optical size, so the same family holds up at
// both the 13rem hero wordmark and a 1rem pull quote.
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap',
  // Real italic cut, not the browser's synthesized oblique. A Didone's
  // italic has genuinely different letterforms and is the one emphasis
  // device this design language uses inside a headline.
  style: ['normal', 'italic'],
});

const generalSans = localFont({
  src: '../public/fonts/GeneralSans-Variable.woff2',
  variable: '--font-sans-loaded',
  weight: '300 700',
  display: 'swap',
});

// 155 caracteres, no 213. Esta es la única descripción del sitio que no pasa
// por buildMetadata() (la home no lo llama), así que el recorte que hace
// clampDescription no la tocaba y Google la cortaba a mitad de la última
// frase, justo donde estaba la prueba social.
const DESCRIPTION =
  'Fotógrafo y vídeo de bodas en Sevilla y toda Andalucía. Cerca, sin posados forzados y con color de cine. +300 parejas y la máxima puntuación en Bodas.net.';
const HOME_TITLE = `${site.tagline} · EME Fotografía`;

/* EL COLOR DE LA BARRA DEL NAVEGADOR, uno por tema.
   En un móvil, el navegador pinta su propia barra --la de la URL y la de
   abajo-- con este color. Sólo estaba declarado en el manifiesto de la app y
   con el crema del tema claro, así que quien navegaba en modo noche veía una
   web negra rematada arriba y abajo por dos franjas color papel.
   Los valores son los tokens reales: --color-paper de cada tema
   (styles/tokens.css). Van a mano porque una etiqueta `meta` no puede leer
   una propiedad personalizada; si esos tokens cambian, estos cambian con
   ellos.
   `prefers-color-scheme` es lo único que una etiqueta `meta` sabe consultar,
   así que esto acierta con quien tiene el sistema en oscuro y con quien lo
   tiene en claro. A quien pulse el interruptor y elija lo contrario de su
   sistema le quedará la barra del tema anterior: no hay forma declarativa de
   atarlo a `data-theme`, y perseguirlo con JavaScript en cada pulsación no
   compensa por dos franjas de cuarenta píxeles. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#141412' },
  ],
};

/** La tarjeta de enlace de la portada. Ver el comentario de `openGraph`. */
const HOME_OG_IMAGE = ogImage('/images/trabajos/maite-y-nerea/cover.webp')!;

export const metadata: Metadata = {
  // La plantilla añadía 25 caracteres a CADA página, lo que llevaba /servicios
  // a 87, /contacto a 81 y algunas fichas de boda a 90 (medido en el navegador
  // sobre el HTML servido). Google corta alrededor de los 60 y lo que se
  // pierde es siempre el final -- o sea, la marca. Una pareja que ya vio "EME"
  // en Bodas.net no la reconoce en el resultado si es lo primero que se cae.
  // "Sevilla" ya está dentro del texto propio de casi todos los títulos.
  title: { default: HOME_TITLE, template: '%s · EME Fotografía' },
  description: DESCRIPTION,
  metadataBase: new URL(site.siteUrl),
  // `alternates.canonical` NO va aquí. La metadata del App Router se hereda
  // por segmento, así que un canónico en la raíz se lo comen todas las rutas
  // que no declaran el suyo: app/[slug] (las galerías privadas de clientes),
  // app/admin, not-found.tsx y error.tsx. Comprobado en el navegador: el 404
  // y /admin emitían <link rel="canonical" href=".../"> apuntando a la home
  // Y a la vez meta robots noindex -- que es justo la combinación que Google
  // desaconseja, y que además hace que la página de error se presente como si
  // fuera la portada (soft 404). El canónico de la home vive ahora en
  // app/(site)/page.tsx, que es la única página a la que pertenece.
  //
  // Título, descripción y OG SÍ se quedan: como fallback heredado son
  // correctos, y las páginas con noindex no los publican en ningún sitio.
  // Home has no per-page buildMetadata() call (see lib/seo.ts) -- its own
  // openGraph/twitter fields, matching that function's shape.
  //
  // Y LA TARJETA ES UNA FOTOGRAFÍA, no el logotipo. La portada es el enlace
  // que más se comparte y se estaba mandando por WhatsApp como un wordmark
  // sobre fondo oscuro: en una previsualización, la imagen ES el argumento, y
  // este estudio tiene mejores argumentos que su propia marca. Es la foto que
  // el propio estudio señaló como una de sus favoritas -- el perro con
  // pajarita de la boda de Maite y Nerea.
  // `DEFAULT_OG_IMAGE` sigue existiendo en lib/seo.ts: es el respaldo que
  // `buildMetadata` da a cualquier página que no declare la suya (el aviso
  // legal, la privacidad, las cookies), donde una fotografía de boda no viene
  // a cuento.
  openGraph: {
    title: HOME_TITLE,
    description: DESCRIPTION,
    url: site.siteUrl,
    images: [{ url: HOME_OG_IMAGE, width: 1200, height: 630 }],
    locale: 'es_ES',
    type: 'website',
    siteName: site.brandName,
  },
  twitter: { card: 'summary_large_image', title: HOME_TITLE, description: DESCRIPTION, images: [HOME_OG_IMAGE] },
};

// Runs before hydration, before first paint: applies a stored explicit
// dark-mode choice (ThemeToggle / lib/hooks/useTheme.ts) as a
// `data-theme="dark"` attribute so the very first frame already matches
// it -- otherwise the page would flash light, then snap to dark once
// React mounts. No stored choice (or a stored "light") means no
// attribute at all, which IS light: light is the hard default for every
// visitor regardless of their OS's own dark-mode setting (see the DARK
// MODE comment in styles/tokens.css). Inline and tiny on purpose: it
// must finish before paint.
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem('eme-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    /* `suppressHydrationWarning` en <html>, y solo aquí.
       El script de arranque del tema (THEME_BOOTSTRAP, justo debajo) escribe
       `data-theme="dark"` sobre <html> ANTES de que React hidrate, que es
       justamente su razón de existir: sin él la web parpadea en blanco al
       cargar en modo noche. Pero entonces el HTML del servidor (sin el
       atributo) y el del navegador (con él) dejan de coincidir, y React avisa
       de un desajuste de hidratación en cada carga.
       Esta bandera solo silencia la comparación de atributos DE ESTE
       elemento, no de sus hijos, y es el remedio que la documentación de
       React indica para este caso exacto. No tapa ningún otro desajuste. */
    <html
      lang="es"
      className={`${bodoni.variable} ${generalSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {/* El negocio y el sitio, en un solo @graph. Son dos entidades
            distintas (LocalBusiness y WebSite) que se referencian entre sí por
            @id, así que van en el mismo bloque: emitidas en dos <script>
            sueltos, Google tiene que reconciliar por su cuenta dos documentos
            que hablan de lo mismo, y el `publisher` del sitio apunta a un @id
            que vive en otro documento. Ver lib/schema.ts. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(siteGraph()) }}
        />
        <SmoothScrollProvider>
          <Cursor />
          {/* Skip-link target: every route provides its own #main-content
              landmark now (the (site) group's <main>, or app/[slug] and
              app/admin's own layout.tsx) -- see those files. */}
          <a href="#main-content" className="skip-link">
            Saltar al contenido
          </a>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
