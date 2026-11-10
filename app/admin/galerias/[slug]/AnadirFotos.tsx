'use client';
import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UploadIcon } from '@/components/ui/Icon';
import { MAX_FOTOS_POR_GALERIA } from '@/lib/gallery-limits';
import { enviarConProgreso, subirEnTandas, type Avance } from '@/lib/subir-por-tandas';
import styles from '../nueva/NewGalleryForm.module.css';

const TIPOS_ADMITIDOS = new Set(['image/webp', 'image/jpeg', 'image/png', 'image/avif']);

/**
 * La barra de una subida por tandas. La comparten el alta de una galería y
 * «Añadir fotos», para que las dos digan lo mismo de la misma manera.
 *
 * Cuenta FOTOS, no megas: con 1.200 fotos repartidas en treinta peticiones,
 * «412 de 1.200 fotos» es lo que alguien necesita para saber cuánto le
 * queda; un porcentaje de la petición en curso volvería a cero treinta veces.
 */
export function ProgresoSubida({ avance }: { avance: Avance }) {
  const enCurso = avance.fase === 'subiendo' ? avance.fraccionTanda * avance.enLaTanda : 0;
  const valor = Math.min(avance.total, avance.subidas + enCurso);
  const terminado = avance.subidas >= avance.total;
  return (
    <div className={styles.progreso}>
      {/* `<progress>` nativo: el lector de pantalla lo anuncia solo y el
          navegador lo pinta aunque falle el CSS. */}
      <progress className={styles.progresoBarra} value={valor} max={avance.total} aria-label="Progreso de la subida" />
      <p className={styles.progresoTexto} aria-live="polite">
        {terminado
          ? 'Fotos subidas. Terminando…'
          : `${avance.subidas.toLocaleString('es-ES')} de ${avance.total.toLocaleString('es-ES')} fotos subidas · ` +
            (avance.fase === 'preparando'
              ? `preparando las siguientes (${avance.preparadas} de ${avance.enLaTanda})`
              : `enviando ${avance.enLaTanda} más`)}
      </p>
      <p className={styles.progresoAviso}>No cierres esta pestaña hasta que termine.</p>
    </div>
  );
}

/**
 * AÑADIR FOTOS A UNA GALERÍA YA CREADA.
 *
 * Sirve para dos cosas: completar una galería a la que se le quedaron fotos
 * fuera (una subida cortada a medias, o fotos que se revelaron después) y, si
 * se le pasa `fotosIniciales`, terminar de subir lo que faltó al crearla.
 */
export function AnadirFotos({
  slug,
  fotosActuales,
  fotosIniciales = [],
  titulo = 'Añadir fotos',
}: {
  slug: string;
  fotosActuales: number;
  fotosIniciales?: File[];
  titulo?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendientes, setPendientes] = useState<File[]>(fotosIniciales);
  const [avance, setAvance] = useState<Avance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [yaTiene, setYaTiene] = useState(fotosActuales);

  const caben = Math.max(0, MAX_FOTOS_POR_GALERIA - yaTiene);

  function elegir(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setHecho(null);
    const lista = Array.from(e.target.files ?? []).filter((f) => TIPOS_ADMITIDOS.has(f.type));
    e.target.value = '';
    if (lista.length > caben) {
      setError(`La galería tiene ${yaTiene} fotos y el máximo es ${MAX_FOTOS_POR_GALERIA}: caben ${caben} más.`);
      setPendientes(lista.slice(0, caben));
      return;
    }
    setPendientes(lista);
  }

  async function subir() {
    if (pendientes.length === 0) return;
    setError(null);
    setHecho(null);
    setSubiendo(true);
    try {
      const r = await subirEnTandas({
        fotos: pendientes,
        alAvanzar: setAvance,
        enviarTanda: (tanda, _indice, alProgresar, idTanda) => {
          const form = new FormData();
          form.set('tanda', idTanda);
          for (const f of tanda) form.append('photos', f);
          return enviarConProgreso(`/api/admin/galerias/${slug}/fotos`, form, alProgresar);
        },
      });
      setYaTiene((n) => n + r.subidas);
      if (r.ok) {
        setHecho(`${r.subidas.toLocaleString('es-ES')} fotos añadidas.`);
        setPendientes([]);
      } else {
        // Lo que ya entró, entró: se quita de la lista para que «Reintentar»
        // siga desde donde se quedó y no duplique fotos.
        setPendientes((p) => p.slice(r.subidas));
        setError(
          `${r.error} Se han añadido ${r.subidas} de ${pendientes.length}. Pulsa «Reintentar» para subir las que faltan.`
        );
      }
      router.refresh();
    } finally {
      setSubiendo(false);
      setAvance(null);
    }
  }

  return (
    <section className={styles.anadir} aria-labelledby={`anadir-${slug}`}>
      <h2 id={`anadir-${slug}`} className={styles.label}>{titulo}</h2>
      {!subiendo && (
        <div className={styles.anadirFila}>
          <button type="button" className={styles.secondaryButton} onClick={() => inputRef.current?.click()}>
            <UploadIcon size={18} /> Elegir fotos
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/webp,image/jpeg,image/png,image/avif"
            multiple
            className={styles.hiddenInput}
            tabIndex={-1}
            aria-label="Elegir fotos para añadir"
            onChange={elegir}
          />
          {pendientes.length > 0 && (
            <button type="button" className={styles.primaryButton} onClick={subir}>
              {error ? 'Reintentar' : 'Subir'} {pendientes.length.toLocaleString('es-ES')} foto
              {pendientes.length === 1 ? '' : 's'}
            </button>
          )}
        </div>
      )}
      {avance && <ProgresoSubida avance={avance} />}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {hecho && <p className={styles.fileCount} role="status">{hecho}</p>}
    </section>
  );
}
