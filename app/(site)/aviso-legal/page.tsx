import Link from 'next/link';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';
import styles from '../legal.module.css';

export const metadata = buildMetadata({
  title: 'Aviso legal',
  // 154 caracteres. La anterior medía 73: por debajo de 120 Google la
  // descarta y se inventa el fragmento con la primera línea que encuentre.
  description: `Aviso legal y condiciones de uso de la web de ${site.brandName}: titular del sitio, uso de los contenidos y propiedad intelectual de las fotografías.`,
  path: '/aviso-legal',
});

export default function Page() {
  return (
    <article className={styles.page}>
      <p className={styles.eyebrow}>Legal</p>
      <h1 className={styles.title}>Aviso legal y condiciones de uso</h1>
      <p className={styles.updated}>Última actualización: septiembre de 2026</p>

      <h2>1. Titular del sitio web</h2>
      <p>
        En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio
        Electrónico (LSSI-CE), se informa de que el titular de este sitio web es:
      </p>
      <ul>
        <li>Denominación: {site.brandName} ({site.founderName})</li>
        <li>
          NIF: <span className={styles.pending}>pendiente de indicar por el titular</span>
        </li>
        <li>
          Domicilio: {site.streetAddress}, {site.postalCode} {site.addressLocality} ({site.legalCity}), España
        </li>
        <li>
          Correo electrónico: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        Este sitio web tiene como finalidad dar a conocer los servicios de fotografía y vídeo de bodas que presta el
        titular, mostrar una selección de sus trabajos y facilitar el contacto con posibles clientes. El acceso y la
        navegación implican la aceptación de estas condiciones.
      </p>

      <h2>3. Propiedad intelectual</h2>
      <p>
        Todas las fotografías, vídeos, textos, logotipos y demás contenidos de este sitio son propiedad del titular o
        cuentan con la autorización de las personas que aparecen en ellos, y están protegidos por la legislación de
        propiedad intelectual. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin
        autorización expresa y por escrito.
      </p>

      <h2>4. Uso de las imágenes de clientes</h2>
      <p>
        Las imágenes de bodas y eventos publicadas se muestran con el consentimiento de las parejas. Si apareces en
        alguna de ellas y deseas que sea retirada, escríbenos a <a href={`mailto:${site.email}`}>{site.email}</a> y la
        retiraremos a la mayor brevedad.
      </p>

      <h2>5. Galerías privadas</h2>
      <p>
        Las galerías de clientes son privadas y están protegidas por contraseña. Su acceso está reservado a la pareja y
        a las personas con las que ésta decida compartirla. Está prohibido difundir las credenciales de acceso o las
        imágenes fuera de ese ámbito.
      </p>

      <h2>6. Responsabilidad</h2>
      <p>
        El titular procura que la información publicada sea correcta y esté actualizada, pero no garantiza la ausencia
        de errores ni la disponibilidad ininterrumpida del sitio. Los enlaces a sitios de terceros (redes sociales,
        Bodas.net) se facilitan a título informativo; el titular no responde de sus contenidos.
      </p>

      <h2>7. Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier controversia serán competentes los
        juzgados y tribunales del domicilio del titular, salvo que la normativa de consumo establezca otro fuero.
      </p>

      <p>
        Consulta también nuestra <Link href="/privacidad">política de privacidad</Link> y nuestra{' '}
        <Link href="/cookies">política de cookies</Link>.
      </p>
    </article>
  );
}
