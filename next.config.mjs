/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Content-Security-Policy, escrita contra lo que esta web carga DE VERDAD
 * (comprobado en el código, no copiada de una plantilla). Directiva por
 * directiva:
 *
 *  default-src 'self'       Todo lo que no tenga regla propia, solo del propio
 *                           dominio. Es la red de seguridad de las directivas
 *                           que no aparecen aquí.
 *  base-uri 'self'          Impide que un <base> inyectado reescriba a dónde
 *                           apuntan TODAS las rutas relativas de la página.
 *  object-src 'none'        No hay <object>/<embed> en el sitio; sobran.
 *  frame-ancestors 'none'   Nadie puede meter esta web en un iframe: es lo que
 *                           evita el clickjacking sobre el formulario del panel
 *                           o sobre el login de una galería. Sustituye de hecho
 *                           a X-Frame-Options, que se mantiene por navegadores
 *                           viejos.
 *  form-action 'self'       Un <form> inyectado no puede mandar lo tecleado a
 *                           otro servidor.
 *  script-src               'self' cubre todo el JS propio y el de Next, GSAP y
 *                           Lenis (van en el bundle, no de un CDN).
 *                           googletagmanager.com es Google Analytics, que solo
 *                           se carga si el visitante acepta cookies
 *                           (components/consent/CookieConsent.tsx) -- si nunca
 *                           acepta, el permiso no se usa.
 *                           'unsafe-inline' hace falta HOY por tres scripts
 *                           en línea propios: el arranque del tema en
 *                           app/layout.tsx (tiene que ejecutarse antes del
 *                           primer pintado o la web parpadea en blanco), los
 *                           bloques JSON-LD, y el trozo de hidratación que
 *                           inyecta el propio Next. Quitarlo exige emitir un
 *                           nonce por petición desde un middleware, y eso
 *                           convierte todas las páginas en dinámicas (adiós al
 *                           HTML estático y al rendimiento que da). Es la
 *                           concesión consciente de esta política: ver el
 *                           informe. Aun con ella, la CSP sigue impidiendo
 *                           cargar un script EXTERNO desde otro dominio, que es
 *                           como se exfiltran datos en la práctica.
 *                           'unsafe-eval' SOLO en desarrollo: el servidor de
 *                           `next dev` usa eval para el recargado en caliente
 *                           y sin esto la web no arranca en local. En
 *                           producción no está.
 *  style-src                CSS Modules y next/font emiten <style> en línea;
 *                           'unsafe-inline' es obligatorio para que la web se
 *                           vea. No hay CSS de terceros.
 *  img-src                  'self' (fotos propias y /_next/image), data: y
 *                           blob: (las miniaturas de previsualización al subir
 *                           fotos, app/admin/galerias/nueva) y los dos dominios
 *                           a los que GA manda su píxel.
 *  font-src 'self'          next/font descarga Bodoni Moda en el build y la
 *                           sirve desde este dominio: no se pide nada a
 *                           fonts.gstatic.com en tiempo de ejecución.
 *  connect-src              fetch propio (formulario, login, /api/hit) y los
 *                           destinos de medición de GA.
 *  media-src 'self'         Los vídeos de portada están en /public.
 *  worker-src 'self' blob:  Next crea algún worker desde un blob.
 *  manifest-src 'self'      app/manifest.ts.
 *  upgrade-insecure-requests  Cualquier subrecurso que se cuele en http:// se
 *                           pide por https.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  // Solo en producción: en local se sirve por http://localhost y no hay por
  // qué pedirle al navegador que fuerce https contra un servidor que no lo
  // habla.
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig = {
  /* nodemailer NO se empaqueta: es una librería de servidor con `require`
     dinámicos y binarios opcionales, y Turbopack la resuelve mal al meterla
     dentro del bundle. Se carga en tiempo de ejecución desde node_modules,
     que es lo que `serverExternalPackages` pide. */
  serverExternalPackages: ['nodemailer'],
  images: {
    // AVIF first (smaller, ~20%), WebP as the fallback for browsers that
    // don't support it yet -- both served from the same source files
    // already in /public.
    formats: ['image/avif', 'image/webp'],
  },
  // Quita la cabecera `X-Powered-By: Next.js`. No abre ningún agujero por sí
  // sola, pero le regala a quien escanea el sitio la pista de qué framework y
  // qué familia de vulnerabilidades probar primero.
  poweredByHeader: false,

  /**
   * Los dos dominios del estudio, con uno solo canónico.
   *
   * emefotografiasevilla.com es el bueno. El .es se comprará después, y el
   * error clásico es apuntarlo al mismo sitio y dejar que sirva una copia: dos
   * dominios con el mismo HTML son contenido duplicado, Google elige uno por su
   * cuenta y reparte entre los dos la autoridad que debería ir a uno. Con esto,
   * el .es responde 308 al .com conservando la ruta, así que un enlace antiguo
   * a `.es/trabajos/...` sigue llevando a su ficha.
   *
   * Un 308 es permanente y los navegadores lo cachean con ganas: si algún día
   * se le da la vuelta al par de dominios, hay que cambiar esto ANTES de mover
   * el DNS.
   *
   * Funciona con el dominio ya apuntado al hosting; no sustituye a la
   * redirección del proveedor, la complementa (y cubre el caso de que el
   * dominio se añada al proyecto sin configurar la redirección allí).
   */
  async redirects() {
    const canonical = 'https://www.emefotografiasevilla.com';
    const legacyHosts = [
      'emefotografiasevilla.es',
      'www.emefotografiasevilla.es',
      // Sin www: quien teclea el dominio a pelo tiene que acabar en el mismo
      // sitio que quien pincha un enlace con www.
      'emefotografiasevilla.com',
    ];
    return legacyHosts.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: `${canonical}/:path*`,
      permanent: true,
    }));
  },

  async headers() {
    const baseline = [
      // La CSP se emite SOLO en producción.
      //
      // En desarrollo estorba y no protege de nada: `next dev` con Turbopack
      // abre un WebSocket para el recargado en caliente, sirve las imágenes
      // por un optimizador que se salta la caché y usa eval. Cada una de esas
      // piezas hay que ir abriéndola a mano en la política, y el día que una
      // versión de Next cambie cualquiera de ellas, la web deja de recargarse
      // o de enseñar las fotos en local sin ningún mensaje de error: el
      // navegador se limita a bloquear en silencio. La protección que da la
      // CSP es contra scripts de terceros en un sitio público, y en
      // http://localhost no hay terceros.
      //
      // La política de producción NO cambia, y `npm run pentest` la comprueba
      // contra el dominio real, que es donde importa.
      ...(isDev ? [] : [{ key: 'Content-Security-Policy', value: csp }]),
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // DENY, no SAMEORIGIN: esta web no se mete a sí misma en ningún iframe.
      // Es el respaldo de frame-ancestors para navegadores que no aplican CSP.
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Ninguna página pide cámara, micrófono, ubicación ni pagos. Declararlo
      // hace que un script inyectado tampoco pueda pedirlos.
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), interest-cohort=()',
      },
    ];
    if (!isDev) {
      // HSTS: obliga al navegador a volver siempre por https durante un año.
      // Solo en producción -- en local se sirve por http://localhost y esta
      // cabecera dejaría el dominio "clavado" en https en el navegador del
      // desarrollador. Sin `preload` a propósito: entrar en la lista de
      // precarga de los navegadores es prácticamente irreversible y es una
      // decisión del dueño del dominio, no de este fichero.
      baseline.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' });
    }

    return [
      {
        // Endurecimiento de base para toda respuesta.
        source: '/:path*',
        headers: baseline,
      },
      {
        // El panel y las galerías privadas nunca se guardan en ninguna caché:
        // ni en la del navegador (un ordenador compartido en el estudio), ni en
        // la de un intermediario. Sin esto, el botón "atrás" tras cerrar sesión
        // puede repintar la lista de mensajes con datos personales dentro.
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        // Wedding photos and video previews never change post-publish: a
        // new gallery gets a new project slug/filename, not an overwrite
        // of an existing one. Safe to cache for a year at the edge/browser.
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/videos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
