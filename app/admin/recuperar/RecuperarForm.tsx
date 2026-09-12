'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/ui/BrandMark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { site } from '@/content/site';
import styles from '../AdminLoginForm.module.css';

/**
 * PEDIR EL ENLACE. Una pantalla con un solo botón y ningún campo.
 *
 * No hay dónde escribir un correo porque el destino lo decide el servidor:
 * siempre el buzón del estudio. Eso, además de ser lo seguro, es lo que hace
 * que esta pantalla no dé ninguna oportunidad de equivocarse -- que es lo que
 * uno necesita justo en el momento en que ya está nervioso porque no puede
 * entrar.
 */
export function RecuperarForm({ buzon }: { buzon: string }) {
  const [estado, setEstado] = useState<'inicio' | 'enviando' | 'enviado'>('inicio');
  const [error, setError] = useState<string | null>(null);

  async function pedir(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEstado('enviando');
    try {
      const res = await fetch('/api/admin/recuperar', { method: 'POST' });
      const datos = await res.json().catch(() => null);
      if (!res.ok) {
        setError(datos?.error ?? 'No se ha podido enviar el enlace.');
        setEstado('inicio');
        return;
      }
      setEstado('enviado');
    } catch {
      setError('No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.');
      setEstado('inicio');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>
      <div className={styles.card}>
        <Link href="/" className={styles.brand} aria-label={`${site.brandName} - inicio`}>
          <BrandMark alto={2.6} priority />
        </Link>
        <p className={styles.eyebrow}>Panel privado</p>

        {estado === 'enviado' ? (
          <>
            <h1 className={styles.heading}>Mira tu correo</h1>
            <p className={styles.hint}>
              Te hemos enviado un enlace a <strong>{buzon}</strong>. Ábrelo y elige una contraseña nueva.
              Caduca en media hora y sirve una sola vez.
            </p>
            <p className={styles.hint}>
              Si no lo ves en unos minutos, mira en la carpeta de spam.
            </p>
            <p className={styles.footnote}>
              <Link href="/admin/login">Volver al acceso</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.heading}>¿Has olvidado la contraseña?</h1>
            <p className={styles.hint}>
              No pasa nada. Pulsa el botón y te enviamos un enlace a <strong>{buzon}</strong> para que elijas
              una nueva. No hace falta que recuerdes la anterior.
            </p>
            <form className={styles.form} onSubmit={pedir}>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className={styles.submit} disabled={estado === 'enviando'}>
                {estado === 'enviando' ? 'Enviando…' : 'Enviarme el enlace'}
              </button>
            </form>
            <p className={styles.footnote}>
              <Link href="/admin/login">Me acuerdo, volver al acceso</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
