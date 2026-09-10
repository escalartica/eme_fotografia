import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAdminSession } from '@/lib/auth/require-session';
import { readHits, summarise } from '@/lib/analytics-store';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminLogoutButton } from '../AdminLogoutButton';
import dash from '../AdminDashboard.module.css';
import styles from './estadisticas.module.css';

export const metadata = { title: 'Estadísticas', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const RANGES = [
  { days: 1, label: 'Hoy' },
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
];

const PAGE_LABELS: Record<string, string> = {
  '/': 'Inicio',
  '/trabajos': 'Trabajos',
  '/servicios/fotografia-de-boda': 'Fotografía de boda',
  '/servicios/video-de-boda': 'Vídeo de boda',
  '/servicios': 'Servicios',
  '/sobre-nosotros': 'Equipo',
  '/contacto': 'Contacto',
  '/aviso-legal': 'Aviso legal',
  '/privacidad': 'Privacidad',
  '/cookies': 'Cookies',
};

function pageLabel(p: string) {
  if (PAGE_LABELS[p]) return PAGE_LABELS[p];
  if (p.startsWith('/trabajos/')) return `Trabajo · ${p.slice('/trabajos/'.length)}`;
  return p;
}

function Bars({ rows, labeller = (k: string) => k }: { rows: { key: string; count: number }[]; labeller?: (k: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return <p className={dash.empty}>Sin datos todavía.</p>;
  return (
    <ol className={styles.bars}>
      {rows.map((r) => (
        <li key={r.key} className={styles.barRow}>
          <span className={styles.barLabel}>{labeller(r.key)}</span>
          <span className={styles.barTrack} aria-hidden="true">
            <span className={styles.barFill} style={{ width: `${(r.count / max) * 100}%` }} />
          </span>
          <span className={styles.barValue}>{r.count}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function EstadisticasPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const { dias } = await searchParams;
  const days = RANGES.some((r) => String(r.days) === dias) ? Number(dias) : 30;
  const hits = await readHits(days);
  const s = summarise(hits, days);
  const maxDay = Math.max(1, ...s.perDay.map((d) => d.views));

  return (
    <div className={dash.page}>
      <header className={dash.header}>
        <Link href="/" className={dash.brand} aria-label={`${site.brandName} - inicio`}>
          <Image src="/images/logo/eme-logo.png" alt={site.brandName} width={100} height={47} priority />
        </Link>
        <div className={dash.headerActions}>
          <ThemeToggle />
          <AdminLogoutButton className={dash.logoutButton} />
        </div>
      </header>

      <nav aria-label="Secciones del panel" className={styles.tabs}>
        <Link href="/admin">Galerías</Link>
        <Link href="/admin/mensajes">Mensajes</Link>
        <Link href="/admin/estadisticas" aria-current="page">
          Estadísticas
        </Link>
      </nav>

      <div className={dash.titleRow}>
        <div>
          <p className={dash.eyebrow}>Analítica propia · sin cookies</p>
          <h1 className={dash.heading}>Visitas</h1>
        </div>
        <div className={styles.ranges} role="group" aria-label="Periodo">
          {RANGES.map((r) => (
            <Link key={r.days} href={`/admin/estadisticas?dias=${r.days}`} className={styles.range} aria-current={r.days === days ? 'true' : undefined}>
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <section className={styles.kpis} aria-label="Resumen">
        <div className={styles.kpi}>
          <span className={styles.kpiValue}>{s.visitors}</span>
          <span className={styles.kpiLabel}>Visitantes</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiValue}>{s.pageViews}</span>
          <span className={styles.kpiLabel}>Páginas vistas</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiValue}>{s.visitors ? (s.pageViews / s.visitors).toFixed(1) : '—'}</span>
          <span className={styles.kpiLabel}>Páginas por visita</span>
        </div>
      </section>

      <section className={styles.block} aria-labelledby="perday-heading">
        <h2 id="perday-heading" className={styles.h2}>
          Por día
        </h2>
        {s.pageViews === 0 ? (
          <p className={dash.empty}>
            Todavía no hay visitas registradas en este periodo. Cada página vista envía un aviso anónimo a /api/hit y se
            guarda en data/analytics/.
          </p>
        ) : (
          <ol className={styles.chart} aria-label="Páginas vistas por día">
            {s.perDay.map((d) => (
              <li key={d.day} className={styles.col} title={`${d.day}: ${d.views} vistas, ${d.visitors} visitantes`}>
                <span className={styles.colBar} style={{ height: `${(d.views / maxDay) * 100}%` }} aria-hidden="true" />
                <span className={styles.colLabel}>{d.day.slice(8)}/{d.day.slice(5, 7)}</span>
                <span className="sr-only">
                  {d.day}: {d.views} vistas, {d.visitors} visitantes
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className={styles.grid}>
        <section className={styles.block} aria-labelledby="pages-heading">
          <h2 id="pages-heading" className={styles.h2}>
            Páginas más vistas
          </h2>
          <Bars rows={s.pages} labeller={pageLabel} />
        </section>
        <section className={styles.block} aria-labelledby="ref-heading">
          <h2 id="ref-heading" className={styles.h2}>
            De dónde vienen
          </h2>
          <Bars rows={s.referrers} />
          {s.campaigns.length > 0 && (
            <>
              <h3 className={styles.h3}>Campañas (utm)</h3>
              <Bars rows={s.campaigns} />
            </>
          )}
        </section>
        <section className={styles.block} aria-labelledby="dev-heading">
          <h2 id="dev-heading" className={styles.h2}>
            Dispositivos
          </h2>
          <Bars rows={s.devices} />
        </section>
      </div>

      <p className={styles.note}>
        Se cuenta una visita por página cargada. Los visitantes únicos se calculan con un código diario que no se puede
        deshacer y que cambia cada día; no se guardan direcciones IP ni se usan cookies, por eso no requiere
        consentimiento. Los robots conocidos y quien activa Global Privacy Control no se cuentan.
      </p>
    </div>
  );
}
