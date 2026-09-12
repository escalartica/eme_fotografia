'use client';
import { Children, useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './StackedSections.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Section transitions in the Agentura (Framer) manner: a section that fits
 * the viewport pins at the top while the next one slides up over it, and
 * the pinned one recedes (slight scale-down, dimmed) as it is covered -- a
 * stack of cards rather than a plain scroll.
 *
 * SOBRE EL "RECEDES" DE LA LÍNEA DE ARRIBA. Hasta ahora esa palabra era una
 * promesa que el código no cumplía: lo único que ocurría era que un velo de
 * papel subía de 0 a 0.75 sobre el panel anclado. Un velo apaga, pero no
 * aleja -- y la transición entre secciones de la referencia es una tarjeta
 * que se va hacia atrás, no una que se lava. Ahora el contenido del panel
 * anclado ADEMÁS se encoge hasta `--recede-scale` con el mismo scrub, así
 * que el papel de `.panel` asoma por sus cuatro bordes: sobre un panel de
 * servicio, que es una fotografía a sangre, eso se lee exactamente como una
 * copia que se posa sobre la mesa mientras la siguiente entra por abajo. El
 * velo NO se escala (es hermano, no hijo), de modo que sigue tapando el
 * panel entero, márgenes incluidos, y nada del fondo se cuela.
 *
 * Escala y velo van sobre el mismo ScrollTrigger a propósito: son un solo
 * gesto -- profundidad -- y si se separan en dos tiempos se vuelven dos
 * efectos que compiten.
 *
 * Each direct child becomes one panel. Panels taller than the viewport
 * stay in the normal flow (a pinned element taller than the screen could
 * never be read to the end), so they act as the sliding layer over the
 * pinned panel before them. Measured on mount and on resize.
 */
export function StackedSections({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    const panels = Array.from(root.children) as HTMLElement[];
    let ctx: gsap.Context | null = null;
    let timer = 0;

    const build = () => {
      ctx?.revert();
      panels.forEach((p) => p.classList.remove(styles.pinned));
      const pinned = panels.map((p) => p.scrollHeight <= window.innerHeight + 2);
      panels.forEach((p, i) => p.classList.toggle(styles.pinned, pinned[i]));
      // El valor vive en el CSS (StackedSections.module.css) y se lee de
      // ahí: es una magnitud visual y su sitio es la hoja de estilos, junto
      // al velo con el que forma un solo gesto. Se lee una vez por montaje y
      // por resize, no por fotograma.
      const declared = Number(getComputedStyle(root).getPropertyValue('--recede-scale'));
      const recede = Number.isFinite(declared) && declared > 0 && declared < 1 ? declared : 1;
      ctx = gsap.context(() => {
        panels.forEach((panel, i) => {
          const next = panels[i + 1];
          if (!next || !pinned[i]) return;
          // As the next panel covers this pinned one, a veil of paper
          // rises over it so it recedes -- a veil rather than opacity, so
          // the panels further down the stack never show through.
          const veil = panel.querySelector(`.${styles.veil}`);
          if (!veil) return;
          const scrub = { trigger: next, start: 'top bottom', end: 'top top', scrub: true } as const;
          gsap.fromTo(veil, { opacity: 0 }, { opacity: 0.75, ease: 'none', scrollTrigger: { ...scrub } });
          // El contenido del panel, no el panel: `.panel` es quien pinta el
          // papel que tiene que asomar por los bordes, así que encogerlo a él
          // no dejaría ver nada. El velo es hermano de este hijo y no se
          // escala con él, que es lo que mantiene el panel tapado de borde a
          // borde mientras se aleja.
          const content = panel.firstElementChild as HTMLElement | null;
          if (content && recede < 1) {
            gsap.fromTo(
              content,
              { scale: 1 },
              { scale: recede, ease: 'none', scrollTrigger: { ...scrub } }
            );
          }
        });
      }, root);
      ScrollTrigger.refresh();
    };

    build();
    const remedir = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 150);
    };
    window.addEventListener('resize', remedir, { passive: true });
    // Y AL ABRIR O CERRAR UN DESPLEGABLE, que es la otra cosa que cambia el
    // alto de un panel. Desde que la guía de la home («Antes de escribirnos»)
    // es un índice de seis `<details>`, hay un panel dentro de esta pila cuya
    // altura la decide el visitante -- y `toggle` no dispara `resize`, así
    // que sin esto la clasificación anclado/no anclado se queda con la medida
    // del montaje. El caso malo es concreto: un panel medido como «cabe en
    // pantalla» recibe `position: sticky`, el visitante abre una respuesta,
    // el panel pasa a ser más alto que la ventana y el final deja de poder
    // alcanzarse. Además los ScrollTrigger de los paneles siguientes quedan
    // medidos contra una maqueta vieja.
    // En captura: `toggle` no burbujea.
    root.addEventListener('toggle', remedir, true);
    return () => {
      window.removeEventListener('resize', remedir);
      root.removeEventListener('toggle', remedir, true);
      window.clearTimeout(timer);
      ctx?.revert();
      panels.forEach((p) => p.classList.remove(styles.pinned));
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className={styles.stack}>
      {Children.map(children, (child, i) => (
        <div className={styles.panel} data-panel={i + 1}>
          {child}
          <div className={styles.veil} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
