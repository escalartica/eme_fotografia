'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { HeartIcon, CommentIcon, CheckIcon } from '@/components/ui/Icon';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';
import { Lightbox } from '@/components/motion/Lightbox';
import type { GalleryPhoto, Selection } from '@/lib/gallery-store';
import styles from './GalleryClient.module.css';
import { srcSetMiniatura, srcSetVisor } from '@/lib/gallery-srcset';
import { GalleryWelcome } from './GalleryWelcome';

interface ItemState {
  liked: boolean;
  comment: string;
}

type Filtro = 'todas' | 'favoritas' | 'notas';
type Guardado = 'quieto' | 'guardando' | 'guardado' | 'fallo';

/** Lo que se espera desde la última tecla hasta guardar el borrador. Bastante
 *  para que marcar diez fotos seguidas sea UNA escritura y no diez. */
/** Lo que hay que arrastrar para que cuente como pasar de foto. */
const MINIMO_DESLIZAR = 48;

const ESPERA_GUARDADO_MS = 1500;
/** Lo que se espera antes de volver a intentar un guardado que ha fallado. */
const REINTENTO_MS = 15_000;

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
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [visorEn, setVisorEn] = useState<number | null>(null);
  /**
   * LA LISTA QUE RECORRE EL VISOR SE CONGELA AL ABRIRLO.
   *
   * Si recorriera `visibles`, con el filtro en «favoritas» quitarle el
   * corazón a la foto que se está mirando la sacaría de la lista AL
   * INSTANTE: la fotografía cambiaría sola debajo del dedo, y si era la
   * última, el visor se cerraría de golpe. Y quitar corazones mirando las
   * favoritas es exactamente lo que hace una pareja repasando su selección.
   *
   * Congelada, quitar el corazón hace lo que se espera: la foto se queda
   * donde está, sin marcar. La cuadrícula de debajo ya se ha enterado, y al
   * cerrar el visor se ve actualizada.
   */
  const [listaCongelada, setListaCongelada] = useState<GalleryPhoto[] | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(
    initialSelection?.draft ? null : (initialSelection?.submittedAt ?? null)
  );
  const [guardado, setGuardado] = useState<Guardado>('quieto');
  const [loggingOut, setLoggingOut] = useState(false);

  const likedCount = useMemo(() => Object.values(items).filter((it) => it.liked).length, [items]);
  const conNota = useMemo(() => Object.values(items).filter((it) => it.comment.trim() !== '').length, [items]);

  const visibles = useMemo(() => {
    if (filtro === 'favoritas') return photos.filter((p) => items[p.id]?.liked);
    if (filtro === 'notas') return photos.filter((p) => items[p.id]?.comment.trim() !== '');
    return photos;
  }, [filtro, photos, items]);

  /** Lo que recorre el visor: la lista de cuando se abrió, o la de ahora si
   *  está cerrado. Ver el comentario de `listaCongelada`. */
  const listaVisor = listaCongelada ?? visibles;

  const enviar = useCallback(
    async (borrador: boolean) => {
      const body = {
        borrador,
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
        throw new Error(data?.error ?? 'No hemos podido guardar.');
      }
    },
    [items, photos, slug]
  );

  /**
   * GUARDADO AUTOMÁTICO. Revisar doscientas fotos es una tarea larga, y antes
   * todo ese trabajo vivía en la memoria del navegador hasta que alguien
   * pulsaba «Enviar»: cerrar la pestaña sin querer, quedarse sin batería o que
   * el móvil descargara la página en segundo plano lo borraba entero.
   *
   * Se guarda como BORRADOR, no como envío: el panel del estudio tiene que
   * seguir distinguiendo «está en ello» de «ya nos la ha mandado», o eme
   * empezaría a revelar con una lista a medias (ver `draft` en
   * lib/gallery-store.ts).
   *
   * El primer renderizado no guarda nada: entrar a mirar no es editar.
   */
  const noGuardarTodavia = useRef(true);
  useEffect(() => {
    if (noGuardarTodavia.current) {
      noGuardarTodavia.current = false;
      return;
    }
    /**
     * Y SI FALLA, SE REINTENTA DE VERDAD.
     *
     * El aviso decía «lo reintentamos solo» y no era cierto: sólo se volvía a
     * intentar si la pareja tocaba algo más. Quien marcaba su última foto
     * justo cuando se cae el wifi perdía ese último cambio sin enterarse,
     * porque el texto le decía que estaba resuelto.
     */
    let cancelado = false;
    let reintento: number | undefined;

    const guardar = () => {
      setGuardado('guardando');
      enviar(true)
        .then(() => {
          if (!cancelado) setGuardado('guardado');
        })
        .catch(() => {
          if (cancelado) return;
          setGuardado('fallo');
          reintento = window.setTimeout(guardar, REINTENTO_MS);
        });
    };

    const t = window.setTimeout(guardar, ESPERA_GUARDADO_MS);
    return () => {
      cancelado = true;
      window.clearTimeout(t);
      if (reintento) window.clearTimeout(reintento);
    };
  }, [items, enviar]);

  // Flechas para pasar de foto con el visor abierto. No se roban cuando el
  // cursor está dentro de la nota: ahí las flechas mueven el cursor por el
  // texto, que es lo que espera quien está escribiendo.
  useEffect(() => {
    if (visorEn === null) return;
    const alPulsar = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null;
      if (destino && /^(TEXTAREA|INPUT)$/.test(destino.tagName)) return;
      if (e.key === 'ArrowRight') setVisorEn((i) => (i === null ? null : Math.min(i + 1, listaVisor.length - 1)));
      if (e.key === 'ArrowLeft') setVisorEn((i) => (i === null ? null : Math.max(i - 1, 0)));
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [visorEn, listaVisor.length]);

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
      await enviar(false);
      setLastSubmittedAt(new Date().toISOString());
      setSubmitStatus('done');
      setGuardado('quieto');
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : 'No hemos podido enviar la selección. Probad otra vez en un momento.'
      );
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

  const foto = visorEn === null ? null : (listaVisor[visorEn] ?? null);

  function abrirVisor(index: number) {
    setListaCongelada(visibles);
    setVisorEn(index);
  }

  const cerrarVisor = useCallback(() => {
    setVisorEn(null);
    setListaCongelada(null);
  }, []);

  /**
   * DESLIZAR PARA PASAR DE FOTO. En un móvil, el gesto de pasar una foto es
   * arrastrar, no buscar una flecha de 44 px con el pulgar. Las flechas se
   * quedan: son las que funcionan con ratón, con teclado y para quien no
   * sabe que se puede deslizar.
   *
   * Solo cuenta el arrastre horizontal y solo si es más largo que el
   * vertical, que si no, bajar por el visor pasaría fotos sin querer.
   */
  const tacto = useRef<{ x: number; y: number } | null>(null);

  function alEmpezarElGesto(e: React.TouchEvent) {
    const t = e.touches[0];
    tacto.current = { x: t.clientX, y: t.clientY };
  }

  function alTerminarElGesto(e: React.TouchEvent) {
    const inicio = tacto.current;
    tacto.current = null;
    if (!inicio || visorEn === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - inicio.x;
    const dy = t.clientY - inicio.y;
    if (Math.abs(dx) < MINIMO_DESLIZAR || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0) setVisorEn(Math.min(visorEn + 1, listaVisor.length - 1));
    else setVisorEn(Math.max(visorEn - 1, 0));
  }

  return (
    <div className={styles.page} data-visor={foto ? 'abierto' : 'cerrado'}>
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

      <GalleryWelcome nombre={clientName} />

      {/* Los filtros aparecen cuando sirven de algo. Con cero favoritas, un
          botón «Favoritas (0)» solo enseña una pantalla vacía. */}
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
            aria-pressed={filtro === 'favoritas'}
            onClick={() => setFiltro('favoritas')}
          >
            Favoritas <span className={styles.filtroCuenta}>{likedCount}</span>
          </button>
        )}
        {conNota > 0 && (
          <button
            type="button"
            className={styles.filtro}
            aria-pressed={filtro === 'notas'}
            onClick={() => setFiltro('notas')}
          >
            Con nota <span className={styles.filtroCuenta}>{conNota}</span>
          </button>
        )}
      </div>

      <ul className={styles.grid}>
        {visibles.map((photo, index) => {
          const state = items[photo.id];
          const commentOpen = openCommentId === photo.id;
          return (
            <li key={photo.id} className={styles.item} data-liked={state.liked ? 'true' : 'false'}>
              <div className={styles.frame}>
                <button
                  type="button"
                  className={styles.photoButton}
                  onClick={() => abrirVisor(index)}
                  aria-label={`Ver ${photo.alt} en grande`}
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
                    placeholder="Ej. esta para el álbum; o: aquí sale mi abuela, no puede faltar"
                    rows={2}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {visibles.length === 0 && (
        <p className={styles.vacio}>
          Aquí no hay ninguna todavía.{' '}
          <button type="button" className={styles.enlaceBoton} onClick={() => setFiltro('todas')}>
            Ver todas las fotos
          </button>
        </p>
      )}

      <div className={styles.submitBar}>
        <div className={styles.submitInfo}>
          {/* El contador es la ÚNICA confirmación de que el corazón ha hecho
              algo: el resto del cambio es un anillo de color alrededor de la
              foto y el relleno del icono, los dos visuales. Sin aria-live,
              quien navega con lector de pantalla marcaba fotos a ciegas y no
              sabía cuántas llevaba (WCAG 4.1.3). El propio botón ya anuncia
              su aria-pressed; esto añade el total. */}
          <span className={styles.likedCount} aria-live="polite" aria-atomic="true">
            {likedCount === 0
              ? 'Todavía no habéis marcado ninguna'
              : `${likedCount} ${likedCount === 1 ? 'foto favorita' : 'fotos favoritas'}`}
            {conNota > 0 && ` · ${conNota} con nota`}
          </span>

          {submitStatus === 'done' && (
            <span className={styles.submitConfirm} role="status">
              <CheckIcon size={16} /> Nos ha llegado. Gracias.
            </span>
          )}
          {submitStatus === 'error' && submitError && (
            <span className={styles.submitErrorText} role="alert">{submitError}</span>
          )}
          {submitStatus !== 'done' && submitStatus !== 'error' && (
            <span className={styles.estadoGuardado} aria-live="polite">
              {guardado === 'guardando' && 'Guardando…'}
              {guardado === 'guardado' && 'Guardado. Podéis cerrar y seguir otro día.'}
              {guardado === 'fallo' && 'No hemos podido guardar. Seguid marcando: lo reintentamos solo.'}
              {guardado === 'quieto' &&
                (lastSubmittedAt
                  ? `Enviada el ${new Date(lastSubmittedAt).toLocaleDateString('es-ES')}`
                  : 'Se guarda solo mientras marcáis')}
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={submitStatus === 'submitting'}
        >
          {submitStatus === 'submitting' ? 'Enviando…' : lastSubmittedAt ? 'Enviar de nuevo' : 'Enviar a eme'}
        </button>
      </div>

      <Lightbox isOpen={foto !== null} onClose={cerrarVisor}>
        {foto && visorEn !== null && (
          <div className={styles.visor}>
            <div
              className={styles.lightboxImageWrap}
              onTouchStart={alEmpezarElGesto}
              onTouchEnd={alTerminarElGesto}
            >
              <img {...srcSetVisor(slug, foto.filename)} alt={foto.alt} />
              {/* LA SIGUIENTE Y LA ANTERIOR, PEDIDAS YA. Son fotos de boda a
                  pantalla completa: sin esto, cada flecha (y cada gesto) deja
                  un hueco en blanco mientras descarga. Van vacías de texto
                  alternativo y fuera del árbol de accesibilidad porque no son
                  contenido, son una descarga adelantada. */}
              {[visorEn - 1, visorEn + 1]
                .filter((i) => i >= 0 && i < listaVisor.length && i !== visorEn)
                .map((i) => (
                  <img
                    key={listaVisor[i].id}
                    {...srcSetVisor(slug, listaVisor[i].filename)}
                    alt=""
                    aria-hidden="true"
                    className={styles.precarga}
                  />
                ))}
            </div>

            {/* MARCAR Y COMENTAR SIN SALIR DEL VISOR. Antes había que cerrar,
                buscar la foto en la cuadrícula y acertarle a un botón de la
                esquina. Y el momento en que alguien decide que una foto le
                encanta es justo este: viéndola grande. */}
            <div className={styles.visorBarra}>
              <button
                type="button"
                className={styles.visorNav}
                onClick={() => setVisorEn(Math.max(visorEn - 1, 0))}
                disabled={visorEn === 0}
                aria-label="Foto anterior"
              >
                <ArrowGlyph dir="left" />
              </button>

              <div className={styles.visorAcciones}>
                <button
                  type="button"
                  className={styles.visorCorazon}
                  aria-pressed={items[foto.id].liked}
                  onClick={() => toggleLike(foto.id)}
                >
                  <HeartIcon size={20} fill={items[foto.id].liked ? 'currentColor' : 'none'} />
                  {items[foto.id].liked ? 'Me gusta' : 'Marcar'}
                </button>
                <span className={styles.visorCuenta}>
                  {visorEn + 1} de {listaVisor.length}
                </span>
              </div>

              <button
                type="button"
                className={styles.visorNav}
                onClick={() => setVisorEn(Math.min(visorEn + 1, listaVisor.length - 1))}
                disabled={visorEn === listaVisor.length - 1}
                aria-label="Foto siguiente"
              >
                <ArrowGlyph dir="right" />
              </button>
            </div>

            <div className={styles.visorNota}>
              <label htmlFor={`visor-nota-${foto.id}`} className={styles.commentLabel}>
                Nota para esta foto
              </label>
              <textarea
                id={`visor-nota-${foto.id}`}
                className={styles.commentInput}
                value={items[foto.id].comment}
                onChange={(e) => setComment(foto.id, e.target.value)}
                placeholder="Ej. esta para el álbum; o: aquí sale mi abuela, no puede faltar"
                rows={2}
              />
              {/* La barra de abajo, que es donde vive el «Guardado», se
                  esconde mientras el visor está abierto: sin esta línea,
                  escribir una nota aquí dentro no confirmaba nada. */}
              <p className={styles.visorGuardado} aria-live="polite">
                {guardado === 'guardando' && 'Guardando…'}
                {guardado === 'guardado' && 'Guardado'}
                {guardado === 'fallo' && 'No hemos podido guardar. Lo reintentamos solo.'}
                {guardado === 'quieto' && 'Se guarda solo'}
              </p>
            </div>
          </div>
        )}
      </Lightbox>
    </div>
  );
}
