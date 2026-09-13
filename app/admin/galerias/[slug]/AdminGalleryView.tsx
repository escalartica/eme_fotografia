'use client';
import { useState } from 'react';
import Link from 'next/link';
import { HeartIcon, CommentIcon } from '@/components/ui/Icon';
import { Lightbox } from '@/components/motion/Lightbox';
import type { GalleryPhoto, SelectionItem } from '@/lib/gallery-store';
import styles from './AdminGalleryView.module.css';
import { srcSetMiniatura, srcSetVisor } from '@/lib/gallery-srcset';
import { GalleryAdminActions } from './GalleryAdminActions';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

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
  const byId = new Map(items.map((it) => [it.photoId, it]));
  const likedCount = items.filter((it) => it.liked).length;
  const commentCount = items.filter((it) => it.comment.trim().length > 0).length;

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

      <ul className={styles.grid}>
        {photos.map((photo) => {
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
