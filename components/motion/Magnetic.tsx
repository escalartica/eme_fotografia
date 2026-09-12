'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './Magnetic.module.css';

/**
 * ATRACCIÓN. El elemento se inclina hacia el puntero cuando éste se acerca,
 * y vuelve solo a su sitio cuando se aleja.
 * ---------------------------------------------------------------------
 * Es el gesto que tienen las llamadas a la acción de las tres referencias
 * que trajo el cliente (agentura.framer.website lo lleva en su botón de
 * contacto, bellephoto.com.au en el suyo): el botón parece notar que vas a
 * pulsarlo antes de que llegues. Cuesta muy poco y es de las poquísimas
 * cosas que un visitante recuerda de una web.
 *
 * LAS CUATRO REGLAS QUE LO GOBIERNAN:
 *
 * 1. SOLO CON RATÓN. `(hover: hover) and (pointer: fine)`. En una pantalla
 *    táctil no hay puntero al que acercarse: el efecto no existe, y el dedo
 *    no se encuentra con un objetivo que se mueve justo antes de tocarlo.
 * 2. SOLO SI SE PIDE MOVIMIENTO. Con `prefers-reduced-motion` no se monta
 *    ni el escuchador.
 * 3. NO CAMBIA LA MAQUETACIÓN. Todo el desplazamiento va en `transform`,
 *    nunca en `top`/`left`/márgenes, así que no recalcula nada del resto de
 *    la página. Y va en un ENVOLTORIO, no en el propio enlace: `.arrowLink`
 *    ya tiene su propio `transform` de hover (styles/layout.css), y un
 *    `transform` en línea escrito por GSAP sobre el mismo elemento lo
 *    anularía para siempre en cuanto el puntero pasara una vez.
 * 4. NO MIDE EN CADA MOVIMIENTO DEL RATÓN. Leer `getBoundingClientRect()`
 *    sesenta veces por segundo justo después de que GSAP haya escrito un
 *    `transform` obliga al navegador a recalcular la maquetación en cada
 *    fotograma. La caja se mide una vez y solo se vuelve a medir cuando de
 *    verdad ha podido cambiar: al hacer scroll y al cambiar el tamaño de la
 *    ventana. Mientras el puntero se pasea y la página está quieta, este
 *    componente no lee nada del DOM.
 *
 * El centro que se usa es el centro EN REPOSO, no el actual: como el propio
 * efecto desplaza el elemento, medir su caja desplazada realimentaría el
 * cálculo y el botón se iría persiguiendo a sí mismo hasta el borde. Se
 * resta la traslación que GSAP tiene puesta en ese instante.
 */
export function Magnetic({
  children,
  className,
  /* Cuánto del camino hacia el puntero recorre el elemento. 0.3 es lo que
     se lee como "tira de mí" sin que el objetivo se escape del cursor. */
  strength = 0.3,
  /* Radio de atracción, en píxeles, medido desde el borde de la caja. Por
     debajo de ~60 el efecto no da tiempo a leerse; por encima de ~140 el
     botón se mueve cuando el puntero todavía va a otra cosa. */
  radius = 90,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    let box: { cx: number; cy: number; hw: number; hh: number } | null = null;
    const invalidate = () => {
      box = null;
    };
    const measure = () => {
      const r = el.getBoundingClientRect();
      // El desplazamiento vivo se descuenta para quedarnos con el centro en
      // reposo (regla 4 de arriba).
      const dx = Number(gsap.getProperty(el, 'x')) || 0;
      const dy = Number(gsap.getProperty(el, 'y')) || 0;
      box = {
        cx: r.left + r.width / 2 - dx,
        cy: r.top + r.height / 2 - dy,
        hw: r.width / 2,
        hh: r.height / 2,
      };
    };

    let pulled = false;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      if (!box) measure();
      if (!box) return;
      const dx = event.clientX - box.cx;
      const dy = event.clientY - box.cy;
      // Distancia al BORDE de la caja, no a su centro: si no, un botón ancho
      // atrae desde mucho más lejos por los lados que por arriba.
      const outX = Math.max(0, Math.abs(dx) - box.hw);
      const outY = Math.max(0, Math.abs(dy) - box.hh);
      if (outX * outX + outY * outY <= radius * radius) {
        pulled = true;
        xTo(dx * strength);
        yTo(dy * strength);
      } else if (pulled) {
        pulled = false;
        xTo(0);
        yTo(0);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [radius, reducedMotion, strength]);

  return (
    <span ref={ref} className={`${styles.magnet}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
