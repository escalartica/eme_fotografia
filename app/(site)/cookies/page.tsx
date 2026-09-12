import Link from 'next/link';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';
import { CookiePreferencesButton } from '@/components/consent/CookieConsent';
import styles from '../legal.module.css';

export const metadata = buildMetadata({
  title: 'Política de cookies',
  // 143 caracteres (antes 86: por debajo de 120 Google la descarta y se
  // fabrica el fragmento por su cuenta). Impersonal a propósito: el cuerpo
  // de las páginas legales se dirige a un lector individual, así que ni
  // «puedes» ni «podéis» — nada que choque con el vosotros del resto.
  description: `Qué cookies usa la web de ${site.brandName}, para qué sirven las de medición y cómo aceptarlas, rechazarlas o cambiar la decisión después.`,
  path: '/cookies',
});

export default function Page() {
  return (
    <article className={styles.page}>
      <p className={styles.eyebrow}>Legal</p>
      <h1 className={styles.title}>Política de cookies</h1>
      <p className={styles.updated}>Última actualización: septiembre de 2026</p>

      <p>
        Una cookie es un pequeño archivo que el sitio web guarda en tu navegador. Este sitio utiliza muy pocas, y las
        que no son estrictamente necesarias solo se activan si las aceptas.
      </p>

      <h2>1. Cookies que utilizamos</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Finalidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Nombre">eme-consent</td>
            <td data-label="Tipo">Técnica (propia)</td>
            <td data-label="Finalidad">Recordar tu decisión sobre las cookies</td>
            <td data-label="Duración">12 meses</td>
          </tr>
          <tr>
            <td data-label="Nombre">eme-theme</td>
            <td data-label="Tipo">Técnica (propia)</td>
            <td data-label="Finalidad">Recordar si prefieres el modo claro u oscuro</td>
            <td data-label="Duración">Hasta que la borres</td>
          </tr>
          <tr>
            <td data-label="Nombre">Sesión de galería privada</td>
            <td data-label="Tipo">Técnica (propia)</td>
            <td data-label="Finalidad">Mantener tu acceso a tu galería una vez introducida la contraseña</td>
            <td data-label="Duración">Sesión</td>
          </tr>
          <tr>
            <td data-label="Nombre">_ga, _ga_*</td>
            <td data-label="Tipo">Analítica (Google Analytics 4)</td>
            <td data-label="Finalidad">Medir de forma agregada qué páginas se visitan. Solo se instalan si aceptas las cookies analíticas.</td>
            <td data-label="Duración">Hasta 2 años</td>
          </tr>
        </tbody>
      </table>

      <h2>2. Cómo cambiar tu decisión</h2>
      <p>
        Puedes aceptar o rechazar las cookies analíticas en cualquier momento desde aquí:{' '}
        <CookiePreferencesButton className={styles.botonCookies} />. También puedes borrarlas o bloquearlas desde la
        configuración de tu navegador.
      </p>

      <h2>3. Si rechazas las cookies, ¿no medimos nada?</h2>
      <p>
        Medimos, pero sin cookies y sin saber quién eres. Guardamos qué página se ha visto, desde dónde se llegó y si
        fue desde un móvil, una tableta o un ordenador. Para no contar diez veces a la misma persona usamos un
        identificador que se calcula en el momento, no se puede deshacer y cambia todos los días: no se guarda tu
        dirección IP ni se deja nada en tu navegador, así que al día siguiente eres alguien nuevo para nosotros.
      </p>
      <p>
        Te lo contamos porque nos parece más honesto decirlo que dejar que lo supongas. Esto funciona rechaces o
        aceptes, y es lo único que sabemos de ti si rechazas.
      </p>

      <h2>4. Más información</h2>
      <p>
        Consulta la <Link href="/privacidad">política de privacidad</Link> para saber cómo tratamos tus datos, o
        escríbenos a <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </article>
  );
}
