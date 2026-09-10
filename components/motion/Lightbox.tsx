'use client';
import { useEffect, useRef } from 'react';
import { createFocusTrap } from 'focus-trap';
import { CloseIcon } from '@/components/ui/Icon';
import styles from './Lightbox.module.css';

export function Lightbox({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

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
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      trap.deactivate();
    };
  }, [isOpen, onClose]);

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
