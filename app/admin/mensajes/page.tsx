import { redirect } from 'next/navigation';
import { BrandMark } from '@/components/ui/BrandMark';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/require-session';
import { listContactSubmissions, type ContactSubmission } from '@/lib/contact-store';
import { isMailConfigured } from '@/lib/mail';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminLogoutButton } from '../AdminLogoutButton';
import { DeleteMessageButton } from './DeleteMessageButton';
import dash from '../AdminDashboard.module.css';
import tabs from '../estadisticas/estadisticas.module.css';
import styles from './mensajes.module.css';

export const metadata = { title: 'Mensajes', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

// La lectura del directorio vive ahora en lib/contact-store.ts, junto al
// borrado: quien cambie el formato en disco toca un sitio, no dos.

const FIELDS: [keyof ContactSubmission, string][] = [
  ['telefono', 'Teléfono'],
  ['tipoEvento', 'Evento'],
  ['fecha', 'Fecha'],
  ['lugar', 'Lugar'],
  ['numeroInvitados', 'Invitados'],
  ['presupuesto', 'Presupuesto'],
  ['comoNosConociste', 'Nos conoció por'],
  ['queEsperas', 'Qué esperan'],
];

export default async function MensajesPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  const rows = await listContactSubmissions();

  return (
    <div className={dash.page}>
      <header className={dash.header}>
        <Link href="/" className={dash.brand} aria-label={`${site.brandName} - inicio`}>
          <BrandMark alto={2.2} priority />
        </Link>
        <div className={dash.headerActions}>
          <ThemeToggle />
          <AdminLogoutButton className={dash.logoutButton} />
        </div>
      </header>

      <nav aria-label="Secciones del panel" className={tabs.tabs}>
        <Link href="/admin">Galerías</Link>
        <Link href="/admin/mensajes" aria-current="page">
          Mensajes
        </Link>
        <Link href="/admin/estadisticas">Estadísticas</Link>
      </nav>

      <div className={dash.titleRow}>
        <div>
          <p className={dash.eyebrow}>Formulario de contacto</p>
          <h1 className={dash.heading}>Mensajes recibidos</h1>
        </div>
      </div>

      {!isMailConfigured() && (
        <p className={styles.warning} role="status">
          El envío por correo no está configurado (falta <code>RESEND_API_KEY</code> en el servidor). Los mensajes se
          guardan aquí, pero no llegan a {site.email} hasta que se configure.
        </p>
      )}

      <p className={styles.retention}>
        Estos mensajes contienen datos personales de las parejas (nombre, correo y lo que os cuenten). Borra los que ya
        no necesites y, en cuanto alguien pida que se borren los suyos, hazlo aquí mismo con &ldquo;Borrar&rdquo;.
      </p>

      {rows.length === 0 ? (
        <p className={dash.empty}>Todavía no ha llegado ningún mensaje.</p>
      ) : (
        <ol className={styles.list}>
          {rows.map((r) => (
            <li key={r.id} className={styles.item}>
              <div className={styles.head}>
                <div>
                  <h2 className={styles.name}>{r.nombre}</h2>
                  <a href={`mailto:${r.email}`} className={styles.email}>
                    {r.email}
                  </a>
                </div>
                <div className={styles.headRight}>
                  <time dateTime={r.receivedAt} className={styles.date}>
                    {new Date(r.receivedAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                  </time>
                  {/* Derecho de supresión (RGPD art. 17): si una pareja pide
                      que se borren sus datos, el estudio tiene que poder
                      hacerlo desde aquí, sin tocar el servidor. */}
                  <DeleteMessageButton id={r.id} nombre={r.nombre} className={styles.delete} />
                </div>
              </div>
              <dl className={styles.facts}>
                {FIELDS.filter(([k]) => r[k]).map(([k, label]) => (
                  <div key={k} className={styles.fact}>
                    <dt>{label}</dt>
                    <dd>{r[k]}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.message}>{r.mensaje}</p>
              {/* EL REGISTRO DE CONSENTIMIENTO, visible. De poco sirve
                  guardarlo si el estudio no puede enseñarlo: si alguna vez
                  hay que responder a una reclamación, la prueba es esto --
                  qué texto exacto aceptó esta pareja y cuándo. La fecha es la
                  de recepción, que es el mismo instante en que se marcó la
                  casilla.
                  Los mensajes anteriores a 2026-09-12 no lo llevan, y se dice
                  en vez de callarlo: un hueco en blanco parecería un fallo de
                  la página en lugar de lo que es, un mensaje recibido cuando
                  el formulario todavía no lo pedía. */}
              {r.consentimientoTexto ? (
                <p className={styles.consent}>
                  <strong>Consentimiento</strong> (v. {r.consentimientoVersion}):
                  «{r.consentimientoTexto}» — política {r.politicaVersion ?? 'sin versión'} — aceptado el{' '}
                  {new Date(r.receivedAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}.
                </p>
              ) : (
                <p className={styles.consent}>
                  <strong>Consentimiento</strong>: sin registro. Mensaje recibido antes de que el
                  formulario pidiera la aceptación expresa.
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
