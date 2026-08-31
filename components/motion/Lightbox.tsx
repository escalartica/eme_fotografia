'use client';
import { useEffect, useRef } from 'react';
import { createFocusTrap, type FocusTrap } from 'focus-trap';
import styles from './Lightbox.module.css';

export function Lightbox({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const trapRef = useRef<FocusTrap | null>(null);

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
    trapRef.current = trap;
    trap.activate();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      trap.deactivate();
      trapRef.current = null;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} data-testid="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div ref={contentRef} className={styles.content} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
