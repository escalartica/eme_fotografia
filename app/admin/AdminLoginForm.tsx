'use client';
import { useCallback, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from 'react';
import { BrandMark } from '@/components/ui/BrandMark';
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
 *
 * LO QUE SE LE AÑADIÓ, Y POR QUÉ CADA COSA. Esta pantalla la usa una sola
 * persona, casi siempre con prisa y a menudo desde el móvil, y cada fricción
 * aquí es trabajo que no empieza:
 *
 * - EL USUARIO SE RECUERDA. Es siempre el mismo y no es un secreto --el
 *   secreto es la contraseña--, así que volver a teclearlo cada vez es un
 *   peaje sin contrapartida. Se guarda en el propio navegador; nunca sale de
 *   él ni se manda a ninguna parte.
 * - SE PUEDE VER LA CONTRASEÑA. En un teclado de móvil, escribir una
 *   contraseña larga a ciegas y fallar es el motivo número uno de "no me deja
 *   entrar". El interruptor no baja la seguridad de nada: quien está delante
 *   de la pantalla ya la está escribiendo.
 * - AVISA DEL BLOQUEO DE MAYÚSCULAS. Es la causa clásica de una contraseña
 *   correcta que el servidor rechaza, y el navegador sabe decirlo.
 * - HAY SALIDA SI NO SE ACUERDA. Antes no la había: olvidar la contraseña
 *   significaba quedarse fuera del propio trabajo hasta que alguien entrara
 *   por SSH a regenerar un hash a mano. El enlace de recuperación va a su
 *   correo (ver lib/admin-recovery.ts).
 * - Y CUANDO SALTA EL LÍMITE DE INTENTOS, se le ofrece esa salida en el mismo
 *   aviso, que es justo el momento en que hace falta.
 */
const CLAVE_USUARIO_RECORDADO = 'eme-admin-usuario';

/**
 * El usuario de la última vez, leído del navegador.
 *
 * `useSyncExternalStore` y no un `useState` dentro de un efecto: el
 * almacenamiento del navegador es estado que ya existe antes de que React
 * monte, leerlo en un efecto significa pintar primero la respuesta
 * equivocada y corregirla después --y el `react-hooks/set-state-in-effect`
 * de este proyecto lo rechaza--. En el servidor no hay navegador al que
 * preguntar: cadena vacía.
 *
 * El `catch` no sobra: en una ventana privada o con los datos del sitio
 * bloqueados, `localStorage` no devuelve null sino que LANZA, y una pantalla
 * de acceso que revienta por no poder recordar un nombre de usuario es
 * exactamente la avería que nadie sabría explicar.
 */
function useUsuarioRecordado(): string {
  const suscribir = useCallback((avisar: () => void) => {
    window.addEventListener('storage', avisar);
    return () => window.removeEventListener('storage', avisar);
  }, []);
  const leer = useCallback(() => {
    try {
      return localStorage.getItem(CLAVE_USUARIO_RECORDADO) ?? '';
    } catch {
      return '';
    }
  }, []);
  return useSyncExternalStore(suscribir, leer, () => '');
}

export function AdminLoginForm() {
  const recordado = useUsuarioRecordado();
  // `null` significa "no lo ha tocado todavía", que no es lo mismo que
  // "lo ha borrado": si fuera una cadena vacía, borrar el campo lo
  // repondría solo al valor recordado en el siguiente renderizado.
  const [editado, setEditado] = useState<string | null>(null);
  const username = editado ?? recordado;
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [mayusculas, setMayusculas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function vigilarMayusculas(e: KeyboardEvent<HTMLInputElement>) {
    setMayusculas(e.getModifierState?.('CapsLock') ?? false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBloqueado(false);
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
        setBloqueado(res.status === 429);
        // La contraseña se vacía tras un fallo; el usuario no. Volver a
        // teclear las dos cosas cuando solo una estaba mal es el clásico
        // castigo inútil de los formularios de acceso.
        setPassword('');
        passwordRef.current?.focus();
        return;
      }
      try {
        localStorage.setItem(CLAVE_USUARIO_RECORDADO, username);
      } catch {
        /* sin almacenamiento: no se recuerda, y ya está */
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
          <BrandMark alto={2.6} priority />
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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              autoFocus
              required
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              value={username}
              onChange={(e) => setEditado(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <div className={styles.passwordRow}>
              <input
                id="password"
                name="password"
                ref={passwordRef}
                type={verPassword ? 'text' : 'password'}
                autoComplete="current-password"
                enterKeyHint="go"
                required
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'login-error' : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={vigilarMayusculas}
                onKeyDown={vigilarMayusculas}
              />
              <button
                type="button"
                className={styles.verPassword}
                onClick={() => setVerPassword((v) => !v)}
                aria-pressed={verPassword}
              >
                {verPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
            {mayusculas && (
              <p className={styles.aviso} role="status">
                El bloqueo de mayúsculas está activado.
              </p>
            )}
          </div>

          {error && (
            <p id="login-error" className={styles.error} role="alert">
              {error}
              {bloqueado && (
                <>
                  {' '}
                  <Link href="/admin/recuperar">Recupérala por correo</Link> y entras sin esperar.
                </>
              )}
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className={styles.footnote}>
          <Link href="/admin/recuperar">¿Has olvidado la contraseña?</Link>
        </p>
      </div>
    </div>
  );
}
