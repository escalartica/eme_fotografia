import type { CSSProperties } from 'react';

/**
 * EL PUESTO DE UN ELEMENTO EN UNA SECUENCIA, para que la hoja de estilos lo
 * convierta en retraso.
 *
 * POR QUÉ NO `nth-child`. El sitio ya escalonaba listas con selectores del
 * tipo `.item:nth-child(3)`, y eso se rompe de dos maneras que no se ven al
 * leer el CSS: hay que escribir una regla por puesto --así que siempre acaba
 * en un `:nth-child(n + 5)` que amontona todo lo que venga después en el
 * mismo instante--, y basta con que el marcado meta un comentario, un
 * separador o un elemento condicional entre medias para que los números
 * dejen de coincidir con lo que ve el lector.
 *
 * Con una propiedad personalizada el turno lo pone quien conoce la
 * secuencia --el componente, que está iterando-- y el CSS hace una sola
 * cuenta: `calc(var(--turno) * paso)`. Una regla, sin tope.
 *
 * NO ES UNA ANIMACIÓN POR SÍ MISMA. Esto sólo declara un número; todo el
 * movimiento vive en las hojas, detrás de la doble puerta de siempre
 * (`prefers-reduced-motion: no-preference` + `@supports`), así que donde no
 * hay soporte este número no hace absolutamente nada y el contenido se ve
 * completo y quieto.
 *
 * El cast es el mismo que usan `sinEtalonarStyle` y `ScrollReveal`: los tipos
 * de React no admiten propiedades personalizadas en `style` aunque el DOM
 * sí. React no le añade unidades a una propiedad que empieza por `--`, así
 * que el número llega al CSS tal cual.
 */
export function turno(i: number): CSSProperties {
  return { ['--turno']: i } as CSSProperties;
}
