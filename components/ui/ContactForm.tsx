'use client';
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { site } from '@/content/site';
import { CONSENTIMIENTO_TEXTO } from '@/content/consentimiento';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { motion } from '@/lib/motion-tokens';
import styles from './ContactForm.module.css';

// A4 (docs/PATRONES-AWWWARDS.md): one question per screen instead of a
// wall of fields, qualifying the lead as they go.
//
// REGISTER: "vosotros", the couple, like the rest of the site. This comment
// used to claim the opposite -- that singular "tú" matched "this project's
// own already-established copy convention (content/faq.ts)". That was simply
// wrong: content/faq.ts is entirely in vosotros ("Escribidnos", "os
// contestamos", "vuestra fecha", "si incluís", "no tenéis que coordinar"),
// and so is every other public surface. The whole form was written in the
// wrong person on the strength of a mistaken comment, and step 7 switched to
// vosotros mid-form anyway.
//
// SIX steps, not eight. What changed and why:
//  - `fecha` and `lugar` are now REQUIRED. The entire site promises "decidnos
//    la fecha y el lugar y os decimos si estamos libres"; leaving the only two
//    facts needed to keep that promise optional was the single most expensive
//    thing in this form. Each carries a hint so a couple who has not closed
//    the date yet is not blocked.
//  - `comoNosConociste` is now OPTIONAL and LAST. It is attribution data:
//    useful to the studio, worth nothing to the couple, and it used to block
//    them on step 3 of 8 before they had said a word about their wedding.
//  - `presupuesto` is GONE. Its placeholder ("Ej. 1500-2500€") was the only
//    price anywhere on this site, against an explicit client decision not to
//    publish rates -- and it anchored low.
//  - `numeroInvitados` is GONE. It is not among the price variables the site
//    itself declares in content/faq.ts (hours of coverage, preboda, album,
//    travel), so it was asking for something nobody uses.
//  - The two textareas are merged. The good question ("qué es lo más
//    importante para vosotros ese día") was the optional one; the vague one
//    ("Mensaje") was required.
const TOTAL_STEPS = 6;

/**
 * The one place a field's problem is stated, and it stays stated.
 * `role="alert"` so it is announced the moment it appears; the id matches
 * the `aria-describedby` the input carries while it is invalid.
 */
