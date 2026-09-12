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
          NIF: {site.legalNif}
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
            <td data-label="Datos">Nombre, correo electrónico, teléfono (opcional), fecha y lugar de la boda, qué cobertura buscáis, tu mensaje y, si quieres decírnoslo, cómo nos conociste</td>
            <td data-label="Finalidad">Responder a tu consulta y comprobar si tenemos libre vuestra fecha</td>
            <td data-label="Base legal">Medidas precontractuales a petición tuya (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td data-label="Origen">Registro del consentimiento</td>
            <td data-label="Datos">El texto exacto que aceptaste al enviar el formulario, su versión y la fecha</td>
            <td data-label="Finalidad">Poder demostrar cuándo y a qué nos diste permiso</td>
            <td data-label="Base legal">Responsabilidad proactiva (arts. 5.2 y 7.1 RGPD)</td>
          </tr>
          <tr>
            <td data-label="Origen">Galerías privadas</td>
            <td data-label="Datos">Usuario y contraseña de acceso, fotos marcadas como favoritas, comentarios y la sesión mientras está abierta</td>
            <td data-label="Finalidad">Mostrarte tu reportaje y preparar la selección del álbum</td>
            <td data-label="Base legal">Ejecución del contrato (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td data-label="Origen">Analítica propia, sin cookies</td>
            <td data-label="Datos">Página visitada, desde dónde llegaste, tipo de dispositivo y un identificador que se calcula al vuelo, no se puede deshacer y cambia cada día</td>
            <td data-label="Finalidad">Saber qué páginas se visitan para mejorar la web</td>
            <td data-label="Base legal">Interés legítimo (art. 6.1.f RGPD). No guardamos tu IP ni instalamos nada en tu navegador</td>
          </tr>
          <tr>
            <td data-label="Origen">Google Analytics, solo si aceptas las cookies</td>
            <td data-label="Datos">Datos de navegación</td>
            <td data-label="Finalidad">Medición de audiencia</td>
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
      <p>
        Los datos de la medición propia de visitas (apartado 2) se borran automáticamente a los 90 días. El
        identificador que los acompaña, además, cambia cada día y no permite reconstruir tu recorrido de una jornada
        a la siguiente.
      </p>

      <h2>4. Destinatarios</h2>
      <p>
        No vendemos ni cedemos tus datos a nadie. Para que la web funcione trabajamos con estos proveedores, que
        actúan como encargados del tratamiento y solo pueden usar los datos siguiendo nuestras instrucciones:
      </p>
      <ul>
        <li>
          <strong>IONOS SE</strong> (Alemania) — servidor donde vive esta web y donde se guardan tus mensajes y las
          galerías privadas, y buzones de correo del estudio. Los datos no salen de la Unión Europea.
        </li>
        <li>
          <strong>Resend</strong> (Estados Unidos) — nos hace llegar por correo el mensaje que escribes en el
          formulario.
        </li>
        <li>
          <strong>Google Ireland Ltd.</strong> — Google Analytics, que <strong>solo se carga si aceptas las
          cookies</strong>. Si las rechazas, no se ejecuta nada suyo.
        </li>
      </ul>
      <p>
        La única transferencia fuera del Espacio Económico Europeo es la de Resend, y se ampara en las cláusulas
        contractuales tipo aprobadas por la Comisión Europea. Fuera de esto, solo entregaríamos datos si nos lo
        exigiera una obligación legal.
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
      <p>
        Las galerías privadas no están alojadas en ningún servicio de terceros: viven en nuestro propio servidor, fuera
        de la parte pública de la web, y cada foto se sirve solo después de comprobar que quien la pide ha iniciado
        sesión en esa galería concreta.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas para proteger tus datos: conexiones cifradas (HTTPS), contraseñas
        guardadas siempre cifradas y nunca en claro, galerías a las que solo se entra con usuario y contraseña, y
        acceso a los mensajes restringido al estudio.
      </p>
      <p>
        Además, a cada foto que subimos a una galería privada le borramos los metadatos antes de guardarla. Un archivo
        salido de la cámara o del móvil lleva dentro la fecha, el modelo del equipo y, muchas veces, las coordenadas
        del sitio donde se hizo: nada de eso viaja hasta vosotros ni queda en el servidor.
      </p>

      <p>
        Consulta también el <Link href="/aviso-legal">aviso legal</Link> y la{' '}
        <Link href="/cookies">política de cookies</Link>.
      </p>
    </article>
  );
}
