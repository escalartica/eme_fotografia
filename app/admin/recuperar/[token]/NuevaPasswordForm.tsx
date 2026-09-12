'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/components/ui/BrandMark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { site } from '@/content/site';
import styles from '../../AdminLoginForm.module.css';

const MIN = 12;

/**
 * ELEGIR LA CONTRASEÑA NUEVA.
 *
 * Dos decisiones que parecen menores y no lo son:
 *
 * - SE ESCRIBE UNA SOLA VEZ, con un interruptor para verla. Pedirla dos veces
 *   es la costumbre, pero lo que de verdad evita la errata es poder leer lo
 *   que se ha escrito; repetir a ciegas solo dobla la posibilidad de
 *   equivocarse dos veces igual, y en un teclado de móvil es un suplicio.
 * - EL AVISO DE LONGITUD SALE MIENTRAS SE ESCRIBE, no al enviar. Descubrir
 *   que faltaban caracteres después de pulsar el botón es la forma más segura
 *   de perder lo tecleado.
 */
export function NuevaPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [verla, setVerla] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const router = useRouter();

  const corta = password.length > 0 && password.length < MIN;

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch('/api/admin/recuperar/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const datos = await res.json().catch(() => null);
      if (!res.ok) {
        setError(datos?.error ?? 'No se ha podido cambiar la contraseña.');
        return;
      }
      setListo(true);
      // Un respiro para leer el mensaje antes de que cambie la pantalla.
      setTimeout(() => router.push('/admin/login'), 2200);
    } catch {
      setError('No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setEnviando(false);
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

        {listo ? (
          <>
            <h1 className={styles.heading}>Contraseña cambiada</h1>
            <p className={styles.hint}>
              Ya puedes entrar con la nueva. Se han cerrado todas las sesiones que hubiera abiertas, aquí y en
              cualquier otro dispositivo.
            </p>
            <p className={styles.footnote}>
              <Link href="/admin/login">Ir al acceso</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.heading}>Elige una contraseña</h1>
            <p className={styles.hint}>
              Mínimo {MIN} caracteres. Una frase que recuerdes vale más que algo corto y retorcido:
              «lasfotosdelaboda2026» es mejor contraseña que «Xk7$q».
            </p>

            <form className={styles.form} onSubmit={guardar} noValidate>
              <div className={styles.field}>
                <label htmlFor="nueva" className={styles.label}>
                  Contraseña nueva
                </label>
                <input
                  id="nueva"
                  name="nueva"
                  type={verla ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoFocus
                  required
                  minLength={MIN}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby="ayuda-longitud"
                  aria-invalid={corta ? 'true' : undefined}
                />
                <p id="ayuda-longitud" className={styles.label} aria-live="polite">
                  {password.length === 0
                    ? `Al menos ${MIN} caracteres`
                    : corta
                      ? `Te faltan ${MIN - password.length}`
                      : 'Longitud correcta'}
                </p>
                <label className={styles.label}>
                  <input type="checkbox" checked={verla} onChange={(e) => setVerla(e.target.checked)} /> Ver lo
                  que escribo
                </label>
              </div>

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className={styles.submit} disabled={enviando || password.length < MIN}>
                {enviando ? 'Guardando…' : 'Guardar y entrar'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
