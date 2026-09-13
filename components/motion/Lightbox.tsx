'use client';
import { useEffect, useRef } from 'react';
import { createFocusTrap } from 'focus-trap';
import { CloseIcon } from '@/components/ui/Icon';
import { ATRIBUTO_CAPA, bloquearElScroll } from '@/lib/hooks/useCapaCompleta';
import styles from './Lightbox.module.css';

export function Lightbox({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  /**
   * EL `onClose` SE GUARDA EN UNA REFERENCIA, y el efecto de abajo solo
   * depende de `isOpen`.
   *
   * Casi nadie pasa un `onClose` estable: lo normal es escribir
   * `onClose={() => setAlgo(null)}` en el JSX, que es una función nueva en
   * cada renderizado. Con `onClose` entre las dependencias, CUALQUIER cambio
   * de estado de quien nos usa desmontaba y volvía a montar la trampa de
   * foco. Y `focus-trap` al desactivarse devuelve el foco a donde estaba
   * antes y al activarse lo lleva al primer elemento enfocable: escribir una
   * letra en un campo de dentro del visor sacaba el foco del campo.
   *
   * En un móvil eso se ve así: el teclado se cierra con cada letra. Es lo que
   * pasaba al comentar una foto desde el visor de la galería privada.
   */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /**
   * LA PÁGINA DE DEBAJO SE QUEDA QUIETA, y el resto del sitio se entera de
   * que hay una capa a pantalla completa.
   *
   * Sin el candado, arrastrar sobre el telón hacía correr la página del
   * fondo: se cerraba el visor y aparecías en otro sitio. Y sin el atributo,
   * el botón de WhatsApp, el de volver arriba y el aviso de cookies --que
   * flotan por encima de todo-- se pintaban por delante de la fotografía.
   *
   * El candado va contado (`bloquearElScroll`), no guardado aquí: si el visor
   * y otra capa coinciden, la primera que cierre no puede devolverle el
   * scroll a una página que sigue tapada.
   */
  useEffect(() => {
    if (!isOpen) return;
    const liberar = bloquearElScroll();
    document.body.setAttribute(ATRIBUTO_CAPA, 'visor');
    return () => {
      liberar();
      document.body.removeAttribute(ATRIBUTO_CAPA);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const trap = createFocusTrap(contentRef.current, {
      escapeDeactivates: false,
      clickOutsideDeactivates: false,
      allowOutsideClick: true,
      fallbackFocus: () => contentRef.current!,
      delayInitialFocus: false,
      delayReturnFocus: false,
    });
    trap.activate();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      trap.deactivate();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // aria-label gives the dialog an accessible name (WCAG 4.1.2) --
    // without one, a screen reader announces only "dialog" on entry, with
    // no indication of what just opened. Generic on purpose: this Lightbox
    // renders either a photo or a letterboxed video (ProjectGallery.tsx),
    // so a single label covers both rather than assuming one media type.
    <div
      className={styles.backdrop}
      data-testid="lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada"
    >
      <div ref={contentRef} className={styles.content} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        {children}
        <button type="button" className={styles.closeButton} onClick={onClose}>
          <CloseIcon size={14} />
          Cerrar
        </button>
      </div>
    </div>
  );
}
