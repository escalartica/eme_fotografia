import { redirect } from 'next/navigation';
import { BrandMark } from '@/components/ui/BrandMark';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/require-session';
import { finDelPeriodoAnterior, readHits, summarise, variacion } from '@/lib/analytics-store';
import { listContactSubmissions } from '@/lib/contact-store';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';
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

/**
 * La variación respecto al mismo periodo justo antes.
 *
 * EL SIGNO VA ESCRITO, no sólo en el color: quien no distingue el verde del
 * rojo tiene que poder leer la cifra igual, y el porcentaje va además en el
 * texto accesible completo para que un lector de pantalla no diga «más
 * treinta por ciento» sin decir respecto a qué.
 */
function Variacion({ actual, anterior, dias }: { actual: number; anterior: number; dias: number }) {
  const v = variacion(actual, anterior);
  if (v === null) {
    return (
      <span className={styles.delta} data-signo="nuevo">
        {anterior === 0 && actual > 0 ? 'sin datos antes' : '—'}
      </span>
    );
  }
  const signo = v > 0 ? 'sube' : v < 0 ? 'baja' : 'igual';
  return (
    <span className={styles.delta} data-signo={signo}>
      <span aria-hidden="true">
        {/* DIBUJADA, NO ESCRITA. Un carácter de flecha en un iPhone sale
            como emoji a color porque ninguna de las dos tipografías del
            sitio lo trae; lo dijo el estudio mirando su propio teléfono, y
            hay una prueba que lo impide en toda la interfaz. */}
        {v !== 0 && <ArrowGlyph dir={v > 0 ? 'up' : 'down'} className={styles.deltaFlecha} />}
        {v > 0 ? '+' : ''}
        {v} %
      </span>
      <span className="sr-only">
        {v > 0 ? 'sube' : v < 0 ? 'baja' : 'igual que'} {Math.abs(v)} % respecto a los {dias} días anteriores
      </span>
    </span>
  );
}

function Kpi({ valor, etiqueta, actual, anterior, dias }: { valor: string; etiqueta: string; actual: number; anterior: number; dias: number }) {
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiValue}>{valor}</span>
      <span className={styles.kpiLabel}>{etiqueta}</span>
      <Variacion actual={actual} anterior={anterior} dias={dias} />
    </div>
  );
}

/** Las consultas recibidas dentro del periodo, y lo que dicen sobre cómo llegaron. */
function contarConsultas(mensajes: { receivedAt: string; comoNosConociste?: string }[], desde: Date, hasta: Date) {
  const dentro = mensajes.filter((m) => {
    const t = new Date(m.receivedAt).getTime();
    return t >= desde.getTime() && t <= hasta.getTime();
  });
  const origen = new Map<string, number>();
  for (const m of dentro) {
    const k = (m.comoNosConociste ?? '').trim() || 'No lo dicen';
    origen.set(k, (origen.get(k) ?? 0) + 1);
  }
  return {
    total: dentro.length,
    origen: [...origen.entries()].sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, count })),
  };
}

