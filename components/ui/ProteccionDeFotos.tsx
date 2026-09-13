'use client';
import { useEffect } from 'react';

/**
 * PONER DIFÍCIL GUARDARSE UNA FOTO SIN QUERER.
 *
 * LO QUE ESTO ES Y LO QUE NO ES, escrito aquí para que nadie lo confunda más
 * adelante:
 *
 * Esto NO protege las fotografías. No puede. Cualquiera que sepa abrir las
 * herramientas del navegador, mirar la pestaña de red o pulsar «Guardar
 * página como» se lleva la imagen igual, y NO EXISTE NINGUNA FORMA DE IMPEDIR
 * UNA CAPTURA DE PANTALLA desde una página web: la hace el sistema operativo
 * --Cmd+Mayús+4, el botón lateral del móvil-- y el navegador ni se entera.
 * Cualquier código que diga hacerlo es teatro: detecta que la ventana ha
 * perdido el foco y tapa la página, lo cual molesta a quien cambia de
 * pestaña de buena fe y no detiene ni una sola captura de verdad.
 *
 * Lo que esto SÍ hace es quitar los tres caminos de un clic, que son por los
 * que se va el 99 % de las copias reales:
 *
 *   1. El menú del botón derecho sobre una foto («Guardar imagen como…»).
 *   2. Arrastrar la foto fuera del navegador, que en un Mac la deja en el
 *      escritorio sin pedir permiso ni avisar.
 *   3. La pulsación larga en el móvil, que en iOS ofrece «Añadir a Fotos».
 *
 * SOLO SOBRE LAS IMÁGENES, nunca sobre la página entera. Bloquear el botón
 * derecho en todo el documento rompe cosas legítimas --abrir un enlace en una
 * pestaña nueva, copiar una dirección de correo-- y convierte una web en una
 * molestia. El menú sigue funcionando en todo lo que no sea una fotografía.
 *
 * LA PROTECCIÓN DE VERDAD ESTÁ EN OTRO SITIO y ya está puesta: las galerías
 * privadas viven fuera de `public/`, se sirven por una ruta que comprueba la
 * sesión en cada petición y van con `Cache-Control: private, no-store`. Es
 * decir, a las fotos de una boda no se llega sin la contraseña. Eso sí es una
 * barrera; esto de aquí es una puerta cerrada con pestillo en una casa de
 * cristal.
 */
export function ProteccionDeFotos() {
  useEffect(() => {
    const esFoto = (destino: EventTarget | null): boolean => {
      const el = destino as HTMLElement | null;
      if (!el || typeof el.closest !== 'function') return false;
      // `closest` y no `tagName === 'IMG'`: muchas fotos del sitio llevan
      // encima una capa de degradado o un botón transparente, y el evento
      // llega a esa capa, no a la imagen.
      return el.closest('img, picture, [data-foto]') !== null;
    };

    const menu = (e: MouseEvent) => {
      if (esFoto(e.target)) e.preventDefault();
    };
    const arrastre = (e: DragEvent) => {
      if (esFoto(e.target)) e.preventDefault();
    };

    document.addEventListener('contextmenu', menu);
    document.addEventListener('dragstart', arrastre);
    return () => {
      document.removeEventListener('contextmenu', menu);
      document.removeEventListener('dragstart', arrastre);
    };
  }, []);

  return null;
}
