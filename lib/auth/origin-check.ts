/**
 * Defensa CSRF para las rutas que cambian estado y se autentican con cookie
 * (login, logout, envío de la selección, alta de galería, borrado de un
 * mensaje, formulario de contacto).
 *
 * No hay librería de tokens CSRF: las cookies de sesión de este proyecto ya
 * llevan `SameSite=Lax`, que impide al navegador adjuntarlas a un POST desde
 * otro sitio. Esta comprobación es la capa de refuerzo para los casos en que
 * esa garantía es más débil (navegadores viejos, un intermediario que quite el
 * atributo). Una petición cuyo Origin no sea el de este despliegue se rechaza
 * antes de tocar contraseñas o sesiones.
 */
/**
 * Hosts que cuentan como "este sitio". Son tres porque detrás de un proxy
 * inverso (que es como se sirve esto en producción) los tres pueden diferir y
 * quedarse solo con uno rompe formularios legítimos:
 *   - el host que ve el propio proceso Node (request.url), que puede ser
 *     `localhost:3000` si el proxy reescribe la cabecera Host;
 *   - X-Forwarded-Host, el host que el visitante escribió de verdad;
 *   - NEXT_PUBLIC_SITE_URL, el dominio canónico del despliegue.
 * Ninguno de los tres lo controla un atacante hasta el punto de servirle:
 * puede falsificar X-Forwarded-Host, sí, pero eso solo le permite hacerse
 * pasar por sí mismo en SU propia petición, no montar un CSRF desde otra web
 * (el navegador de la víctima no le deja poner esa cabecera).
 */
function allowedHosts(request: Request): Set<string> {
  const hosts = new Set<string>();
  try {
    hosts.add(new URL(request.url).host);
  } catch {
    /* URL rara: se ignora */
  }
  const forwarded = request.headers.get('x-forwarded-host');
  if (forwarded) hosts.add(forwarded.split(',')[0]!.trim());
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      hosts.add(new URL(configured).host);
    } catch {
      /* variable mal puesta: se ignora, no se rompe el login por eso */
    }
  }
  return hosts;
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return allowedHosts(request).has(new URL(origin).host);
    } catch {
      return false;
    }
  }

  // Sin cabecera Origin. Todo navegador actual la manda en un POST, así que
  // aquí caen sobre todo clientes que no son navegadores (curl) y algún
  // navegador antiguo. Antes de dar por buena la petición se mira
  // Sec-Fetch-Site, que los navegadores modernos mandan SIEMPRE y que el
  // JavaScript de una página no puede falsificar: si dice que la petición
  // viene de otro sitio, se rechaza aunque falte Origin.
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;

  // Permisivo en el resto de casos, a propósito: bloquear toda petición sin
  // Origin dejaría fuera a navegadores viejos legítimos, y SameSite=Lax sigue
  // siendo la defensa principal. Lo que un cliente sin navegador sí encuentra
  // es el limitador de peticiones (lib/auth/rate-limit.ts), que es la defensa
  // que de verdad le corresponde a ese caso.
  return true;
}