export default async function EstadisticasPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const { dias } = await searchParams;
  const days = RANGES.some((r) => String(r.days) === dias) ? Number(dias) : 30;

  const ahora = new Date();
  const finAnterior = finDelPeriodoAnterior(ahora, days);

  // DOS PERIODOS, NO UNO. Una cifra suelta no dice si una campaña ha
  // funcionado. `readHits` cuenta hacia atrás desde la fecha que se le dé,
  // así que el periodo anterior es la misma llamada corrida `days` días.
  const [hits, hitsAntes, mensajes] = await Promise.all([
    readHits(days, undefined, ahora),
    readHits(days, undefined, finAnterior),
    listContactSubmissions(),
  ]);
  const s = summarise(hits, days, ahora);
  const antes = summarise(hitsAntes, days, finAnterior);

  const inicio = new Date(ahora);
  inicio.setUTCDate(inicio.getUTCDate() - days);
  const inicioAntes = new Date(finAnterior);
  inicioAntes.setUTCDate(inicioAntes.getUTCDate() - days);
  const consultas = contarConsultas(mensajes, inicio, ahora);
  const consultasAntes = contarConsultas(mensajes, inicioAntes, finAnterior);

  const conversion = s.visitors ? (consultas.total / s.visitors) * 100 : 0;
  const conversionAntes = antes.visitors ? (consultasAntes.total / antes.visitors) * 100 : 0;

  const maxDay = Math.max(1, ...s.perDay.map((d) => d.views));
  const maxHora = Math.max(1, ...s.porHora.map((h) => h.views));

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

      {/* LAS CUATRO CIFRAS QUE DECIDEN DÓNDE SE GASTA EL DINERO, y las cuatro
          comparadas con el mismo periodo justo antes. Las dos primeras son
          tráfico; las dos últimas son el negocio: cuánta gente escribe y qué
          parte de la que entra acaba escribiendo. Una campaña que dobla las
          visitas y deja las consultas igual está trayendo a la gente
          equivocada, y eso sólo se ve teniendo las cuatro juntas. */}
      <section className={styles.kpis} aria-label="Resumen">
        <Kpi valor={String(s.visitors)} etiqueta="Visitantes" actual={s.visitors} anterior={antes.visitors} dias={days} />
        <Kpi valor={String(s.pageViews)} etiqueta="Páginas vistas" actual={s.pageViews} anterior={antes.pageViews} dias={days} />
        <Kpi valor={String(consultas.total)} etiqueta="Consultas recibidas" actual={consultas.total} anterior={consultasAntes.total} dias={days} />
        <Kpi
          valor={s.visitors ? `${conversion.toFixed(1)} %` : '—'}
          etiqueta="Escriben / visitan"
          actual={Math.round(conversion * 10)}
          anterior={Math.round(conversionAntes * 10)}
          dias={days}
        />
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
        {/* POR DÓNDE ENTRAN, separado de qué páginas se ven. La portada gana
            siempre en «más vistas» porque casi todo el mundo pasa por ella;
            esto cuenta sólo la primera página de cada visita, que es lo que
            hace falta para saber si un anuncio está llevando a la gente a
            donde se ha pagado que la lleve. */}
        <section className={styles.block} aria-labelledby="entradas-heading">
          <h2 id="entradas-heading" className={styles.h2}>
            Por dónde entran
          </h2>
          <Bars rows={s.entradas} labeller={pageLabel} />
        </section>
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
        </section>
      </div>

      {/* LAS CONSULTAS, AL LADO DE LAS VISITAS. Lo que la pareja escribe en
          «cómo nos conociste» no siempre coincide con el referrer --alguien
          que llega desde un anuncio puede decir «me lo recomendó una amiga»,
          y las dos cosas son verdad--. Tenerlas juntas es lo que permite
          distinguir el canal que trae clics del que trae bodas. */}
      <div className={styles.grid}>
        <section className={styles.block} aria-labelledby="consultas-heading">
          <h2 id="consultas-heading" className={styles.h2}>
            Qué dicen los que escriben
          </h2>
          {consultas.total === 0 ? (
            <p className={dash.empty}>Ninguna consulta en este periodo.</p>
          ) : (
            <>
              <Bars rows={consultas.origen} />
              <p className={styles.pie}>
                De <strong>{consultas.total}</strong> {consultas.total === 1 ? 'consulta' : 'consultas'} recibidas.{' '}
                <Link href="/admin/mensajes">Ver los mensajes</Link>
              </p>
            </>
          )}
        </section>

        {/* LAS CAMPAÑAS, SIEMPRE VISIBLES. Antes este bloque sólo aparecía si
            ya había alguna, así que quien no supiera que existe la
            posibilidad de etiquetar un enlace no se enteraba nunca. Cuando
            está vacío explica cómo se usa, que es justo cuando hace falta. */}
        <section className={styles.block} aria-labelledby="camp-heading">
          <h2 id="camp-heading" className={styles.h2}>
            Campañas
          </h2>
          {s.campaigns.length > 0 ? (
            <Bars rows={s.campaigns} />
          ) : (
            <p className={dash.empty}>Ninguna visita etiquetada en este periodo.</p>
          )}
          <details className={styles.ayuda}>
            <summary>Cómo etiquetar un enlace</summary>
            <p>
              Añade <code>?utm_source=</code> y <code>utm_medium=</code> al final del enlace que publiques. La web lo
              guarda y aparece aquí, así se sabe qué trae visitas de verdad y qué no.
            </p>
            <ul>
              <li>
                Biografía de Instagram:
                <br />
                <code>{`${site.siteUrl}/?utm_source=instagram&utm_medium=bio`}</code>
              </li>
              <li>
                Enlace de una story:
                <br />
                <code>{`${site.siteUrl}/trabajos?utm_source=instagram&utm_medium=story`}</code>
              </li>
              <li>
                Un correo a la lista:
                <br />
                <code>{`${site.siteUrl}/?utm_source=newsletter&utm_medium=email&utm_campaign=temporada-2027`}</code>
              </li>
              <li>
                Un anuncio de Facebook:
                <br />
                <code>{`${site.siteUrl}/servicios/fotografia-de-boda?utm_source=facebook&utm_medium=ads&utm_campaign=bodas-otono`}</code>
              </li>
            </ul>
            <p>
              Usa siempre las mismas palabras para lo mismo (<code>instagram</code>, no <code>Instagram</code> un día e{' '}
              <code>IG</code> otro): si cambian, aquí salen como campañas distintas.
            </p>
          </details>
        </section>

        <section className={styles.block} aria-labelledby="dev-heading">
          <h2 id="dev-heading" className={styles.h2}>
            Dispositivos
          </h2>
          <Bars rows={s.devices} />
          {/* A QUÉ HORA MIRAN LA WEB. Es el dato para decidir cuándo se manda
              un correo o a qué hora se programa un anuncio, y no se parece al
              de una tienda: aquí la gente entra por la noche, desde el sofá.
              La hora es UTC, como todo lo que guarda este fichero, y en
              España eso son una o dos horas menos que el reloj de la pared;
              se avisa debajo en vez de convertirla, que sería inventarse la
              zona horaria de quien visita. */}
          <h3 className={styles.h3}>A qué hora</h3>
          <ol className={styles.horas} aria-label="Páginas vistas por hora (UTC)">
            {s.porHora.map((h) => (
              <li key={h.hora} className={styles.hora} title={`${String(h.hora).padStart(2, '0')}:00 UTC — ${h.views} vistas`}>
                <span className={styles.horaBar} style={{ height: `${(h.views / maxHora) * 100}%` }} aria-hidden="true" />
                <span className={styles.horaLabel} aria-hidden="true">
                  {h.hora % 6 === 0 ? String(h.hora).padStart(2, '0') : ''}
                </span>
                <span className="sr-only">
                  {String(h.hora).padStart(2, '0')}:00 UTC: {h.views} vistas
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.pie}>Hora UTC: en España, una hora menos en invierno y dos en verano.</p>
        </section>
      </div>

      <p className={styles.note}>
        Se cuenta una visita por página cargada. Los visitantes únicos se calculan con un código diario que no se puede
        deshacer y que cambia cada día; no se guardan direcciones IP ni se usan cookies, por eso no requiere
        consentimiento. Ese código cambia cada noche, así que la misma persona dos días seguidos cuenta como dos
        visitantes. Los robots conocidos y quien activa Global Privacy Control no se cuentan.
      </p>

      {/* NO CONTARSE A UNO MISMO. Va aquí abajo, junto a la explicación de
          cómo se cuenta, porque es parte de lo mismo: saber qué entra en
          estas cifras y qué no. */}
      <p className={styles.note}>
        <strong>Tus propias visitas.</strong> Si entras en la web a diario a enseñarla o a revisar algo, esas visitas
        engordan estas cifras. Para dejar de contarte en este navegador, abre{' '}
        <code>{`${site.siteUrl}/?sinestadisticas=1`}</code> una vez. Se queda puesto en este aparato hasta que abras{' '}
        <code>{`${site.siteUrl}/?sinestadisticas=0`}</code>. Hay que hacerlo una vez en cada móvil y cada ordenador
        desde el que mires la web.
      </p>
    </div>
  );
}
