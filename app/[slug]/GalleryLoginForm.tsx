'use client';
import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { site } from '@/content/site';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import styles from './GalleryLoginForm.module.css';

/**
 * The gate every private gallery URL renders behind until the client's
 * own session cookie is set (app/[slug]/page.tsx decides server-side
 * whether this or GalleryClient renders -- this component never sees
 * gallery content, so there's nothing for a failed login to leak).
 * Deliberately NOT the full site Header: a client here doesn't need
 * Trabajos/Servicios/Contacto nav, just enough branding to trust this is
 * really the studio's own page, matching how the reference photo-delivery
 * platforms (Pixieset, ShootProof) present a client login screen.
 */
export function GalleryLoginForm({ slug }: { slug: string }) {
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
      const res = await fetch(`/api/galeria/${slug}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'No hemos podido entrar. Probad otra vez o escribidnos.');
        return;
      }
      router.refresh();
    } catch {
      setError('No hemos podido conectar. Comprobad la conexión y probad otra vez.');
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
        <p className={styles.eyebrow}>Galería privada</p>
        {/* Es la galería de SU boda, no una "sesión de fotos", y el sitio
            entero habla a la pareja en vosotros: esta pantalla y la de
            dentro eran las dos únicas que tuteaban. */}
        <h1 className={styles.heading}>Vuestras fotos de boda</h1>
        <p className={styles.hint}>
          Entrad con el usuario y la contraseña que os dimos con la entrega para ver, marcar y comentar vuestras
          fotos.
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

        <p className={styles.footnote}>
          ¿Habéis perdido los datos de acceso? Escribidnos a{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </div>
  );
}
