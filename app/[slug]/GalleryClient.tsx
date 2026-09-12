'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { HeartIcon, CommentIcon, CheckIcon } from '@/components/ui/Icon';
import { Lightbox } from '@/components/motion/Lightbox';
import type { GalleryPhoto, Selection } from '@/lib/gallery-store';
import styles from './GalleryClient.module.css';
import { srcSetMiniatura, srcSetVisor } from '@/lib/gallery-srcset';

interface ItemState {
  liked: boolean;
  comment: string;
}

function initialState(photos: GalleryPhoto[], selection: Selection | null): Record<string, ItemState> {
  const byId = new Map((selection?.items ?? []).map((it) => [it.photoId, it]));
  const state: Record<string, ItemState> = {};
  for (const photo of photos) {
    const existing = byId.get(photo.id);
    state[photo.id] = { liked: existing?.liked ?? false, comment: existing?.comment ?? '' };
  }
  return state;
}

export function GalleryClient({
  slug,
  clientName,
  weddingDate,
  photos,
  initialSelection,
}: {
  slug: string;
  clientName: string;
  weddingDate?: string;
  photos: GalleryPhoto[];
  initialSelection: Selection | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Record<string, ItemState>>(() => initialState(photos, initialSelection));
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(initialSelection?.submittedAt ?? null);
  const [loggingOut, setLoggingOut] = useState(false);

  const likedCount = useMemo(() => Object.values(items).filter((it) => it.liked).length, [items]);

  function toggleLike(photoId: string) {
    setItems((prev) => ({ ...prev, [photoId]: { ...prev[photoId], liked: !prev[photoId].liked } }));
  }

  function setComment(photoId: string, comment: string) {
    setItems((prev) => ({ ...prev, [photoId]: { ...prev[photoId], comment } }));
  }

  async function handleSubmit() {
    setSubmitStatus('submitting');
    setSubmitError(null);
    try {
      const body = {
        items: photos.map((p) => ({
          photoId: p.id,
          liked: items[p.id]?.liked ?? false,
          comment: items[p.id]?.comment ?? '',
        })),
      };
      const res = await fetch(`/api/galeria/${slug}/seleccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSubmitError(data?.error ?? 'No hemos podido enviar la selección. Probad otra vez en un momento.');
        setSubmitStatus('error');
        return;
      }
      setLastSubmittedAt(new Date().toISOString());
      setSubmitStatus('done');
    } catch {
      setSubmitError('No hemos podido conectar. Comprobad la conexión y probad otra vez: lo que habéis marcado sigue aquí.');
      setSubmitStatus('error');
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch(`/api/galeria/${slug}/logout`, { method: 'POST' });
    } finally {
      router.refresh();
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Galería privada — {site.brandName}</p>
          <h1 className={styles.heading}>{clientName}</h1>
          {weddingDate && (
            <p className={styles.date}>
              {new Date(`${weddingDate}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
          <ThemeToggle />
          <button type="button" className={styles.logout} onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </header>

      <p className={styles.instructions}>
        Marcad con el corazón las fotos que queráis y, si hace falta, dejad una nota en cualquiera de ellas.
        Cuando acabéis, pulsad <strong>Enviar selección</strong>. Podéis volver y cambiarla las veces que queráis.
      </p>

      <ul className={styles.grid}>
        {photos.map((photo, index) => {
          const state = items[photo.id];
          const commentOpen = openCommentId === photo.id;
          return (
            <li key={photo.id} className={styles.item} data-liked={state.liked ? 'true' : 'false'}>
              <div className={styles.frame}>
                <button
                  type="button"
                  className={styles.photoButton}
                  onClick={() => setLightboxPhoto(photo)}
                  aria-label={`Ver ${photo.alt} en tamaño completo`}
                >
                  <img
                    {...srcSetMiniatura(slug, photo.filename)}
                    alt={photo.alt}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    className={styles.image}
                  />
                </button>
                <div className={styles.overlayControls}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-pressed={state.liked}
                    aria-label={state.liked ? 'Quitar me gusta de esta foto' : 'Me gusta esta foto'}
                    onClick={() => toggleLike(photo.id)}
                  >
                    <HeartIcon size={18} fill={state.liked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    // Solo `aria-expanded`. Con los dos, el lector de
                    // pantalla decía «pulsado, expandido» para un único
                    // estado. `aria-expanded` es el correcto aquí: el botón
                    // no conmuta nada, abre un panel.
                    aria-expanded={commentOpen}
                    aria-label={state.comment ? 'Editar comentario de esta foto' : 'Añadir comentario a esta foto'}
                    onClick={() => setOpenCommentId(commentOpen ? null : photo.id)}
                  >
                    <CommentIcon size={18} />
                    {state.comment && <span className={styles.commentDot} aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <div
                className={styles.commentPanel}
                data-open={commentOpen ? 'true' : 'false'}
                inert={!commentOpen}
              >
                <div className={styles.commentPanelInner}>
                  <label htmlFor={`comment-${photo.id}`} className={styles.commentLabel}>
                    Nota para esta foto
                  </label>
                  <textarea
                    id={`comment-${photo.id}`}
                    className={styles.commentInput}
                    value={state.comment}
                    onChange={(e) => setComment(photo.id, e.target.value)}
                    placeholder="Ej. esta es una de mis favoritas, o: prefiero sin este encuadre…"
                    rows={2}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.submitBar}>
        <div className={styles.submitInfo}>
          {/* El contador es la ÚNICA confirmación de que el corazón ha hecho
              algo: el resto del cambio es un anillo de color alrededor de la
              foto y el relleno del icono, los dos visuales. Sin aria-live,
              quien navega con lector de pantalla marcaba fotos a ciegas y no
              sabía cuántas llevaba (WCAG 4.1.3). El propio botón ya anuncia
              su aria-pressed; esto añade el total. */}
          <span className={styles.likedCount} aria-live="polite" aria-atomic="true">
            {likedCount} {likedCount === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}
          </span>
          {submitStatus === 'done' && (
            <span className={styles.submitConfirm} role="status">
              <CheckIcon size={16} /> Selección enviada. Ya la tenemos.
            </span>
          )}
          {submitStatus === 'error' && submitError && (
            <span className={styles.submitErrorText} role="alert">{submitError}</span>
          )}
          {submitStatus !== 'done' && submitStatus !== 'error' && lastSubmittedAt && (
            <span className={styles.lastSubmitted}>
              Última selección enviada el {new Date(lastSubmittedAt).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={submitStatus === 'submitting'}
        >
          {submitStatus === 'submitting' ? 'Enviando…' : 'Enviar selección'}
        </button>
      </div>

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
