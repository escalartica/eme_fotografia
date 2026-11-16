'use client';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * Un enlace que cuenta como contacto (lead) en Google Analytics al pulsarlo.
 *
 * Sirve para los botones de WhatsApp y correo de los embudos: el contacto
 * sale de la web, así que el único rastro que queda es el clic. Manda el
 * evento recomendado de GA4 `generate_lead` con dos datos: `form_id`, que
 * identifica la oferta (el mismo identificador que recibirá el CRM), y
 * `method` (whatsapp o email).
 *
 * Solo llega a Google si la persona aceptó las cookies: `window.gtag` lo
 * define components/consent/CookieConsent.tsx después de «Aceptar». Sin él
 * el enlace funciona igual y no se manda nada.
 */
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  formId: string;
  method: 'whatsapp' | 'email';
  children: ReactNode;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function LeadLink({ formId, method, children, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        try {
          window.gtag?.('event', 'generate_lead', { form_id: formId, method });
        } catch {
          // Un fallo de medición nunca puede impedir que alguien nos escriba.
        }
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
