'use client';
import { Fragment, useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { gsap } from 'gsap';
import type { Project } from '@/content/types';
import { CATEGORY_LABELS } from '@/lib/category-labels';
import { filtrarPorCategoria } from '@/lib/project-filter';
import { useProjectFilter, type ProjectFilterValue } from '@/lib/hooks/useProjectFilter';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { withPageTransition } from '@/components/motion/PageTransition';
import { ScrollParallax } from '@/components/motion/ScrollParallax';
import { focusOf, sinEtalonarStyle } from '@/lib/focal';
import styles from './TrabajosIndex.module.css';
import { RevealWords } from '@/components/motion/RevealWords';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

/**
 * The banner photograph, chosen for the banner's shape.
 *
 * It used to be whatever the featured project's cover happened to be, and
 * that cover is a 2:3 portrait. In a full-bleed band roughly 2.1:1 a
 * portrait shows 26% of itself -- the page opened on a sliver. A page-wide
 * banner needs a landscape frame picked for it, not a cover borrowed from
 * somewhere the shape was different.
 */
const OPENER = {
  // La anterior era el plano de grupo en blanco y negro de la entrada: mucha
  // cara pequeña, y el titular caía justo encima de ellas. Ésta es ancha de
  // nacimiento, tiene profundidad -- el árbol delante, el campo detrás -- y
  // deja la mitad derecha limpia para que el velo sea lo que cruza el
  // encuadre. El titular cae sobre la hierba, no sobre nadie.
  src: '/images/seleccion/velo-al-viento-bajo-el-arbol.webp',
  alt: 'Los novios abrazados bajo un árbol desnudo, con el velo extendido por el viento sobre la hierba',
};

const CATEGORIES: Array<{ value: ProjectFilterValue; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'boda', label: CATEGORY_LABELS.boda },
  { value: 'video', label: CATEGORY_LABELS.video },
];

/**
 * DOS MANERAS DE MIRAR EL ARCHIVO, y el visitante elige.
 * ---------------------------------------------------------------------
 * Es lo que hace untitledfilm.framer.website/work-grid, la referencia que
 * trajo el cliente para esta página exactamente: un conmutador «grid | list»
 * en la barra, y el mismo material contado de dos formas.
 *
 * - `indice`: una boda por línea -- número, nombres, lugar, año -- con la
 *   fotografía en el marco anclado de al lado. Es leer el archivo.
 * - `rejilla`: la pared de fotografías, cada portada con su propia
 *   proporción y el rótulo debajo (el mosaico de bellephoto.com.au). Es
 *   mirarlo.
 *
 * El índice sigue siendo lo primero que se ve, porque es la vista que
 * distingue a este estudio de los cientos de webs de boda que abren con una
 * cuadrícula. Pero quien viene a ver fotos está a un clic de verlas todas a
 * la vez, y en el móvil -- donde no hay puntero que gobierne el marco
 * anclado -- la rejilla es la única vista posible y siempre lo fue.
 */
type ViewMode = 'indice' | 'rejilla';

const VIEWS: Array<{ value: ViewMode; label: string }> = [
  { value: 'indice', label: 'Índice' },
  { value: 'rejilla', label: 'Rejilla' },
];

/**
 * La SEGUNDA fotografía de un reportaje, la que aparece al pasar el puntero.
 *
 * Es lo que separa una rejilla de fotógrafo de una rejilla de cualquier cosa:
 * la casilla no se limita a acercarse, enseña otra foto de esa misma boda. La
 * primera de la galería que no sea la portada ni la miniatura -- si es la
 * misma imagen el cambio no se ve y solo cuesta una descarga.
 */
function segundaFoto(p: Project): { src: string; focus?: string } | null {
  const yaVistas = new Set([coverSrc(p), p.thumb?.src, previewMedia(p).src].filter(Boolean));
  const otra = p.gallery.find((m) => m.type === 'image' && !yaVistas.has(m.src));
  return otra && otra.type === 'image' ? { src: otra.src, focus: otra.focus } : null;
}

