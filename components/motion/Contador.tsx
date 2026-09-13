'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { formatRating } from '@/lib/format';

/**
 * Una cifra que cuenta hasta su valor cuando entra en pantalla.
 *
 * EL VALOR FINAL ESTÁ EN EL HTML DESDE EL PRIMER PINTADO. Se renderiza en el
 * servidor ya escrito, y la cuenta sólo empieza cuando el bloque entra en la
 * ventana. Esto no es un detalle de implementación: si la cifra arrancara en
 * cero, un buscador, un lector de pantalla o cualquiera con JavaScript
 * desactivado leería «0 parejas nos han confiado su boda», que es lo contrario
 * de lo que dice la sección. La regla de la casa -- nada que haya que leer
 * empieza escondido -- aplicada a un número.
 *
 * QUÉ SE ANUNCIA. Un solo nodo de texto, con `role="img"` y el valor
 * definitivo en `aria-label`. Así lo que se anuncia es exactamente «5,0» y no
 * la ristra de números intermedios por la que pasa la animación, y cuando la
 * cifra va dentro de un enlace el nombre accesible del enlace sigue siendo
 * «5,0». `role="img"` y no un `aria-label` a secas porque ARIA prohíbe la
 * etiqueta sobre un `<span>` pelado (rol `generic`) y los navegadores la
 * ignoran -- es el mismo recurso que ya usan las estrellas y los años
 * premiados de Cifras, por el mismo motivo. Y un solo nodo, no dos: duplicar
 * el valor en un `.sr-only` deja el mismo texto dos veces en el documento.
 *
 * Sin movimiento reducido, sin IntersectionObserver o si ya se contó una vez,
 * se queda quieto en su valor.
 */
/**
 * Cómo se escribe la cifra. Es un NOMBRE, no una función, y eso es
 * deliberado: `Cifras` es un componente de servidor y éste es de cliente, así
 * que una función pasada como prop cruza esa frontera y React la rechaza en
 * tiempo de ejecución («Functions cannot be passed directly to Client
 * Components»). Lo que cruza es una cadena; el formateo vive aquí dentro, y
 * la puntuación se sigue leyendo de `lib/format`, que es el único sitio del
 * proyecto donde se decide cómo se escribe la nota de Bodas.net.
 */
export type FormatoCifra = 'entero' | 'entero-con-mas' | 'nota';

const FORMATOS: Record<FormatoCifra, (n: number) => string> = {
  entero: (n) => String(Math.round(n)),
  'entero-con-mas': (n) => `+${Math.round(n)}`,
  nota: (n) => formatRating(n),
};

export function Contador({
  valor,
  formato = 'entero',
  duracion = 1100,
}: {
  valor: number;
  formato?: FormatoCifra;
  duracion?: number;
}) {
  const escribe = FORMATOS[formato];
  const [mostrado, setMostrado] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    // UNA NOTA NO CUENTA.
    //
    // Contar desde cero funciona con «+300 parejas»: los números por los que
    // pasa son menos de lo que se anuncia, y se leen como el contador
    // subiendo. Con una puntuación sobre cinco pasa lo contrario. Visto en un
    // teléfono al bajar por /servicios: durante casi un segundo la franja
    // decía «1,8» con las cinco estrellas llenas al lado y el rótulo
    // «puntuación máxima en Bodas.net» debajo. Quien pasara el dedo rápido se
    // llevaba una nota de 1,8 sobre 5 de la única cifra de la página que
    // existe para dar confianza.
    //
    // Va por FORMATO y no por una prop del que llama porque no depende del
    // sitio: cualquier nota animada enseña, mientras dura, una nota que no es
    // la suya.
    if (!el || reducedMotion || formato === 'nota' || typeof IntersectionObserver !== 'function') return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Una sola vez: una cifra que vuelve a contar cada vez que se pasa por
        // delante deja de leerse como un dato y pasa a ser un adorno.
        observer.disconnect();
        const inicio = performance.now();
        const paso = (ahora: number) => {
          const t = Math.min(1, (ahora - inicio) / duracion);
          // Desaceleración cúbica: arranca rápido y se posa en el valor, en
          // vez de llegar de golpe.
          const e = 1 - Math.pow(1 - t, 3);
          setMostrado(valor * e);
          if (t < 1) raf = requestAnimationFrame(paso);
          else setMostrado(null); // vuelve al valor exacto renderizado
        };
        raf = requestAnimationFrame(paso);
      },
      // Que haya entrado de verdad, no que asome por el borde.
      { rootMargin: '0px 0px -15% 0px', threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor, duracion, formato, reducedMotion]);

  return (
    <span ref={ref} role="img" aria-label={escribe(valor)}>
      {escribe(mostrado ?? valor)}
    </span>
  );
}
