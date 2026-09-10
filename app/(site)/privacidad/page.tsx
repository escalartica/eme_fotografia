import Link from 'next/link';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';
import styles from '../legal.module.css';

export const metadata = buildMetadata({
  title: 'Política de privacidad',
  // 154 caracteres (antes 93). Impersonal, por lo mismo que en /cookies.
  description: `Qué hace ${site.brandName} con los datos del formulario de contacto: para qué se usan, cuánto tiempo se guardan y cómo ejercer los derechos del RGPD.`,
  path: '/privacidad',
});

export default function Page() {
  return (
    <article className={styles.page}>
      <p className={styles.eyebrow}>Legal</p>
      <h1 className={styles.title}>Política de privacidad</h1>
      <p className={styles.updated}>Última actualización: septiembre de 2026</p>

      <p>
        En {site.brandName} tratamos tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley
        Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD). Aquí te
        explicamos qué datos recogemos, para qué y qué derechos tienes.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>Responsable: {site.brandName} ({site.founderName})</li>
        <li>
          NIF: <span className={styles.pending}>pendiente de indicar por el titular</span>
        </li>
        <li>
          Domicilio: {site.streetAddress}, {site.postalCode} {site.addressLocality} ({site.legalCity}), España
        </li>
        <li>
          Contacto: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
      </ul>

      <h2>2. Qué datos tratamos y con qué finalidad</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Origen</th>
            <th>Datos</th>
            <th>Finalidad</th>
            <th>Base legal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Origen">Formulario de contacto</td>
            <td data-label="Datos">Nombre, correo electrónico, tipo de evento, fecha y lugar, número de invitados, presupuesto y mensaje</td>
            <td data-label="Finalidad">Responder a tu consulta, comprobar disponibilidad y preparar un presupuesto</td>
            <td data-label="Base legal">Medidas precontractuales a petición tuya (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td data-label="Origen">Galerías privadas</td>
            <td data-label="Datos">Contraseña de acceso, fotos marcadas como favoritas y comentarios</td>
            <td data-label="Finalidad">Mostrarte tu reportaje y preparar la selección del álbum</td>
            <td data-label="Base legal">Ejecución del contrato (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td data-label="Origen">Cookies analíticas</td>
            <td data-label="Datos">Datos de navegación anonimizados</td>
            <td data-label="Finalidad">Saber qué páginas se visitan para mejorar la web</td>
            <td data-label="Base legal">Tu consentimiento (art. 6.1.a RGPD), revocable en cualquier momento</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Conservación</h2>
      <p>
        Los datos del formulario de contacto se conservan mientras dure la relación comercial y, si no llega a
        formalizarse, durante un máximo de dos años desde la consulta. Los datos vinculados a un reportaje contratado se
        conservan durante los plazos que exige la legislación fiscal y contractual.
      </p>

      <h2>4. Destinatarios</h2>
      <p>
        No cedemos tus datos a terceros salvo obligación legal. Para prestar el servicio podemos utilizar proveedores
        que actúan como encargados del tratamiento (alojamiento web, correo electrónico y, si has dado tu
        consentimiento, la herramienta de analítica). Algunos de estos proveedores pueden estar fuera del Espacio
        Económico Europeo; en ese caso el tratamiento se ampara en las cláusulas contractuales tipo aprobadas por la
        Comisión Europea.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad
        escribiendo a <a href={`mailto:${site.email}`}>{site.email}</a>, indicando el derecho que deseas ejercer y
        acompañando un documento que acredite tu identidad. Si consideras que no hemos atendido tu solicitud, puedes
        presentar una reclamación ante la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
          www.aepd.es
        </a>
        ).
      </p>

      <h2>6. Imágenes de bodas y eventos</h2>
      <p>
        Las fotografías y vídeos de los reportajes son datos personales de quienes aparecen en ellos. Solo publicamos en
        esta web y en nuestras redes una selección de imágenes con el consentimiento de la pareja, que puede revocarse
        en cualquier momento escribiéndonos.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas para proteger tus datos: conexiones cifradas (HTTPS), galerías
        protegidas por contraseña y acceso restringido a la información de contacto.
      </p>

      <p>
        Consulta también el <Link href="/aviso-legal">aviso legal</Link> y la{' '}
        <Link href="/cookies">política de cookies</Link>.
      </p>
    </article>
  );
}
