'use client';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { resolveMosaicColumns } from '@/content/mosaic';
import { useLenis } from '@/lib/hooks/useLenis';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { focusOf } from '@/lib/focal';
import styles from './HeroMosaic.module.css';

const columns = resolveMosaicColumns();

/** How much of the page scroll each column takes on (different rates = depth). */
const SCROLL_FACTORS = [0.55, 0.85, 0.35, 0.7, 0.45];
/** How lazily each column follows that target (seconds) -- the lag differences are the parallax. */
const FOLLOW = [0.5, 0.8, 0.2, 0.3, 0.6];
/** Cursor pan easing per frame. */
const PAN_LERP = 0.05;
/** Seconds between one column's crossfade and the next's. */
const CYCLE_STEP = 2.6;

/**
 * Hero mosaic: five staggered columns of 3:4 frames, one wedding each.
 *
 *  - The strip is wider than the viewport and pans sideways under the
 *    cursor (lerped), settling back to centre when the pointer leaves.
 *  - As the page scrolls, every column rises at its own rate and with
 *    its own lag, so the grid reads as layers at different depths.
 *  - Each column's top frame periodically dips and crossfades to the next
 *    photo of that wedding, so the mosaic never sits still for long.
 *  - Under prefers-reduced-motion: no pan, no parallax, no cycling -- a
 *    static, fully readable grid.
 */