/**
 * El nombre de la pareja, partido en dos líneas por la «y».
 *
 * «Carmen y Alberto» se lee como «Carmen / y Alberto», que es exactamente lo
 * que hace bellephoto.com.au con sus parejas («Alexandra / & Fabian»). No es
 * un capricho tipográfico: a tamaño grande y en dos columnas, una línea larga
 * se parte por donde le toque al navegador y el corte cae en mitad de un
 * nombre. Partiendo por la conjunción, el corte siempre cae donde tiene
 * sentido. Los títulos sin «y» se quedan en una línea.
 */
function partirNombre(titulo: string): [string] | [string, string] {
  const corte = titulo.lastIndexOf(' y ');
  if (corte === -1) return [titulo];
  return [titulo.slice(0, corte), titulo.slice(corte + 1)];
}

function coverSrc(p: Project) {
  return p.cover.type === 'video' ? (p.cover.poster ?? p.cover.src) : p.cover.src;
}

/**
 * EL RETRATO DE UN REPORTAJE: lo que se enseña en cualquier marco vertical.
 *
 * `thumb` es el suplente vertical que lleva una ficha cuando su portada no
 * sirve para un marco alto -- porque es apaisada, o porque es un vídeo y lo
 * único que hay es su póster.
 *
 * LO USAN LAS DOS VISTAS, y ésa es la corrección. El marco anclado del índice
 * ya llamaba aquí, pero la rejilla cogía la portada a pelo, así que las dos
 * fichas de vídeo se pintaban con un póster de 1280x720 recortado a 2:3: de
 * esos 720 px de alto sobrevivían 480 de ancho, que luego había que ampliar
 * un 60% para llenar la casilla. Se veía el grano, y en una web de fotógrafo
 * eso no es un detalle. Las dos tenían ya un retrato de 1066x1600 esperando
 * sin usar; con él la casilla REDUCE en vez de ampliar.
 */
function previewMedia(p: Project) {
  // `sinEtalonar` viaja con la pieza: si la portada la lleva, la casilla del
  // índice tiene que apagar el etalonado igual que lo apaga la ficha. Ver el
  // comentario del campo en content/types.ts.
  if (p.thumb) return { src: p.thumb.src, alt: p.thumb.alt, focus: p.thumb.focus, sinEtalonar: p.thumb.sinEtalonar };
  return { src: coverSrc(p), alt: p.cover.alt, focus: p.cover.focus, sinEtalonar: p.cover.sinEtalonar };
}

/**
 * The work as an index, not a scroll: every wedding is one line of a
 * list -- number, names, place, year -- and the photograph lives in a
 * single pinned frame beside it that changes as the pointer moves down
 * the list (the "index + preview" layout of the reference studios).
 * Seventeen projects fit in a screen and a half instead of ten thousand
 * pixels of stacked spreads. On phones the same list renders as a tight
 * two-column grid of covers, since there is no hover to drive a preview.
 */
/**
 * El dibujo de cada vista: tres renglones para el índice, cuatro cuadros para
 * la rejilla. Decorativo (`aria-hidden`): el rótulo de al lado ya nombra el
 * botón, así que anunciarlo dos veces es ruido. Hereda el color con
 * `currentColor`, que es lo que hace que se invierta solo dentro del botón
 * activo sin una regla de color más.
 */
function ViewIcon({ mode }: { mode: ViewMode }) {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" focusable="false" fill="currentColor">
      {mode === 'indice' ? (
        <>
          <rect x="0" y="1" width="12" height="1.6" />
          <rect x="0" y="5.2" width="12" height="1.6" />
          <rect x="0" y="9.4" width="12" height="1.6" />
        </>
      ) : (
        <>
          <rect x="0" y="0" width="5" height="5" />
          <rect x="7" y="0" width="5" height="5" />
          <rect x="0" y="7" width="5" height="5" />
          <rect x="7" y="7" width="5" height="5" />
        </>
      )}
    </svg>
  );
}

