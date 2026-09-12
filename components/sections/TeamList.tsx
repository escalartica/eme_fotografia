'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './TeamList.module.css';

export interface TeamMember {
  name: string;
  role: string;
  portrait: string;
  /** Optional external profile. */
  href?: string;
}

/**
 * El equipo: los nombres a un lado, el retrato de quien se está leyendo al
 * otro, anclado mientras se recorre la lista.
 *
 * LO QUE SUSTITUYE, Y POR QUÉ. Antes era un índice de cinco filas -- numeral,
 * nombre, cargo -- y los retratos existían SOLO como una estampa que seguía al
 * puntero. Tres problemas en uno:
 *
 *  1. En una sección que se llama «Equipo», las caras no se veían. Había que
 *     adivinar que pasando el ratón por encima aparecía algo, y quien entra
 *     desde el móvil no tenía ni esa opción: veía miniaturas de 3,5 rem.
 *  2. Era uno de los cinco efectos del sitio que seguían al puntero. Cinco es
 *     un tic, no una idea.
 *  3. Los numerales 01-05 no numeraban nada. Cinco personas no son una
 *     secuencia que haya que leer en orden, y el número competía en peso con
 *     el nombre al que acompañaba.
 *
 * Ahora el retrato es grande, está siempre en pantalla y cambia al ritmo del
 * scroll: la persona cuya fila cruza la banda central de la ventana es la que
 * se ve. Con ratón, además, pasar por encima de una fila manda -- es más
 * directo que esperar a que el scroll llegue.
 *
 * VISIBLE EN REPOSO. La primera persona está activa desde el primer pintado,
 * así que la sección nunca se ve vacía esperando un gesto; y si el navegador
 * no tiene IntersectionObserver, se queda en ese estado y la lista sigue
 * leyéndose entera.
 */
export function TeamList({ members }: { members: TeamMember[] }) {
  const [activo, setActivo] = useState(0);
  const listaRef = useRef<HTMLOListElement>(null);
  // El scroll no debe pisar la elección del puntero: mientras el ratón está
  // sobre una fila, manda el ratón.
  const fijadoPorPuntero = useRef(false);

  useEffect(() => {
    const lista = listaRef.current;
    if (!lista || typeof IntersectionObserver !== 'function') return;
    const filas = Array.from(lista.querySelectorAll<HTMLElement>('[data-indice]'));
    const observer = new IntersectionObserver(
      (entradas) => {
        if (fijadoPorPuntero.current) return;
        // La fila más cercana al centro de la banda, no «la última que
        // entró»: con filas cortas pueden estar dos dentro a la vez, y sin
        // esto el retrato saltaba adelante y atrás al desplazarse despacio.
        const dentro = entradas.filter((e) => e.isIntersecting);
        if (dentro.length === 0) return;
        const mejor = dentro.reduce((a, b) => (a.intersectionRatio >= b.intersectionRatio ? a : b));
        const i = Number((mejor.target as HTMLElement).dataset.indice);
        if (!Number.isNaN(i)) setActivo(i);
      },
      // Una banda estrecha en mitad de la ventana: la fila que la cruza es la
      // que se está leyendo.
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.5, 1] }
    );
    filas.forEach((f) => observer.observe(f));
    return () => observer.disconnect();
  }, [members.length]);

  const entraPuntero = useCallback((i: number) => {
    fijadoPorPuntero.current = true;
    setActivo(i);
  }, []);
  const salePuntero = useCallback(() => {
    fijadoPorPuntero.current = false;
  }, []);

  return (
    <div className={styles.wrap}>
      {/* El retrato grande. `aria-hidden` porque es la misma persona que el
          nombre de al lado ya nombra en texto: para un lector de pantalla
          sería el mismo dato dos veces. */}
      <div className={styles.stage} aria-hidden="true">
        {members.map((m, i) => (
          <span key={m.name} className={styles.layer} data-activa={activo === i || undefined}>
            <Image
              src={m.portrait}
              alt=""
              fill
              sizes="(max-width: 899px) 0px, (max-width: 1200px) 38vw, 26rem"
              className={styles.layerImage}
              priority={i === 0}
            />
          </span>
        ))}
      </div>

      <ol className={styles.list} ref={listaRef} onMouseLeave={salePuntero}>
        {members.map((m, i) => {
          const dentro = (
            <>
              {/* El retrato en línea es el que se ve en móvil, donde no hay
                  sitio para dos columnas ni puntero al que seguir. */}
              <span className={styles.thumb} aria-hidden="true">
                <Image src={m.portrait} alt="" fill sizes="(min-width: 900px) 0px, 6rem" className={styles.thumbImage} />
              </span>
              <span className={styles.name}>{m.name}</span>
              <span className={styles.role}>{m.role}</span>
            </>
          );
          return (
            <li
              key={m.name}
              className={styles.row}
              data-indice={i}
              data-activa={activo === i || undefined}
              onMouseEnter={() => entraPuntero(i)}
            >
              {m.href ? (
                <a
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.rowInner}
                  onFocus={() => entraPuntero(i)}
                  onBlur={salePuntero}
                >
                  {dentro}
                  <span className="sr-only"> (Instagram, se abre en una pestaña nueva)</span>
                </a>
              ) : (
                <div className={styles.rowInner}>{dentro}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
