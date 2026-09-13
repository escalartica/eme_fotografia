import { redirect } from 'next/navigation';
import { BrandMark } from '@/components/ui/BrandMark';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/require-session';
import { listGallerySlugs, getGalleryMeta, getSelection } from '@/lib/gallery-store';
import { contarContactSubmissions } from '@/lib/contact-store';
import { srcSetMiniatura } from '@/lib/gallery-srcset';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminLogoutButton } from './AdminLogoutButton';
import styles from './AdminDashboard.module.css';

// El título de la pestaña. Sin él, estas pantallas heredaban el de la portada
// --«Fotógrafo y vídeo de bodas en Sevilla»-- y el estudio, que trabaja con
// varias pestañas abiertas a la vez, no distinguía el panel de la web pública.
// `/admin/mensajes` y `/admin/estadisticas` sí lo tenían; estas cuatro no.
export const metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
};

interface GalleryRow {
  slug: string;
  clientName: string;
  weddingDate?: string;
  username: string;
  photoCount: number;
  createdAt: string;
  likedCount: number;
  commentCount: number;
  /** La primera foto, para que la ficha se vea y no solo se lea. */
  portada: string | null;
  submittedAt: string | null;
  /** La pareja está marcando pero todavía no ha pulsado enviar. */
  enCurso: boolean;
  updatedAt: string | null;
}