export function TrabajosIndex({ projects, initialCategory = 'todos' }: { projects: Project[]; initialCategory?: ProjectFilterValue }) {
  const { category, setCategory, filtered } = useProjectFilter(projects, initialCategory);
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewMode>('indice');
  const [active, setActive] = useState<Project | null>(filtered[0] ?? null);
  // Dos capas apiladas para que un cambio sea un barrido de una fotografía
  // sobre otra, nunca un marco en blanco (ver el efecto de más abajo).
  const [layers, setLayers] = useState<[Project | null, Project | null]>([filtered[0] ?? null, null]);
  const [front, setFront] = useState<0 | 1>(0);
  const isFirstRender = useRef(true);
  // El marco anclado NO se barre en el primer pintado: detrás no hay nada
  // todavía (la segunda capa está vacía), así que el barrido descubriría el
  // fondo gris del marco con el rótulo blanco encima, ilegible, en cada
  // carga de la página. La primera fotografía simplemente está.
  const isFirstPreview = useRef(true);

  // Changing the filter resets the preview to the first project of the
  // new set, so the pinned frame never shows a wedding that is not listed.
  const changeCategory = useCallback(
    (value: ProjectFilterValue) => {
      setCategory(value);
      const next = filtrarPorCategoria(projects, value)[0] ?? null;
      setActive(next);
      // La nueva fotografía entra por la capa de ATRÁS y ésta pasa a delante,
      // igual que en `show()`. Antes esto hacía `setLayers([next, null])` y
      // `setFront(0)`, con dos averías: si el visitante no había pasado el
      // puntero por ninguna fila, `front` ya era 0, el efecto del barrido no
      // se volvía a lanzar y la fotografía cambiaba de golpe; y si sí lo
      // había hecho, el barrido descubría una capa vacía en vez de la
      // fotografía anterior.
      const back = front === 0 ? 1 : 0;
      setLayers((prev) => {
        const out: [Project | null, Project | null] = [...prev] as [Project | null, Project | null];
        out[back] = next;
        return out;
      });
      setFront(back);
    },
    [front, projects, setCategory]
  );

  // Las filas entran escalonadas al cambiar de filtro Y al cambiar de vista.
  // El escalonado va acotado por `amount` y no por `each`: con 29 bodas, un
  // retardo fijo de 0.035 s por fila sumaba un segundo entero antes de que la
  // última se moviera, y el conmutador de vista tiene que sentirse inmediato.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (reducedMotion || !listRef.current) return;
    const rows = listRef.current.querySelectorAll('[data-project-card]');
    // `clearProps` incluye `opacity` y no solo `transform`: la entrada al
    // hacer scroll de más abajo (`animation-timeline: view()`) anima esas dos
    // propiedades sobre `.rowLink`, y una opacidad en línea que GSAP se
    // dejara puesta aquí congelaría la fila en su estado final para el resto
    // de la visita.
    const tween = gsap.fromTo(
      rows,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: { amount: 0.45 }, clearProps: 'transform,opacity' },
    );
    return () => {
      // `revert()` y no `kill()`: si el sistema pasa a movimiento reducido con
      // el tween a medias, la siguiente ejecución del efecto sale por la
      // puerta de arriba y las filas se quedarían con la opacidad fraccionada
      // que GSAP les hubiera dejado escrita en línea.
      tween.revert();
    };
  }, [filtered, view, reducedMotion]);

  const show = useCallback(
    (p: Project) => {
      // En rejilla no hay marco anclado: cambiar de capa sería trabajo (y un
      // par de tweens de GSAP por cada fila que el puntero cruza) para algo
      // que nadie está mirando.
      if (view === 'rejilla') return;
      if (p === active) return;
      setActive(p);
      setLayers((prev) => {
        const next: [Project | null, Project | null] = [...prev] as [Project | null, Project | null];
        next[front === 0 ? 1 : 0] = p;
        return next;
      });
      setFront((f) => (f === 0 ? 1 : 0));
    },
    [active, front, view]
  );

  /**
   * EL CAMBIO DE FOTOGRAFÍA ES UN BARRIDO, NO UN FUNDIDO.
   * -------------------------------------------------------------------
   * Era un fundido cruzado: la nueva subía de opacidad mientras la anterior
   * bajaba, y durante medio segundo se veían las dos superpuestas y las dos
   * a medias. Dos fotografías translúcidas una encima de otra no se leen
   * como un cambio, se leen como una foto sucia -- y en una web de
   * fotógrafo eso es justo lo que no puede pasar.
   *
   * Ahora la nueva ENTRA POR DEBAJO, descubriéndose de abajo arriba
   * (`clip-path`) y asentando su escala a la vez, mientras la anterior se
   * queda quieta y entera detrás. En ningún fotograma hay una imagen a
   * medio pintar: hay dos imágenes enteras, y una tapando a la otra. Es el
   * corte de las referencias del cliente.
   *
   * Las dos capas van SIEMPRE a opacidad 1 y quien manda es el `z-index`
   * (ver el `style` de más abajo). Si la de atrás se apagara -- que es lo
   * que hacía antes -- el barrido descubriría el fondo gris del marco en
   * vez de la fotografía anterior.
   */
  useEffect(() => {
    if (isFirstPreview.current) {
      isFirstPreview.current = false;
      return;
    }
    if (reducedMotion || !previewRef.current) return;
    const incoming = previewRef.current.querySelector<HTMLElement>(`[data-layer="${front}"]`);
    if (!incoming) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        incoming,
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.75, ease: 'power3.out', overwrite: true },
      );
    });
    return () => ctx.revert();
  }, [front, reducedMotion]);

  // The pinned frame leans a few pixels towards the pointer.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || reducedMotion) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      xTo(nx * 14);
      yTo(ny * 10);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion]);

  function handleProjectClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    withPageTransition(() => router.push(href));
  }

  const activeIndex = active ? filtered.indexOf(active) : -1;

  return (
    <div className={styles.page}>
      <div className={styles.opener}>
          <ScrollParallax strength={3}>
            <Image src={OPENER.src} alt={OPENER.alt} fill sizes="100vw" className={styles.openerImage} style={focusOf(OPENER.src)} priority />
          </ScrollParallax>
          <div className={styles.openerScrim} aria-hidden="true" />
          {/* SIN NUMERAL. Aquí había un "00" gigante. Numerar sirve cuando hay
              una secuencia que leer en orden: en las fichas de reportaje el
              número dice por dónde va uno de veinticuatro fotografías. Esta
              es la portada del índice; no es el capítulo cero de nada, y
              estaba pintado a --type-h2, un escalón MÁS GRANDE que el propio
              <h1> que tiene al lado. Un adorno que gana en tamaño al titular
              de la página es el adorno el que sobra. */}
          <div className={styles.openerContent}>
            <div>
              {/* El <h1> dice de qué va la página, no cómo se llama el
                  enlace del menú. "Trabajos" era la única cabecera del
                  sitio que no nombraba su contenido, y es la página que
                  compite por la búsqueda de la pareja. El recuento se baja
                  a la línea de crédito, que es donde ya vivía. */}
              <h1 className={styles.openerTitle}>
                <RevealWords segments={[{ text: 'Reportajes de boda en Sevilla y Andalucía' }]} />
              </h1>
              {/* Sin el recuento. Un número delante convierte el rótulo en
                  un inventario -- y encima es un número que envejece solo
                  cada vez que se publica o se retira un reportaje. Lo que
                  tiene que decir esta línea es QUÉ hay, no cuánto. El
                  recuento sigue estando donde sirve: en la barra de filtros,
                  donde cambia con lo que se está mirando. */}
              <span className={styles.openerCredit}>
                Bodas, prebodas y postbodas
              </span>
            </div>
          </div>
      </div>

      <div className={styles.toolbar}>
        {/* Botones de filtro con aria-pressed, NO un `tablist`. Esto se
            anunciaba como "pestaña 1 de 3" y no lo era: no hay ningún
            `tabpanel` al que llevar, no había `aria-controls`, y el patrón de
            pestañas de ARIA obliga a mover el foco con las flechas y a un
            solo tabulador para todo el grupo (roving tabindex), nada de lo
            cual estaba implementado. Quien navega con lector de pantalla
            oía la promesa de un widget y se encontraba otro. Lo que hay de
            verdad son tres interruptores que filtran una lista: un botón
            nativo con estado pulsado lo dice exactamente, y el recuento de
            al lado (aria-live) confirma el resultado. */}
        <div role="group" aria-label="Filtrar trabajos por categoría" className={styles.tablist}>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-pressed={category === c.value}
              onClick={() => changeCategory(c.value)}
              className={styles.tab}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className={styles.toolbarEnd}>
          <p className={styles.count} aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'reportaje' : 'reportajes'}
          </p>
          {/* Dos interruptores con estado pulsado, el mismo patrón que los
              filtros de al lado y por el mismo motivo (ver el comentario de
              arriba sobre por qué esto no es un `tablist`). Se esconde por
              debajo de 960: ahí la rejilla es la única vista que hay. */}
          {/* CON PINTA DE MANDO, no de dos rótulos más.
              Estuvo días delante del cliente sin que supiera que se podía
              pulsar, y con razón: eran dos palabras en versalitas del mismo
              tamaño y el mismo color que los filtros de al lado, separadas
              por un filete. Lo que lo convierte en un mando es el marco que
              rodea a los dos, el relleno sólido en el que está activo y el
              icono que dice de qué va cada uno sin leer nada. El rótulo
              «Ver» delante remata la frase. */}
          <div className={styles.viewGroup} hidden={filtered.length === 0}>
            <span className={styles.viewLabel} aria-hidden="true">Ver</span>
            <div role="group" aria-label="Forma de ver los trabajos" className={styles.viewSwitch}>
              {VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  aria-pressed={view === v.value}
                  onClick={() => setView(v.value)}
                  className={styles.viewButton}
                >
                  <ViewIcon mode={v.value} />
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty} aria-live="polite">
          Todavía no hay reportajes en esta categoría. Pulsad «Todos» para ver las {projects.length} bodas,
          prebodas y postbodas publicadas.
        </p>
      ) : (
        <div className={styles.layout} data-view={view}>
          {/* Pinned preview (desktop). Decorative: the row links carry the semantics. */}
          <div className={styles.previewCol} aria-hidden="true">
            <div ref={previewRef} className={styles.preview}>
              {layers.map((p, i) => (
                <div key={i} data-layer={i} className={styles.layer} style={{ zIndex: front === i ? 2 : 1 }}>
                  {p && (() => { const m = previewMedia(p); return (
                    <Image src={m.src} alt="" fill sizes="(max-width: 959px) 0px, (max-width: 1350px) 30vw, 344px" className={styles.previewImage} style={{ ...focusOf(m.src, m.focus), ...sinEtalonarStyle(m) }} />
                  ); })()}
                </div>
              ))}
              {active && (
                <div className={styles.previewCaption}>
                  <span className={styles.previewIndex}>{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span className={styles.previewTitle}>{active.title}</span>
                  <span className={styles.previewMeta}>
                    {active.location}, {active.year} · {CATEGORY_LABELS[active.category]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* `role="list"` explícito: Safari con VoiceOver deja de anunciar una
              lista en cuanto se le quita el marcador con `list-style: none`, y
              con ella se pierden el recuento y el «elemento 3 de 29» con los
              que alguien se orienta. La lista sigue siendo un <ol>/<ul> de
              verdad; esto solo le devuelve lo que el CSS le quitó. */}
          <ol ref={listRef} className={styles.list} role="list">
            {filtered.map((p, i) => {
              const href = `/trabajos/${p.slug}`;
              const isActive = p === active;
              // La lista viene ordenada de más reciente a más antigua, así
              // que basta comparar con la fila anterior para saber dónde
              // empieza cada año.
              const abreAno = i === 0 || filtered[i - 1].year !== p.year;
              const retrato = previewMedia(p);
              return (
                <li key={p.slug} className={styles.row} data-project-card data-active={isActive || undefined}>
                  {/* EL AÑO, COMO SEPARADOR DEL ARCHIVO.
                      Veintiocho filas seguidas son una lista; agrupadas por
                      temporada son un archivo, que es lo que esto es. Y de
                      paso responde sin preguntar a lo que mira una pareja al
                      llegar aquí: si este equipo sigue trabajando y desde
                      cuándo.
                      `aria-hidden` porque no es información nueva -- el año
                      va ya en el nombre accesible de cada enlace -- y porque
                      un encabezado suelto dentro de un <li> de una lista
                      ordenada confunde más de lo que orienta. */}
                  {abreAno && (
                    <span className={styles.yearMark} aria-hidden="true">
                      <span className={styles.yearRule} />
                      {p.year}
                    </span>
                  )}
                  <a
                    href={href}
                    className={styles.rowLink}
                    // El lugar, el año y la categoría se pintan dentro del
                    // enlace (más abajo), pero un `aria-label` SUSTITUYE al
                    // contenido como nombre accesible, así que un lector de
                    // pantalla oía solo los nombres de la pareja y se perdía
                    // justo los tres datos con los que se elige una boda que
                    // se parezca a la tuya. Van dentro del rótulo.
                    aria-label={`Ver reportaje: ${p.title} — ${p.location}, ${p.year}`}
                    onMouseEnter={() => show(p)}
                    onFocus={() => show(p)}
                    onClick={(e) => handleProjectClick(e, href)}
                    data-cursor="ver"
                  >
                    {/* La casilla es siempre vertical (2:3, como la pared de
                        bellephoto.com.au), así que lo que va dentro tiene que
                        ser el RETRATO de la ficha y no su portada: una
                        portada apaisada, o el póster de un vídeo, se recorta
                        a menos de la mitad de su ancho y hay que ampliarla
                        para llenar la casilla. La proporción ya no se pasa en
                        línea: la pone el CSS y es la misma para todas, que es
                        lo que da el ritmo. */}
                    <span className={styles.thumb}>
                      {/* UNA SOLA CADENA, no una que dependa de la vista.
                          Lo que evita que el índice descargue 29 portadas es
                          `loading="lazy"` más el `display: none` de la
                          miniatura, no el valor de `sizes`; y cambiar `sizes`
                          al conmutar cambia también el `srcset`, lo que
                          obliga al navegador a reelegir candidato para las 29
                          imágenes de golpe justo cuando se pulsa «Rejilla».
                          El último tramo es fijo porque `.page` está topada a
                          75rem: por encima de ~1350 px la columna ya no
                          crece, y un `30vw` seguía pidiendo un 50% más de
                          píxeles de los que caben. */}
                      <Image
                        src={retrato.src}
                        alt=""
                        fill
                        sizes="(max-width: 959px) 46vw, (max-width: 1350px) 30vw, 384px"
                        className={styles.thumbImage}
                        style={{ ...focusOf(retrato.src, retrato.focus), ...sinEtalonarStyle(retrato) }}
                      />
                      {/* LA SEGUNDA FOTO, DEBAJO, PARA EL CAMBIO AL PASAR EL
                          PUNTERO. Solo se monta en rejilla y en escritorio:
                          en el índice la miniatura ni se pinta, y en un móvil
                          no hay puntero que provoque el cambio, así que
                          montarla sería descargar 28 fotografías que nadie va
                          a ver. Decorativa: el enlace ya tiene su nombre. */}
                      {view === 'rejilla' && (() => {
                        const otra = segundaFoto(p);
                        return otra ? (
                          <Image
                            src={otra.src}
                            alt=""
                            aria-hidden="true"
                            fill
                            sizes="(max-width: 1350px) 30vw, 384px"
                            className={`${styles.thumbImage} ${styles.thumbHover}`}
                            style={focusOf(otra.src, otra.focus)}
                          />
                        ) : null;
                      })()}
                    </span>
                    <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.rowTitle}>
                      {partirNombre(p.title).map((linea, l) => (
                        // Dos elementos, no un <br>: en la vista índice las dos
                        // líneas vuelven a fluir como texto normal con solo
                        // quitarles el `display: block` desde el CSS.
                        <Fragment key={l}>
                          {/* EL ESPACIO VA AQUÍ, COMO TEXTO DE VERDAD. Sin
                              él, en el índice -- donde los dos tramos son
                              elementos en línea -- «Carmen y Alberto» se
                              pintaba «Carmeny Alberto», y un lector de
                              pantalla y quien copiara el nombre se llevaban
                              eso mismo. Entre dos bloques no estorba: el
                              espacio sobrante se colapsa solo. */}
                          {l > 0 ? ' ' : null}
                          <span className={styles.titleLine}>{linea}</span>
                        </Fragment>
                      ))}
                    </span>
                    <span className={styles.rowMeta}>
                      <span>{p.location}</span>
                      <span>{p.year}</span>
                      <span className={styles.rowCategory}>{CATEGORY_LABELS[p.category]}</span>
                    </span>
                    <ArrowGlyph className={styles.rowArrow} />
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
