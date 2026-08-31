'use client';
import { useState, FormEvent } from 'react';
import { site } from '@/content/site';
import styles from './ContactForm.module.css';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" required />

      <label htmlFor="email">Correo electrónico</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="tipoEvento">Tipo de evento</label>
      <select id="tipoEvento" name="tipoEvento" required defaultValue="">
        <option value="" disabled>Selecciona una opción</option>
        <option value="boda">Boda</option>
        <option value="evento">Evento corporativo</option>
        <option value="otro">Otro</option>
      </select>

      <label htmlFor="fecha">Fecha aproximada</label>
      <input id="fecha" name="fecha" type="date" />

      <label htmlFor="lugar">Lugar del evento</label>
      <input id="lugar" name="lugar" placeholder="Ej. Hacienda de San Rafael, Sevilla" />

      <label htmlFor="numeroInvitados">Número de invitados</label>
      <input id="numeroInvitados" name="numeroInvitados" type="number" min="0" placeholder="Ej. 80" />

      <label htmlFor="presupuesto">Presupuesto aproximado</label>
      <input id="presupuesto" name="presupuesto" placeholder="Ej. 1500-2500€" />

      <label htmlFor="mensaje">Mensaje</label>
      <textarea id="mensaje" name="mensaje" required />

      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>Enviar</button>
    </form>
  );
}
