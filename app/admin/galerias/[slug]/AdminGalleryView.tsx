'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HeartIcon, CommentIcon } from '@/components/ui/Icon';
import { Lightbox } from '@/components/motion/Lightbox';
import type { GalleryPhoto, SelectionItem } from '@/lib/gallery-store';
import styles from './AdminGalleryView.module.css';
import { srcSetMiniatura, srcSetVisor } from '@/lib/gallery-srcset';
import { GalleryAdminActions } from './GalleryAdminActions';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

type Filtro = 'todas' | 'marcadas' | 'notas';

interface Props {
  slug: string;
  clientName: string;
  weddingDate?: string;
  username: string;
  shareUrl: string;
  photos: GalleryPhoto[];
  items: SelectionItem[];
  submittedAt: string | null;
  /** La pareja está marcando pero todavía no ha pulsado enviar. */
  enCurso: boolean;
  updatedAt: string | null;
}

/**
 * Read-only mirror of app/[slug]/GalleryClient.tsx, from the studio's
 * side: the same grid and the same heart/comment language, but nothing
 * here is interactive selection state -- it's the client's own answer,
 * already submitted. Reusing the visual language (not the component
 * itself, since the interaction model is entirely different: no
 * toggling, no textarea, an always-visible comment instead of a
 * collapsible one) keeps "what a liked photo looks like" consistent
 * between the two people looking at the same gallery.
 */
