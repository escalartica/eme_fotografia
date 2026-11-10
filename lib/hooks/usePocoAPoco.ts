import { useEffect, useRef, useState } from 'react';

/**
 * PINTA UNA LISTA LARGA POCO A POCO, según se va bajando.
 *
 * Una galería de boda para elegir son 1.200 fotos o más, y cada una en la
 * cuadrícula de la pareja lleva su foto, dos botones y un cuadro de texto.
 * Montarlas todas de golpe deja el móvil pensando varios segundos al entrar y
 * cada corazón que se marca vuelve a repasar la lista entera. `loading="lazy"`
 * no lo arregla: retrasa la descarga de la imagen, no el coste de tener mil
 * doscientos elementos en la página.
 *
 * Así que se pintan las primeras `paso` y, cuando el final de lo pintado se
 * acerca a la pantalla, `paso` más. Quien baja sin parar no llega a ver el
 * final: se piden con 1.500 px de adelanto.
 *
 * `clave` es lo que, al cambiar, vuelve a empezar desde arriba (el filtro de
 * «Todas / Favoritas / Con nota»): cambiar de filtro no debe dejar montadas
 * las mil fotos de la vista anterior.
 *
 * Sin IntersectionObserver (navegadores muy viejos, y el jsdom de los tests)
 * se pinta todo, que es como funcionaba antes: peor rendimiento, pero nada se
 * queda inalcanzable.
 */
export function usePocoAPoco<T>(lista: readonly T[], clave: string, paso = 120) {
  const [estado, setEstado] = useState({ clave, cuantas: paso });
  // Ajustar el estado durante el render cuando cambia una entrada es el
  // patrón que recomienda React para esto (en vez de un efecto que pinta
  // primero lo viejo y luego corrige).
  if (estado.clave !== clave) setEstado({ clave, cuantas: paso });
  const cuantas = estado.clave === clave ? estado.cuantas : paso;

  const sinObservador = typeof window !== 'undefined' && !('IntersectionObserver' in window);
  const limite = sinObservador ? lista.length : cuantas;
  const hayMas = limite < lista.length;
  const centinela = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = centinela.current;
    if (!el || !hayMas) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setEstado((e) => ({ clave: e.clave, cuantas: e.cuantas + paso }));
        }
      },
      { rootMargin: '1500px 0px' }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [hayMas, limite, paso]);

  return {
    pintadas: limite >= lista.length ? lista : lista.slice(0, limite),
    hayMas,
    centinela,
    /** Para el botón «Ver más» que acompaña al centinela: con teclado, o si
     *  el observador no se dispara, tiene que haber una forma de seguir. */
    verMas: () => setEstado((e) => ({ clave: e.clave, cuantas: e.cuantas + paso })),
  };
}