function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${name}-error`} className={styles.fieldError} role="alert">
      {message}
    </p>
  );
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  // Distingue "enviado" de "guardado pero no entregado": la ruta devuelve 200
  // con delivered:false cuando no hay proveedor de correo configurado.
  const [delivered, setDelivered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /**
   * El día de hoy, para el `min` del campo de fecha.
   *
   * Se calcula en el CLIENTE y con estado perezoso, no durante el render del
   * servidor: esta página se sirve estática, así que una fecha calculada allí
   * se queda congelada en el HTML cacheado y al día siguiente el campo
   * rechazaría hoy. Con `useState(() => ...)` se evalúa una sola vez por
   * montaje, que en la práctica es una vez por visita.
   *
   * `toLocaleDateString('en-CA')` da el formato ISO que pide un
   * `<input type="date">` (AAAA-MM-DD) usando la ZONA HORARIA DEL NAVEGADOR.
   * Con `toISOString()` --que es UTC-- una pareja escribiendo desde España a
   * las once de la noche vería el `min` puesto ya en el día siguiente y no
   * podría elegir mañana.
   */
  const [hoy] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reducedMotion = useReducedMotion();
  const stepRefs = useRef<Array<HTMLFieldSetElement | null>>([]);
  // Campo concreto al que hay que ir cuando el paso cambie por una
  // validación fallida (ver handleSubmit). Sin esto el efecto de abajo
  // enfoca siempre el PRIMER campo del paso, que no tiene por qué ser el
  // que está mal: el paso 3 tiene dos.
  const pendingFocusRef = useRef<string | null>(null);
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
      const pending = pendingFocusRef.current;
      pendingFocusRef.current = null;
      const target =
        (pending ? el.querySelector<HTMLElement>(`[name="${pending}"]`) : null) ??
        el.querySelector<HTMLElement>('input, select, textarea');
      target?.focus({ preventScroll: true });
      // On a phone the soft keyboard takes the bottom half of the screen:
      // centre the step so the field AND its "Siguiente" button stay above it.
      if (window.matchMedia('(max-width: 959px)').matches) {
        el.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: motion.duration.fast, ease: motion.ease.enter });
    });
    return () => ctx.revert();
  }, [step, reducedMotion]);

  // Persistent, readable errors. `reportValidity()` alone draws the
  // browser's own bubble, which vanishes the moment the field loses focus:
  // a visitor who tabbed away was left on a step that would not advance
  // with nothing on screen saying why. The native message is still the
  // source of the wording (it is already localised and phrased for the
  // constraint), it is just kept on the page and wired to the input with
  // aria-describedby so a screen reader reads it too.
/**
 * Los mensajes de error, escritos por nosotros.
 *
 * `field.validationMessage` es el texto del NAVEGADOR: en Chrome en español
 * dice "Rellena este campo" y "Incluye un signo @ en la dirección de correo
 * electrónico". Tutea, es genérico y aparece justo debajo de preguntas
 * escritas en vosotros ("¿Cómo os llamáis?"), en el único formulario de la
 * web y en el momento en que la pareja está a punto de abandonarlo. Cada
 * mensaje dice además POR QUÉ hace falta el dato, que es lo que evita que
 * alguien se levante sin enviarlo. El del navegador se queda de reserva para
 * cualquier campo que no esté en esta tabla.
 */
const MENSAJES_ERROR: Record<string, string> = {
  nombre: 'Poned vuestros nombres, para saber con quién hablamos.',
  email: 'Necesitamos un correo válido: es por donde os contestamos.',
  telefono: 'Ese teléfono no parece completo. Repasadlo, o dejadlo en blanco.',
  fecha: 'Decidnos la fecha, aunque sea la que estáis barajando.',
  lugar: 'Escribid el sitio y, si todavía no lo tenéis, la zona.',
  tipoEvento: 'Elegid una opción para saber qué necesitáis.',
  mensaje: 'Contadnos algo de vuestra boda, aunque sean dos líneas.',
  consentimiento: 'Necesitamos vuestro permiso para guardar estos datos y poder contestaros.',
};

function mensajeDeError(field: { name: string; validationMessage: string }): string {
  return MENSAJES_ERROR[field.name] ?? field.validationMessage;
}

  function currentStepFields() {
    const el = stepRefs.current[step];
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));
  }

  function goNext() {
    for (const field of currentStepFields()) {
      if (!field.checkValidity()) {
        setErrors((prev) => ({ ...prev, [field.name]: mensajeDeError(field) }));
        field.focus();
        return;
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  /** Clears a field's error as soon as it becomes valid again. */
  function clearError(name: string, valid: boolean) {
    if (!valid) return;
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
  }

  /**
   * `hasHint`: hay un `<p class="fieldHint">` debajo de este campo.
   *
   * La pista se pintaba en un párrafo suelto sin `id`, y `aria-describedby`
   * solo apuntaba al error -- y solo cuando había error. Quien usa lector de
   * pantalla oía «Fecha, obligatorio» y nada más, justo en el campo donde la
   * pista dice que vale una fecha aproximada. Ahora la descripción es la
   * pista SIEMPRE, y el error se le suma cuando aparece: ese orden es el que
   * hace que se lea primero qué se espera y después qué ha fallado.
   */
  function fieldProps(name: string, hasHint = false) {
    const message = errors[name];
    const described = [hasHint ? `${name}-hint` : null, message ? `${name}-error` : null]
      .filter(Boolean)
      .join(' ');
    return {
      'aria-invalid': message ? (true as const) : undefined,
      'aria-describedby': described || undefined,
      onInput: (e: FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        clearError(name, e.currentTarget.checkValidity()),
    };
  }

  // Lleva el foco al panel de respuesta en cuanto sustituye al formulario.
  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // Enter advances to the next step instead of doing nothing (single-line
  // inputs/select) -- except inside the message textarea, where Enter must
  // stay a newline; that step is submitted via its own button only.
  function handleStepKeyDown(e: KeyboardEvent<HTMLFieldSetElement>) {
    if (e.key !== 'Enter') return;
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    // El `preventDefault()` iba fuera del `if` y el `goNext()` dentro, así que
    // en el último paso -- el desplegable de «cómo nos conocisteis» -- Intro
    // cancelaba el envío implícito del navegador y no hacía nada a cambio: la
    // tecla quedaba muerta justo en el paso que envía el formulario. Ahora
    // solo se cancela cuando hay un paso siguiente al que ir; en el último,
    // Intro envía como en cualquier formulario.
    if (step >= TOTAL_STEPS - 1) return;
    e.preventDefault();
    goNext();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      const next: Record<string, string> = {};
      let first: HTMLInputElement | null = null;
      for (const field of Array.from(form.elements) as HTMLInputElement[]) {
        if (field.name && field.willValidate && !field.checkValidity()) {
          next[field.name] = mensajeDeError(field);
          first = first ?? field;
        }
      }
      setErrors(next);
      // Saltar AL PASO donde está el error, no solo enfocarlo. Los seis
      // fieldsets siguen montados y solo se ocultan con `hidden`, así que
      // focus() sobre un campo de un paso oculto no hace absolutamente
      // nada: el botón "Consultar disponibilidad" parecía no responder y
      // el mensaje de error se pintaba en una pantalla que no se veía
      // (WCAG 3.3.1). Pasa en cuanto se vuelve Atrás y se borra un campo
      // ya rellenado, que es exactamente lo que hace quien se corrige.
      if (first) {
        const stepIndex = stepRefs.current.findIndex((el) => el?.contains(first));
        if (stepIndex >= 0 && stepIndex !== step) {
          pendingFocusRef.current = first.getAttribute('name');
          setStep(stepIndex);
        } else {
          first.focus();
        }
      }
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
      let body: { delivered?: boolean; error?: string } = {};
      try {
        body = (await res.json()) as typeof body;
      } catch {
        /* no JSON body */
      }
      if (!res.ok) {
        setError(body.error || `No hemos podido enviar vuestro mensaje. Escribidnos directamente a ${site.email}`);
        return;
      }
      // Leer `delivered`, no solo `res.ok`. app/api/contacto/route.ts devuelve
      // 200 con delivered:false cuando no hay RESEND_API_KEY: el mensaje queda
      // guardado en /admin/mensajes pero NADIE recibe aviso. Mirando solo
      // res.ok, el formulario le decía a la pareja "tu mensaje ya está en
      // nuestro correo" y el estudio no se enteraba. Reproducido en el
      // navegador: {status: 200, ok: true, delivered: false}.
      setDelivered(body.delivered === true);
      setSubmitted(true);
    } catch {
      setError(`No hemos podido enviar vuestro mensaje. Escribidnos directamente a ${site.email}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      /**
       * `tabIndex={-1}` + foco (ver el efecto de abajo), y NO solo
       * `role="status"`. Una región en vivo se monta a la vez que su
       * contenido: los lectores de pantalla anuncian los CAMBIOS dentro de
       * una región que ya existía, así que insertar región y texto en la
       * misma mutación no se anuncia de forma fiable en NVDA ni en VoiceOver.
       * Y aquí además desaparece el formulario entero, así que el foco caía
       * al <body> y el cursor virtual volvía al principio de la página: la
       * pareja no oía nada y encima perdía el sitio. Llevando el foco al
       * titular del panel, el resultado se lee siempre y el recorrido
       * continúa donde estaba.
       */
      <div role="status" tabIndex={-1} ref={successRef} className={styles.success}>
        {delivered ? (
          <>
            <p className={styles.successTitle}>Mensaje enviado. Ya lo tenemos.</p>
            <p>
              Os contestamos personalmente con nuestra disponibilidad para vuestra fecha. Si en un par de días no
              veis respuesta, mirad en la carpeta de spam: os escribimos desde{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </>
        ) : (
          <>
            <p className={styles.successTitle}>
              Hemos guardado vuestro mensaje, pero no hemos podido hacérselo llegar al equipo.
            </p>
            <p>
              Para que no se quede en el aire, escribidnos vosotros directamente a{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a> o por WhatsApp al{' '}
              <a href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                {site.phoneDisplay}
              </a>
              , con la fecha y el sitio de la boda. Perdonad el rodeo.
            </p>
          </>
        )}
        <div className={styles.successLinks}>
          <Link href="/trabajos" className={styles.successLink}>
            Ver trabajos
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.successLink}>
            {site.instagramHandle}
            <span className="arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    );
  }

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
      <p className={styles.stepCounter} aria-hidden="true">
        {String(step + 1).padStart(2, '0')} / {String(TOTAL_STEPS).padStart(2, '0')}
      </p>
      {/* El cambio de paso sí se ve (el contador de arriba) pero no se oía.
          El aria-label del progressbar no sirve: cambiar un atributo no
          dispara ningún anuncio, y el contador va aria-hidden porque
          "01 / 06" leído en alto no es una frase. Mover el foco al campo
          nuevo hace que se lea la pregunta y la etiqueta, pero no en qué
          punto de seis está la pareja -- que es lo que decide si se sigue
          o se abandona a mitad. Esta región lo dice, y solo eso (WCAG
          4.1.3). No se anuncia al cargar: aria-live únicamente notifica
          los cambios posteriores al primer renderizado. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Paso {step + 1} de {TOTAL_STEPS}
      </p>

      <fieldset
        ref={(el) => { stepRefs.current[0] = el; }}
        hidden={step !== 0}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Cómo os llamáis?</legend>
        <label htmlFor="nombre" className={styles.fieldLabel}>Vuestros nombres</label>
        <input id="nombre" name="nombre" autoComplete="name" required {...fieldProps('nombre')} />
        <FieldError name="nombre" message={errors.nombre} />
      </fieldset>

      <fieldset
        ref={(el) => { stepRefs.current[1] = el; }}
        hidden={step !== 1}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿A qué correo os contestamos?</legend>
        <label htmlFor="email" className={styles.fieldLabel}>Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required {...fieldProps('email')} />
        <FieldError name="email" message={errors.email} />

        {/* EL TELÉFONO, Y OPCIONAL. Va con el correo porque es la misma
            pregunta --por dónde os localizamos-- y no merece un paso propio:
            este formulario ya tiene seis y cada uno más es gente que se cae.
            Opcional a propósito: obligarlo espanta a quien todavía está
            comparando estudios y sólo quiere saber si la fecha está libre. Y
            para quien lo deja, una llamada de cinco minutos resuelve lo que
            por correo son cuatro días de ida y vuelta.
            `pattern` deliberadamente ancho: dígitos, espacios, guiones,
            paréntesis y el prefijo internacional, entre 9 y 20 caracteres. No
            valida que el número exista --eso no lo valida nadie-- sino que lo
            escrito parezca un teléfono y no una frase. */}
        <label htmlFor="telefono" className={styles.fieldLabel}>
          Teléfono <span className={styles.opcional}>(opcional)</span>
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          pattern="[+()\d\s.-]{9,20}"
          {...fieldProps('telefono', true)}
        />
        <p id="telefono-hint" className={styles.fieldHint}>
          Si nos lo dejáis, os llamamos: para lo que se resuelve en cinco minutos, es más rápido.
        </p>
        <FieldError name="telefono" message={errors.telefono} />
      </fieldset>

      {/* Las dos preguntas que el estudio necesita para poder contestar, y
          por eso obligatorias. Las frases de ayuda son lo que permite exigirlas
          sin perder a quien todavía no tiene el sitio cerrado. */}
      <fieldset
        ref={(el) => { stepRefs.current[2] = el; }}
        hidden={step !== 2}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Cuándo y dónde es la boda?</legend>
        <label htmlFor="fecha" className={styles.fieldLabel}>Fecha</label>
        {/* `min` en el día de hoy: el campo aceptaba una boda en 2019. La
            fecha se calcula al montar (ver `hoy`), no en el servidor, porque
            un valor renderizado en el servidor se queda congelado en la
            página cacheada y al día siguiente rechazaría el día de hoy. */}
        <input id="fecha" name="fecha" type="date" min={hoy} required {...fieldProps('fecha', true)} />
        <p id="fecha-hint" className={styles.fieldHint}>Si todavía no está cerrada, poned la que estáis barajando.</p>
        <FieldError name="fecha" message={errors.fecha} />

        <label htmlFor="lugar" className={styles.fieldLabel}>Lugar o pueblo</label>
        <input
          id="lugar"
          name="lugar"
          placeholder="Ej. una hacienda en Sevilla"
          required
          {...fieldProps('lugar', true)}
        />
        <p id="lugar-hint" className={styles.fieldHint}>Si aún estáis viendo sitios, decidnos la zona.</p>
        <FieldError name="lugar" message={errors.lugar} />
      </fieldset>

      {/* Sustituye a "¿Qué vamos a celebrar?" (Boda / Evento corporativo /
          Otro), que aportaba poco en una web que solo habla de bodas. Esta es
          literalmente la primera variable de precio que declara content/faq.ts. */}
      <fieldset
        ref={(el) => { stepRefs.current[3] = el; }}
        hidden={step !== 3}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Qué queréis que cubramos?</legend>
        <label htmlFor="tipoEvento" className={styles.fieldLabel}>Cobertura</label>
        <select id="tipoEvento" name="tipoEvento" required defaultValue="" {...fieldProps('tipoEvento')}>
          <option value="" disabled>Elegid una opción</option>
          <option value="foto">Solo fotografía</option>
          <option value="video">Solo vídeo</option>
          <option value="foto-y-video">Fotografía y vídeo</option>
          <option value="por-decidir">Todavía no lo tenemos decidido</option>
        </select>
        <FieldError name="tipoEvento" message={errors.tipoEvento} />
      </fieldset>

      <fieldset
        ref={(el) => { stepRefs.current[4] = el; }}
        hidden={step !== 4}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Qué es lo más importante para vosotros ese día?</legend>
        <label htmlFor="mensaje" className={styles.fieldLabel}>Contádnoslo con vuestras palabras</label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          placeholder="Ej. fotos naturales, sin posados forzados; que no se note que estáis…"
          {...fieldProps('mensaje')}
        />
        <FieldError name="mensaje" message={errors.mensaje} />
      </fieldset>

      {/* Último y opcional: es dato de atribución para el estudio, no algo
          que le sirva a la pareja. Antes bloqueaba en el paso 3 de 8. */}
      <fieldset
        ref={(el) => { stepRefs.current[5] = el; }}
        hidden={step !== 5}
        className={styles.step}
        onKeyDown={handleStepKeyDown}
      >
        <legend className={styles.question}>¿Cómo nos habéis encontrado?</legend>
        <label htmlFor="comoNosConociste" className={styles.fieldLabel}>
          Nos ayuda a saber dónde nos encuentran
        </label>
        <select id="comoNosConociste" name="comoNosConociste" defaultValue="">
          <option value="">Prefiero no decirlo</option>
          <option value="instagram">Instagram</option>
          <option value="google">Google</option>
          <option value="bodas-net">Bodas.net</option>
          <option value="recomendacion">Recomendación de otra pareja</option>
          <option value="feria">Feria de bodas</option>
          <option value="otro">Otro</option>
        </select>

        {/* EL CONSENTIMIENTO, EN EL ÚLTIMO PASO Y JUNTO AL BOTÓN DE ENVIAR.
            Ahí y no en el primero por una razón legal antes que de diseño: lo
            que se consiente es el envío, así que la casilla tiene que estar a
            la vista en el momento de enviar y no seis pantallas atrás, donde
            nadie recuerda haberla marcado.

            SIN MARCAR POR DEFECTO, y eso no es negociable: el RGPD dice que
            el consentimiento es una acción afirmativa clara, y una casilla ya
            puesta no es una acción de nadie.

            `value="si"` explícito: una casilla sin `value` viaja como "on",
            que es lo que el navegador inventa y no lo que este formulario
            declara. El servidor compara contra "si" (ver lib/contact-store).

            El texto sale de content/consentimiento.ts, el MISMO del que el
            servidor guarda copia al recibir el mensaje: si se escribiera aquí
            a mano, lo que la pareja lee y lo que queda registrado podrían
            separarse sin que nadie se enterara, y entonces el registro no
            probaría nada. */}
        <div className={styles.consentimiento}>
          <input
            id="consentimiento"
            name="consentimiento"
            type="checkbox"
            value="si"
            required
            className={styles.consentimientoCasilla}
            {...fieldProps('consentimiento')}
          />
          <label htmlFor="consentimiento" className={styles.consentimientoTexto}>
            {CONSENTIMIENTO_TEXTO}{' '}
            <a href="/privacidad" target="_blank" rel="noopener noreferrer">
              Leer la política de privacidad
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            .
          </label>
        </div>
        <FieldError name="consentimiento" message={errors.consentimiento} />
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
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Consultar disponibilidad'}
          </button>
        )}
      </div>
    </form>
  );
}
