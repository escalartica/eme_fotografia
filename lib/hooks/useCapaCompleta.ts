'use client';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * ¿HAY UNA CAPA OCUPANDO LA PANTALLA ENTERA AHORA MISMO?
 *
 * El sitio tiene tres cosas que pueden tapar la página completa --la
 * secuencia de apertura, el menú del teléfono y, en su día, cualquier otra--
 * y cuatro que flotan por encima de todo sin enterarse: el botón de WhatsApp,
 * el de volver arriba y el aviso de cookies. Sin esto, abrir el menú en un
 * teléfono dejaba dos pastillas flotantes y un aviso legal pintados por
 * delante de la navegación.
 *
 * La señal se lee del propio documento en vez de pasarla por props o por un
 * contexto, y no es pereza: quien tapa la pantalla y quien se aparta no se
 * conocen entre sí --viven en ramas distintas del árbol, y la secuencia de
 * apertura ni siquiera está montada cuando el aviso decide si se enseña--.
 * Un atributo en el documento es el único sitio donde los dos miran.
 *
 * Dos formas de anunciarlo, por motivos distintos:
 *   - `body > [inert]`: lo que ya hacía CinematicIntro, que inertiza a sus
 *     hermanos mientras se reproduce. No hay que tocarlo.
 *   - `body[data-capa-completa]`: lo que pone el menú, que NO puede usar
 *     `inert` --es la interfaz con la que se está interactuando, inertizarla
 *     sería inertizar el propio menú--.
 */
const SELECTOR = 'body > [inert], body[data-capa-completa]';

export function useCapaCompleta(): boolean {
  const subscribe = useCallback((avisar: () => void) => {
    const observador = new MutationObserver(avisar);
    observador.observe(document.body, {
      attributes: true,
      attributeFilter: ['inert', 'data-capa-completa'],
      subtree: true,
      // `childList` además de `attributes`: la capa puede llegar YA marcada,
      // montándose de nuevas, y entonces no hay ningún cambio de atributo que
      // observar -- hay una inserción.
      childList: true,
    });
    return () => observador.disconnect();
  }, []);

  const leer = useCallback(() => document.querySelector(SELECTOR) !== null, []);

  // `useSyncExternalStore` y no un `useState` dentro de un efecto: esto es
  // estado externo que ya existe antes de que React monte, así que leerlo en
  // un efecto significa pintar primero la respuesta equivocada y corregirla
  // después. En el servidor no hay documento al que preguntar: `false`.
  return useSyncExternalStore(subscribe, leer, () => false);
}

/** El atributo que pone quien tapa la pantalla. Exportado para que no haya
 *  dos literales que puedan divergir. */
export const ATRIBUTO_CAPA = 'data-capa-completa';

/**
 * Lo que pone el aviso de cookies mientras está a la vista.
 *
 * NO es una capa a pantalla completa --no tapa la página, sólo la franja de
 * abajo-- así que va por su cuenta: los dos botones flotantes se apartan, y
 * el propio aviso no se aparta de sí mismo, que es lo que pasaría si usara el
 * mismo atributo (lo lee él).
 */
export const ATRIBUTO_AVISO = 'data-aviso-cookies';

/** ¿Está puesto el aviso de cookies? Mismo mecanismo que `useCapaCompleta`, y
 *  por el mismo motivo: quien se aparta y quien tapa no se conocen. */
export function useAvisoDeCookies(): boolean {
  const subscribe = useCallback((avisar: () => void) => {
    const observador = new MutationObserver(avisar);
    observador.observe(document.body, { attributes: true, attributeFilter: [ATRIBUTO_AVISO] });
    return () => observador.disconnect();
  }, []);

  const leer = useCallback(() => document.body.hasAttribute(ATRIBUTO_AVISO), []);

  return useSyncExternalStore(subscribe, leer, () => false);
}

/**
 * EL CANDADO DEL SCROLL, CONTADO.
 *
 * Dos capas pueden coincidir --el visor de una galería abierto dentro de una
 * página cuyo menú también se abre-- y con cada una guardando y restaurando
 * el `overflowY` por su cuenta, la primera que cierra se lo devuelve a la
 * página mientras la otra sigue tapándola. Con un contador, el `body` sólo se
 * toca en el paso de cero a uno y de uno a cero.
 *
 * SÓLO EL EJE VERTICAL. El horizontal del `body` no es libre: la hoja global
 * le pone `overflow-x: clip`, del que dependen todas las secciones a sangre
 * del sitio (el comentario largo está en components/layout/MobileMenu.tsx).
 */
let capasAbiertas = 0;
let overflowAnterior = '';

export function bloquearElScroll(): () => void {
  if (capasAbiertas === 0) {
    overflowAnterior = document.body.style.overflowY;
    document.body.style.overflowY = 'hidden';
  }
  capasAbiertas += 1;

  let liberado = false;
  return () => {
    if (liberado) return;
    liberado = true;
    capasAbiertas -= 1;
    if (capasAbiertas === 0) document.body.style.overflowY = overflowAnterior;
  };
}