async function loadGalleries(): Promise<GalleryRow[]> {
  const slugs = await listGallerySlugs();
  const rows = await Promise.all(
    slugs.map(async (slug) => {
      const meta = await getGalleryMeta(slug);
      if (!meta) return null;
      const selection = await getSelection(slug);
      const likedCount = selection?.items.filter((it) => it.liked).length ?? 0;
      const commentCount = selection?.items.filter((it) => it.comment.trim().length > 0).length ?? 0;
      const row: GalleryRow = {
        slug: meta.slug,
        clientName: meta.clientName,
        weddingDate: meta.weddingDate,
        username: meta.username,
        photoCount: meta.photos.length,
        createdAt: meta.createdAt,
        likedCount,
        commentCount,
        portada: meta.photos[0]?.filename ?? null,
        submittedAt: selection?.submittedAt || null,
        enCurso: selection?.draft === true,
        updatedAt: selection?.updatedAt ?? null,
      };
      return row;
    })
  );
  return rows
    .filter((r): r is GalleryRow => r !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const [galleries, mensajes] = await Promise.all([loadGalleries(), contarContactSubmissions()]);
  const fotosGuardadas = galleries.reduce((suma, g) => suma + g.photoCount, 0);
  const porRevisar = galleries.filter((g) => g.submittedAt).length;
  const eligiendo = galleries.filter((g) => g.enCurso && !g.submittedAt).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label={`${site.brandName} - inicio`}>
          <BrandMark alto={2.2} priority />
        </Link>
        <div className={styles.headerActions}>
          <ThemeToggle />
          <AdminLogoutButton className={styles.logoutButton} />
        </div>
      </header>

      <nav aria-label="Secciones del panel" className={styles.tabs}>
        <Link href="/admin" aria-current="page">
          Galerías
        </Link>
        <Link href="/admin/mensajes">Mensajes</Link>
        <Link href="/admin/estadisticas">Estadísticas</Link>
      </nav>

      {/* EL RESUMEN, que es lo que convierte esto en un panel y no en un
          índice. Antes, la portada del panel no decía NADA de un vistazo:
          había que abrir cada galería para saber si alguien había enviado su
          selección. Cada número es además un enlace a donde se actúa sobre
          él. */}
      <ul className={styles.resumen}>
        <li className={styles.dato}>
          <span className={styles.datoCifra}>{galleries.length}</span>
          <span className={styles.datoRotulo}>
            {galleries.length === 1 ? 'galería' : 'galerías'}
          </span>
        </li>
        <li className={styles.dato}>
          <span className={styles.datoCifra}>{fotosGuardadas}</span>
          <span className={styles.datoRotulo}>fotos guardadas</span>
        </li>
        <li className={styles.dato} data-destaca={porRevisar > 0 ? 'true' : 'false'}>
          <span className={styles.datoCifra}>{porRevisar}</span>
          <span className={styles.datoRotulo}>
            {porRevisar === 1 ? 'selección recibida' : 'selecciones recibidas'}
            {eligiendo > 0 && ` · ${eligiendo} eligiendo`}
          </span>
        </li>
        <li className={styles.dato}>
          <Link href="/admin/mensajes" className={styles.datoEnlace}>
            <span className={styles.datoCifra}>{mensajes}</span>
            <span className={styles.datoRotulo}>{mensajes === 1 ? 'mensaje' : 'mensajes'}</span>
          </Link>
        </li>
      </ul>

      <div className={styles.titleRow}>
        <div>
          <p className={styles.eyebrow}>Panel de administración</p>
          <h1 className={styles.heading}>Galerías privadas</h1>
        </div>
        <Link href="/admin/galerias/nueva" className={styles.newButton}>
          + Nueva galería
        </Link>
      </div>

      {galleries.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitulo}>Aquí todavía no hay nada</p>
          <p className={styles.emptyTexto}>
            Cuando subas la sesión de una pareja, aparecerá aquí con su enlace, su contraseña y lo que vayan
            marcando. Se tarda un par de minutos.
          </p>
          <Link href="/admin/galerias/nueva" className={styles.newButton}>
            Crear la primera galería
          </Link>
        </div>
      ) : (
        <ul className={styles.grid}>
          {galleries.map((gallery) => (
            <li key={gallery.slug} className={styles.card}>
              <Link href={`/admin/galerias/${gallery.slug}`} className={styles.cardLink}>
                {/* La portada. Un panel de un fotógrafo en el que las fichas
                    son solo texto es un panel que no se parece a su trabajo -- y
                    de paso, reconocer una boda por su foto es más rápido que
                    leer cinco nombres. */}
                {gallery.portada ? (
                  <span className={styles.cardFoto}>
                    <img
                      {...srcSetMiniatura(gallery.slug, gallery.portada)}
                      alt=""
                      loading="lazy"
                      className={styles.cardImagen}
                    />
                  </span>
                ) : (
                  <span className={styles.cardFoto} data-vacia="true" aria-hidden="true" />
                )}
                <p className={styles.cardEyebrow}>/{gallery.slug}</p>
                <h2 className={styles.cardHeading}>{gallery.clientName}</h2>
                {gallery.weddingDate && (
                  <p className={styles.cardMeta}>
                    {new Date(`${gallery.weddingDate}T00:00:00`).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
                <p className={styles.cardMeta}>{gallery.photoCount} fotos · usuario {gallery.username}</p>
                {/* TRES ESTADOS, NO DOS. La galería guarda sola mientras la
                    pareja marca, así que ahora hay un estado intermedio real
                    --«está en ello»-- que antes no se podía distinguir de
                    «no ha empezado». Confundirlos significa o dar por
                    cerrada una selección a medias, o llamar a una pareja que
                    está trabajando en ella ahora mismo. */}
                {gallery.submittedAt ? (
                  <p className={styles.cardStatusDone}>
                    {gallery.likedCount} seleccionadas · {gallery.commentCount} con nota
                    {gallery.enCurso && ' · sigue cambiándola'}
                  </p>
                ) : gallery.enCurso ? (
                  <p className={styles.cardStatusProgress}>
                    Están eligiendo: {gallery.likedCount} marcadas
                    {gallery.updatedAt &&
                      ` · última vez el ${new Date(gallery.updatedAt).toLocaleDateString('es-ES')}`}
                  </p>
                ) : (
                  <p className={styles.cardStatusPending}>Todavía no han entrado a elegir</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