export function AdminGalleryView({ slug, clientName, weddingDate, username, shareUrl, photos, items, submittedAt, enCurso, updatedAt }: Props) {
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [copiado, setCopiado] = useState(false);
  const [nombresALaVista, setNombresALaVista] = useState<string | null>(null);
  const byId = new Map(items.map((it) => [it.photoId, it]));
  const likedCount = items.filter((it) => it.liked).length;
  const commentCount = items.filter((it) => it.comment.trim().length > 0).length;

  /**
   * EL MISMO FILTRO QUE TIENE LA PAREJA, y por el mismo motivo.
   *
   * Una boda son ciento ochenta fotos y la pareja marca treinta. Sin esto hay
   * que bajar por las ciento ochenta buscando corazones, que es justo el
   * trabajo que esta pantalla existe para ahorrar.
   */
  const visibles = useMemo(() => {
    if (filtro === 'marcadas') return photos.filter((p) => byId.get(p.id)?.liked);
    if (filtro === 'notas') return photos.filter((p) => (byId.get(p.id)?.comment.trim() ?? '') !== '');
    return photos;
    // byId se reconstruye en cada render a partir de items; la dependencia real es items.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, photos, items]);

  /**
   * LOS NOMBRES DE FICHERO DE LAS MARCADAS, al portapapeles.
   *
   * Lo siguiente que pasa después de mirar esta pantalla es abrir el
   * revelador y buscar esas mismas fotos en la tarjeta. Copiar treinta
   * nombres a mano de una pantalla a otra es donde se cuela el error que
   * luego aparece en el álbum.
   */
  async function copiarNombres() {
    const nombres = photos.filter((p) => byId.get(p.id)?.liked).map((p) => p.filename).join('\n');
    setNombresALaVista(null);
    try {
      await navigator.clipboard.writeText(nombres);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      // El portapapeles puede no estar disponible (un contexto no seguro, un
      // navegador viejo). Callarse era lo peor: el botón no cambiaba, y desde
      // el otro lado eso se lee como «no le he dado bien» y se vuelve a
      // pulsar. Si no se puede copiar, al menos se enseñan para copiarlos a
      // mano -- la cuadrícula tiene fotos, no nombres de fichero.
      setNombresALaVista(nombres);
    }
  }

  return (
    <div className={styles.page}>
      <Link href="/admin" className={styles.back}>
        <ArrowGlyph dir="left" />{' '}
        Volver al panel
      </Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>/{slug}</p>
        <h1 className={styles.heading}>{clientName}</h1>
        {weddingDate && (
          <p className={styles.date}>
            {new Date(`${weddingDate}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt>Enlace</dt>
            <dd><code>{shareUrl}</code></dd>
          </div>
          <div className={styles.infoRow}>
            <dt>Usuario</dt>
            <dd><code>{username}</code></dd>
          </div>
        </dl>
        <p className={styles.passwordNote}>
          La contraseña no se guarda en claro en ningún sitio, así que no se puede consultar. Si tu
          cliente la ha perdido, ponle una nueva ahí abajo.
        </p>

        {/* Tres estados, no dos: desde que la galería guarda sola mientras la
            pareja marca, «está en ello» dejó de ser lo mismo que «no ha
            empezado». Ver el comentario de `draft` en lib/gallery-store.ts. */}
        {submittedAt ? (
          <p className={styles.statusDone}>
            Selección recibida el {new Date(submittedAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
            {' · '}{likedCount} fotos seleccionadas · {commentCount} con nota
            {enCurso && ' · siguen cambiándola'}
          </p>
        ) : enCurso ? (
          <p className={styles.statusProgress}>
            Están eligiendo ahora mismo: {likedCount} marcadas · {commentCount} con nota
            {updatedAt &&
              ` · última vez el ${new Date(updatedAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}`}
            . Espera a que la envíen antes de dar la lista por buena.
          </p>
        ) : (
          <p className={styles.statusPending}>Tu cliente todavía no ha entrado a elegir.</p>
        )}
      </header>

      {(likedCount > 0 || commentCount > 0) && (
        <div className={styles.barraFiltros}>
          <div className={styles.filtros} role="group" aria-label="Filtrar las fotos">
            <button
              type="button"
              className={styles.filtro}
              aria-pressed={filtro === 'todas'}
              onClick={() => setFiltro('todas')}
            >
              Todas <span className={styles.filtroCuenta}>{photos.length}</span>
            </button>
            {likedCount > 0 && (
              <button
                type="button"
                className={styles.filtro}
                aria-pressed={filtro === 'marcadas'}
                onClick={() => setFiltro('marcadas')}
              >
                Marcadas <span className={styles.filtroCuenta}>{likedCount}</span>
              </button>
            )}
            {commentCount > 0 && (
              <button
                type="button"
                className={styles.filtro}
                aria-pressed={filtro === 'notas'}
                onClick={() => setFiltro('notas')}
              >
                Con nota <span className={styles.filtroCuenta}>{commentCount}</span>
              </button>
            )}
          </div>

          {/* El propio texto del botón es el acuse: cambiarlo ya lo anuncia un
              lector de pantalla. Con una región viva además, lo decía dos
              veces. */}
          {likedCount > 0 && (
            <button type="button" className={styles.copiarNombres} onClick={copiarNombres}>
              {copiado ? 'Nombres copiados' : 'Copiar los nombres de las marcadas'}
            </button>
          )}
          {nombresALaVista && (
            <label className={styles.nombresSueltos}>
              Tu navegador no nos ha dejado copiarlos. Aquí los tienes:
              <textarea readOnly rows={4} value={nombresALaVista} />
            </label>
          )}
        </div>
      )}

      <ul className={styles.grid}>
        {visibles.map((photo) => {
          const item = byId.get(photo.id);
          const liked = item?.liked ?? false;
          const comment = item?.comment.trim() ?? '';
          return (
            <li key={photo.id} className={styles.item} data-liked={liked ? 'true' : 'false'}>
              <button
                type="button"
                className={styles.photoButton}
                onClick={() => setLightboxPhoto(photo)}
                aria-label={liked ? `${photo.alt} — seleccionada` : photo.alt}
              >
                <img {...srcSetMiniatura(slug, photo.filename)} alt={photo.alt} loading="lazy" className={styles.image} />
                {liked && (
                  <span className={styles.likedBadge}>
                    <HeartIcon size={16} fill="currentColor" />
                  </span>
                )}
              </button>
              {comment && (
                <p className={styles.comment}>
                  <CommentIcon size={14} />
                  <span>{comment}</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <GalleryAdminActions slug={slug} clientName={clientName} />

      <Lightbox isOpen={lightboxPhoto !== null} onClose={() => setLightboxPhoto(null)}>
        {lightboxPhoto && (
          <div className={styles.lightboxImageWrap}>
            <img {...srcSetVisor(slug, lightboxPhoto.filename)} alt={lightboxPhoto.alt} />
          </div>
        )}
      </Lightbox>
    </div>
  );
}
