import { redirect } from 'next/navigation';
import { BrandMark } from '@/components/ui/BrandMark';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/require-session';
import { listGallerySlugs, getGalleryMeta, getSelection } from '@/lib/gallery-store';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminLogoutButton } from './AdminLogoutButton';
import styles from './AdminDashboard.module.css';

export const metadata = {
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
  submittedAt: string | null;
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
        submittedAt: selection?.submittedAt ?? null,
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

  const galleries = await loadGalleries();

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
        <p className={styles.empty}>
          Todavía no has creado ninguna galería. Pulsa &ldquo;+ Nueva galería&rdquo; para subir la
          primera sesión de fotos y asignarle un usuario y contraseña para tu cliente.
        </p>
      ) : (
        <ul className={styles.grid}>
          {galleries.map((gallery) => (
            <li key={gallery.slug} className={styles.card}>
              <Link href={`/admin/galerias/${gallery.slug}`} className={styles.cardLink}>
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
                {gallery.submittedAt ? (
                  <p className={styles.cardStatusDone}>
                    {gallery.likedCount} seleccionadas · {gallery.commentCount} con nota
                  </p>
                ) : (
                  <p className={styles.cardStatusPending}>El cliente todavía no ha enviado su selección</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
