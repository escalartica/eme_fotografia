'use client';
import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import styles from './AdminLoginForm.module.css';

/**
 * The gate in front of every /admin route. Mirrors
 * app/[slug]/GalleryLoginForm.tsx almost exactly (same card layout, same
 * generic-error/rate-limit handling) so the two auth surfaces feel like
 * one coherent system rather than two unrelated login screens -- but
 * this one always lives at its own URL (/admin/login) rather than being
 * swapped in server-side for a page, since /admin has several distinct
 * routes behind it (dashboard, new-gallery, per-gallery view) that all
 * redirect here the same way.
 */
export function AdminLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'No se pudo iniciar sesión.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>
      <div className={styles.card}>
        <Link href="/" className={styles.brand} aria-label={`${site.brandName} - inicio`}>
          <Image src="/images/logo/eme-logo.png" alt={site.brandName} width={120} height={56} priority />
        </Link>
        <p className={styles.eyebrow}>Panel privado</p>
        <h1 className={styles.heading}>Acceso de administración</h1>
        <p className={styles.hint}>
          Inicia sesión para gestionar las galerías privadas de tus clientes.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Usuario</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p id="login-error" className={styles.error} role="alert">{error}</p>
          )}
          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
