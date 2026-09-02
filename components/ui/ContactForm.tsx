'use client';
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { site } from '@/content/site';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
import styles from './ContactForm.module.css';

// A4 (docs/PATRONES-AWWWARDS.md): one question per screen instead of a
// wall of fields, cualifying the lead as they go. Register: "tú" singular
// throughout, matching this project's own already-established copy
// convention (content/faq.ts) -- NOT the source pattern's "vosotros",
// which would break consistency with the rest of the site.
const TOTAL_STEPS = 6;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const stepRefs = useRef<Array<HTMLFieldSetElement | null>>([]);
  // Skips the very first run of the effect below (mirrors
  // TrabajosFilter.tsx's own isFirstRenderRef) -- see that effect's own
  // comment for why.
  const isFirstRenderRef = useRef(true);

  // Autofocus the newly active step's first field, and animate its entrance
  // (transform/opacity only, gated on reduced motion like every other
  // effect in this codebase). Fieldsets stay mounted the whole time (only
  // the `hidden` attribute toggles) so this effect re-runs on every step
  // change, not just on first mount. Autofocus is skipped on that first
  // mount specifically (final whole-branch review, finding M7): stealing
  // focus onto #nombre the instant /contacto renders drops keyboard and
  // screen-reader users straight into the form, past the page heading and
  // any intro copy, with no announcement of what they skipped. On a real
  // step CHANGE (the user just interacted with the form), moving focus to
  // the new step is exactly right and stays as-is.
  useEffect(() => {
    const el = stepRefs.current[step];
    if (!el) return;
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
    } else {
      const firstField = el.querySelector<HTMLElement>('input, select, textarea');
      firstField?.focus();
    }
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: motion.duration.fast, ease: motion.ease.enter });
    });
    return () => ctx.revert();
  }, [step, reducedMotion]);

  function currentStepFields() {
    const el = stepRefs.current[step];
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));
  }

  function goNext() {
    for (const field of currentStepFields()) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return;
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // Enter advances to the next step instead of doing nothing (single-line
  // inputs/select) -- except inside the message textarea, where Enter must
  // stay a newline; that step is submitted via its own button only.
  function handleStepKeyDown(e: KeyboardEvent<HTMLFieldSetElement>) {
    if (e.key !== 'Enter') return;
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    e.preventDefault();
    if (step < TOTAL_STEPS - 1) goNext();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setIsSubmitting(true);
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        setError(`No hemos podido enviar tu mensaje. Escríbenos directamente a ${site.email}`);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(`No hemos podido enviar tu mensaje. Escríbenos directamente a ${site.email}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) return <p role="status">Gracias, hemos recibido tu mensaje. Te responderemos lo antes posible.</p>;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div
        className={styles.progress}
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Paso ${step + 1} de ${TOTAL_STEPS}`}
      >
        <div className={styles.progressBar} style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
      </div>

      <fieldset
        ref={(el) => { stepRefs.current[0] = el; }}
        hidden={step !== 0}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Cómo te llamas?</legend>
        <label htmlFor="nombre" className={styles.fieldLabel}>Nombre</label>
        <input id="nombre" name="nombre" autoComplete="name" required />
      </fieldset>

      <fieldset
        ref={(el) => { stepRefs.current[1] = el; }}
        hidden={step !== 1}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Cuál es tu correo electrónico?</legend>
        <label htmlFor="email" className={styles.fieldLabel}>Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </fieldset>

      <fieldset
        ref={(el) => { stepRefs.current[2] = el; }}
        hidden={step !== 2}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Qué vamos a celebrar?</legend>
        <label htmlFor="tipoEvento" className={styles.fieldLabel}>Tipo de evento</label>
        <select id="tipoEvento" name="tipoEvento" required defaultValue="">
          <option value="" disabled>Selecciona una opción</option>
          <option value="boda">Boda</option>
          <option value="evento">Evento corporativo</option>
          <option value="otro">Otro</option>
        </select>
      </fieldset>

      <fieldset
        ref={(el) => { stepRefs.current[3] = el; }}
        hidden={step !== 3}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Cuándo y dónde?</legend>
        <label htmlFor="fecha" className={styles.fieldLabel}>Fecha aproximada</label>
        <input id="fecha" name="fecha" type="date" />
        <label htmlFor="lugar" className={styles.fieldLabel}>Lugar del evento</label>
        <input id="lugar" name="lugar" placeholder="Ej. Hacienda de San Rafael, Sevilla" />
      </fieldset>

      <fieldset
        ref={(el) => { stepRefs.current[4] = el; }}
        hidden={step !== 4}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>Un par de detalles más</legend>
        <label htmlFor="numeroInvitados" className={styles.fieldLabel}>Número de invitados, más o menos</label>
        <input id="numeroInvitados" name="numeroInvitados" type="number" min="0" placeholder="Ej. 80" />
        <label htmlFor="presupuesto" className={styles.fieldLabel}>Presupuesto aproximado, si ya lo tienes</label>
        <input id="presupuesto" name="presupuesto" placeholder="Ej. 1500-2500€" />
      </fieldset>

      <fieldset
        ref={(el) => { stepRefs.current[5] = el; }}
        hidden={step !== 5}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>Cuéntanos un poco más</legend>
        <label htmlFor="mensaje" className={styles.fieldLabel}>Mensaje</label>
        <textarea id="mensaje" name="mensaje" required />
      </fieldset>

      {error && <p role="alert">{error}</p>}

      <div className={styles.controls}>
        {step > 0 && (
          <button type="button" className={styles.backButton} onClick={goBack}>
            Atrás
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button type="button" onClick={goNext}>Siguiente</button>
        ) : (
          <button type="submit" disabled={isSubmitting}>Enviar</button>
        )}
      </div>
    </form>
  );
}