export function HeroMosaic({ play = true }: { play?: boolean }) {
  const router = useRouter();
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();
  const bandRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<Array<HTMLDivElement | null>>([]);
  const topWrapRefs = useRef<Array<HTMLDivElement | null>>([]);
  const press = useRef({ x: 0, y: 0 });
  // The top frame of each column cycles through that wedding's extra
  // photos; the current one lives in state so next/image serves it at the
  // rendered size instead of the 2000px master.
  const [tops, setTops] = useState(() => columns.map((col) => col.tiles[0]));

  // Cursor pan.
  useEffect(() => {
    if (reducedMotion) return;
    const band = bandRef.current;
    const inner = innerRef.current;
    if (!band || !inner) return;
    if (window.matchMedia('(max-width: 899px)').matches) return;
    let current = 0;
    let target = 0;
    let centre = 0;
    let raf = 0;
    let alive = true;
    const measure = () => {
      const max = Math.max(0, inner.scrollWidth - band.clientWidth);
      centre = -max / 2;
      target = centre;
      current = centre;
      inner.style.transform = `translate3d(${current}px, 0, 0)`;
    };
    const onMove = (e: MouseEvent) => {
      const r = band.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const max = Math.max(0, inner.scrollWidth - band.clientWidth);
      target = -max * ratio;
    };
    const onLeave = () => {
      target = centre;
    };
    // El bucle se DETIENE cuando la banda ya esta donde tiene que estar, y
    // lo despierta el siguiente movimiento del raton. Antes se llamaba a si
    // mismo incondicionalmente: un requestAnimationFrame por fotograma
    // durante toda la sesion, escribiendo el mismo translate3d una y otra
    // vez, tambien con el mosaico a tres pantallas por encima del pliegue y
    // aunque el puntero no se hubiera movido nunca. Un lerp al 5% no llega
    // jamas a su destino por si solo, asi que hacia falta un umbral: por
    // debajo de medio pixel no hay nada que ver.
    const tick = () => {
      if (!alive) return;
      const delta = target - current;
      if (Math.abs(delta) < 0.5) {
        current = target;
        inner.style.transform = `translate3d(${current}px, 0, 0)`;
        raf = 0;
        return;
      }
      current += delta * PAN_LERP;
      inner.style.transform = `translate3d(${current}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && alive) raf = requestAnimationFrame(tick);
    };
    measure();
    band.addEventListener('mousemove', onMove, { passive: true });
    band.addEventListener('mouseleave', onLeave, { passive: true });
    band.addEventListener('mousemove', wake, { passive: true });
    band.addEventListener('mouseleave', wake, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      band.removeEventListener('mousemove', onMove);
      band.removeEventListener('mouseleave', onLeave);
      band.removeEventListener('mousemove', wake);
      band.removeEventListener('mouseleave', wake);
      window.removeEventListener('resize', measure);
    };
  }, [reducedMotion]);

  // Band height = the tallest column, as on the reference: every frame of
  // every column is laid out in the flow (the page is as tall as the
  // mosaic), and the parallax only changes how fast each column climbs.
  // A slice is trimmed off the bottom so the last frames of the tallest
  // columns are what the parallax reveals rather than empty paper.
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const cols = colRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!cols.length) return;
    const size = () => {
      // offsetTop/offsetHeight ignore the parallax transforms, unlike
      // getBoundingClientRect -- the band must be sized to the untranslated
      // layout.
      const extents = cols.map((col) => col.offsetTop + col.offsetHeight);
      const maxExtent = Math.max(...extents);
      if (reducedMotion) {
        band.style.height = `${Math.round(maxExtent)}px`;
        return;
      }
      // Pick the tallest band height at which, by the time its bottom edge
      // scrolls into view, no column has climbed far enough to leave bare
      // paper beneath its last frame (each column's climb is
      // min(half its height, scrollY * factor)).
      const vh = window.innerHeight;
      const bandTop = band.getBoundingClientRect().top + window.scrollY;
      let h = maxExtent;
      const fits = (H: number) => {
        const scrollAtBottom = Math.max(0, bandTop + H - vh);
        return cols.every((col, i) => {
          const climb = Math.min(col.clientHeight / 2, scrollAtBottom * (SCROLL_FACTORS[i] ?? 0.5));
          return extents[i] - climb >= H - 8;
        });
      };
      while (h > vh * 0.6 && !fits(h)) h -= 12;
      band.style.height = `${Math.round(h)}px`;
    };
    size();
    const ro = new ResizeObserver(size);
    cols.forEach((c) => ro.observe(c));
    window.addEventListener('resize', size, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', size);
    };
  }, [reducedMotion]);

  // Scroll parallax per column.
  useEffect(() => {
    if (reducedMotion) return;
    const cols = colRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!cols.length) return;
    const setters = cols.map((col, i) => gsap.quickTo(col, 'y', { duration: FOLLOW[i] ?? 0.5, ease: 'power3' }));
    const limits = cols.map((col) => col.clientHeight / 2);
    const update = () => {
      const y = window.scrollY || 0;
      cols.forEach((_, i) => {
        const v = Math.max(-limits[i], Math.min(0, -y * (SCROLL_FACTORS[i] ?? 0.5)));
        setters[i](v);
      });
    };
    update();
    // ONE scroll source, not two. Lenis drives the page's scrolling, and it
    // also emits a native scroll event, so subscribing to both ran this
    // whole read-and-set pass twice per frame -- four quickTo setters and a
    // window.scrollY read, doubled, for every frame of every scroll.
    const smooth = lenis && typeof lenis.on === 'function' ? lenis : null;
    if (smooth) smooth.on('scroll', update);
    else window.addEventListener('scroll', update, { passive: true });
    return () => {
      if (smooth) smooth.off('scroll', update);
      else window.removeEventListener('scroll', update);
      cols.forEach((col) => gsap.set(col, { clearProps: 'transform' }));
    };
  }, [reducedMotion, lenis]);

  // LA ENTRADA: la banda se posa desde un ligero acercamiento mientras cada
  // columna abre su cortina.
  //
  // Lo que había aquí antes ponía las veinte fotografías a `opacity: 0` desde
  // JavaScript y esperaba a que un `tween` se las devolviera. Es exactamente
  // el patrón que este proyecto ya desterró de ScrollReveal y de SelectedReel,
  // y en el sitio peor posible: la primera pantalla de la web de una
  // fotógrafa. Si GSAP tarda, falla, o el efecto se limpia a mitad de camino,
  // el visitante se queda mirando papel en blanco donde tenía que haber cinco
  // bodas. Ahora la apertura la hace un `clip-path` declarado en CSS
  // (HeroMosaic.module.css) con `backwards`, o sea que el estado de reposo de
  // cada columna es VISIBLE y la animación sólo puede quitarlo mientras corre.
  //
  // Aquí queda únicamente el asentamiento de la banda entera, que es un
  // `transform` y por tanto no puede esconder nada: si no se ejecuta, la
  // banda está donde tiene que estar.
  //
  // 1,1 y 1 s, no 1,18 y 1,6: la coreografía de entrada entera son 1,2 s (ver
  // Hero.tsx), y un acercamiento del 18% tardando 1,6 s dejaba la portada
  // moviéndose medio segundo después de que todo lo demás se hubiera posado.
  // El retardo de 0,16 s es el encabalgado: la fotografía entra un pelo
  // después de que el masthead haya empezado a escribirse, no a la vez.
  useEffect(() => {
    if (reducedMotion || !play) return;
    const band = bandRef.current;
    if (!band) return;
    const ctx = gsap.context(() => {
      gsap.set(band, { scale: 1.1, y: '3vh', transformOrigin: 'center top' });
      gsap.to(band, { scale: 1, y: 0, duration: 1, delay: 0.16, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, [reducedMotion, play]);

  // Auto-cycle: each column's top frame dips, swaps to the next photo, comes back.
  useEffect(() => {
    if (reducedMotion || !play) return;
    const tl = gsap.timeline({ repeat: -1, delay: 3 });
    const state = columns.map(() => 0);
    columns.forEach((col, i) => {
      const wrap = topWrapRefs.current[i];
      if (!wrap || col.cycle.length === 0) return;
      const media = () => wrap.querySelector('img');
      const at = i * CYCLE_STEP;
      tl.to(wrap, { y: 70, duration: 1, ease: 'power1.inOut' }, at);
      tl.call(() => gsap.to(media(), { opacity: 0, duration: 0.9, ease: 'sine.inOut' }), [], at + 0.1);
      tl.call(
        () => {
          const next = col.cycle[state[i] % col.cycle.length];
          state[i] += 1;
          setTops((prev) => prev.map((t, k) => (k === i ? next : t)));
        },
        [],
        at + 1.05
      );
      tl.to(wrap, { y: 0, duration: 1, ease: 'power1.inOut' }, at + 1.12);
      tl.call(() => gsap.to(media(), { opacity: 1, duration: 0.85, ease: 'sine.inOut' }), [], at + 1.12);
    });
    // Breathe before looping.
    tl.to({}, { duration: 3 }, columns.length * CYCLE_STEP);
    // El ciclo se para cuando el mosaico no se ve, no solo cuando se
    // esconde la pestana. Antes seguia corriendo entero mientras se leia el
    // resto de la portada: una timeline de GSAP con cinco columnas mas un
    // setTops() -- es decir, un render de React del mosaico completo --
    // cada segundo y pico, indefinidamente, con la banda fuera de la
    // pantalla. En un movil eso es bateria y es el hilo principal ocupado
    // justo donde el visitante esta desplazandose.
    // Al pararlo, la banda vuelve al reposo en vez de congelarse a medias.
    // Las opacidades del cruce no las lleva esta timeline (salen de los
    // gsap.to() de los tl.call de arriba, que corren por su cuenta), asi
    // que un pause() a secas podia dejar el marco superior de una columna
    // en opacity 0 hasta que se reanudase: un hueco en blanco en el mosaico
    // si el visitante volvia a subir en ese segundo. pause(0) rebobina los
    // wraps a y:0 y esto devuelve las fotos a opacidad 1; nadie lo ve
    // porque solo ocurre con la banda fuera de la pantalla.
    let onScreen = true;
    const rest = () => {
      tl.pause(0);
      topWrapRefs.current.forEach((wrap) => {
        const img = wrap?.querySelector('img');
        if (!img) return;
        gsap.killTweensOf(img);
        gsap.set(img, { opacity: 1 });
      });
    };
    const sync = () => (document.hidden || !onScreen ? rest() : tl.play());
    const onVis = () => sync();
    document.addEventListener('visibilitychange', onVis);
    const band = bandRef.current;
    // rootMargin generoso: reanuda antes de que la banda vuelva a entrar,
    // para que nunca se vea el instante en el que arranca.
    const io =
      band && typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            (entries) => {
              onScreen = entries.some((e) => e.isIntersecting);
              sync();
            },
            { rootMargin: '25% 0px' }
          )
        : null;
    io?.observe(band!);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      io?.disconnect();
      tl.kill();
    };
  }, [reducedMotion, play]);

  // A column is one link; a small drag (from the pan) must not navigate.
  const onMouseDown = (e: ReactMouseEvent) => {
    press.current = { x: e.clientX, y: e.clientY };
  };
  const onClick = (e: ReactMouseEvent, href: string) => {
    const dx = e.clientX - press.current.x;
    const dy = e.clientY - press.current.y;
    if (Math.hypot(dx, dy) > 6) return;
    e.preventDefault();
    router.push(href);
  };

  return (
    <div ref={bandRef} className={styles.band} data-testid="hero-mosaic" data-enter={play ? 'true' : undefined}>
      <div ref={innerRef} className={styles.inner}>
        <div className={styles.grid} role="list" aria-label="Bodas destacadas">
          {columns.map((col, i) => {
            const href = `/trabajos/${col.project.slug}`;
            return (
              <div key={col.project.slug} className={styles.col} data-col={i + 1} role="listitem">
                <div
                  ref={(el) => {
                    colRefs.current[i] = el;
                  }}
                  className={styles.item}
                >
                  <a
                    href={href}
                    className={styles.link}
                    aria-label={`Ver la boda de ${col.project.title}`}
                    onMouseDown={onMouseDown}
                    onClick={(e) => onClick(e, href)}
                    draggable={false}
                  >
                    {col.tiles.map((tile, t) => {
                      const shown = t === 0 ? tops[i] : tile;
                      return (
                        <div
                          key={tile.src}
                          ref={(el) => {
                            if (t === 0) topWrapRefs.current[i] = el;
                          }}
                          className={`${styles.wrap}${t === 0 ? ` ${styles.wrapTop}` : ''}`}
                          style={
                            t !== 0 && shown.width && shown.height
                              ? ({ ['--tile-ar' as string]: `${shown.width} / ${shown.height}` } as CSSProperties)
                              : undefined
                          }
                        >
                          {shown.kind === 'video' ? (
                            /* The poster sits UNDERNEATH the clip, always, as a
                               real image -- not as the <video poster> attribute.
                               Once `preload="metadata"` has any frame data the
                               browser stops honouring that attribute and paints
                               frame 0 instead, and this particular clip fades up
                               from black: measured brightness of its first frame
                               is 9/255. So any moment the video is not actually
                               playing -- autoplay refused, low-power mode, a
                               backgrounded tab, the clip still buffering -- left
                               a black rectangle in the middle of the hero.
                               Layering the poster means the worst case is a
                               still photograph, which is the right worst case
                               for a photographer's home page. */
                            <>
                              <Image
                                className={styles.media}
                                src={shown.poster ?? shown.src}
                                alt={shown.alt}
                                fill
                                sizes="(max-width: 899px) 34vw, 26vw"
                                draggable={false}
                                style={focusOf(shown.poster)}
                              />
                              <video
                                className={`${styles.media} ${styles.clip}`}
                                src={shown.src}
                                muted
                                loop
                                playsInline
                                autoPlay={!reducedMotion}
                                preload="metadata"
                                aria-hidden="true"
                                tabIndex={-1}
                                onPlaying={(e) => e.currentTarget.setAttribute('data-playing', 'true')}
                                onPause={(e) => e.currentTarget.removeAttribute('data-playing')}
                              />
                            </>
                          ) : (
                            <Image
                              className={`${styles.media}${shown.grade === 'soft' ? ` ${styles.soft}` : ''}`}
                              src={shown.src}
                              alt={shown.alt}
                              fill
                              sizes="(max-width: 899px) 34vw, 26vw"
                              priority={i === 0 && t === 0}
                              draggable={false}
                              style={focusOf(shown.src, shown.focus)}
                            />
                          )}
                        </div>
                      );
                    })}
                    <span className={styles.name}>
                      {col.project.title}
                      <span className={styles.meta}>
                        {col.project.location}, {col.project.year}
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
