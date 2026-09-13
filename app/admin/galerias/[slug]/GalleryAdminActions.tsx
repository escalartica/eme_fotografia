'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MIN_PASSWORD_LENGTH, generarPassword, motivoPasswordDebil } from '@/lib/gallery-credentials';
import styles from './GalleryAdminActions.module.css';

/**
 * Las dos cosas que el panel no permitía hacer sobre una galería ya creada:
 * cambiarle la contraseña y borrarla.
 *
 * POR QUÉ HACÍAN FALTA. La contraseña sólo se enseñaba una vez, al crear la
 * galería, y no había forma de volver a fijarla: si el estudio no la apuntó y
 * la pareja la perdía, esa boda quedaba inaccesible para siempre. Y no había
 * borrado de ningún tipo, así que una boda entregada se quedaba en el disco
 * indefinidamente --fotos, nombre del cliente y hash de su contraseña-- sin
 * manera de atender una petición de supresión del RGPD que no fuera entrar
 * por SSH.
 *
 * EL BORRADO PIDE ESCRIBIR EL SLUG, no un `confirm()`. Un `confirm()` vale
 * para un mensaje de contacto, que es una ficha; aquí se van cientos de
 * fotografías de la boda de alguien y no hay copia. Escribir el nombre obliga
 * a mirar QUÉ se está borrando, que es justo el error que un botón de
 * confirmar no evita.
 */
export function GalleryAdminActions({ slug, clientName }: { slug: string; clientName: string }) {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [confirmSlug, setConfirmSlug] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function cambiarPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    const floja = motivoPasswordDebil(password);
    if (floja) {
      setPasswordError(floja);
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/admin/galerias/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        sesionesCerradas?: number;
        revocacionParcial?: boolean;
      };
      if (!res.ok) {
        setPasswordError(data.error ?? 'No se ha podido cambiar la contraseña.');
        return;
      }
      // EL CAMPO NO SE VACÍA, y es deliberado: la versión anterior decía
      // «apúntala ahora» justo después de borrarlo, así que el estudio leía
      // el aviso con el campo ya en blanco. Eso reproduce exactamente el
      // fallo que esta pantalla viene a resolver -- contraseña perdida,
      // galería inaccesible. Se queda escrita para poder copiarla.
      const cerradas = data.sesionesCerradas ?? 0;
      const cierre =
        cerradas > 0
          ? ` Se ${cerradas === 1 ? 'ha cerrado la sesión que estaba abierta' : `han cerrado las ${cerradas} sesiones que estaban abiertas`}: tendrán que entrar con la nueva.`
          : '';
      // `revocacionParcial`: la contraseña sí se cambió, pero alguna sesión
      // vieja sigue viva. Se dice, porque es justo lo que el estudio necesita
      // saber si la estaba cambiando por una filtración.
      setPasswordMessage(
        data.revocacionParcial
          ? `Contraseña cambiada, pero NO se han podido cerrar las sesiones que ya estaban abiertas con la anterior. Avisa antes de fiarte del cambio. Cópiala ahora: no se guarda en claro y no se puede consultar.`
          : `Contraseña cambiada.${cierre} Cópiala ahora: no se guarda en claro y no se puede consultar.`
      );
    } catch {
      setPasswordError('No se ha podido cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setSavingPassword(false);
    }
  }

  async function borrar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteError(null);
    // El botón ya no está `disabled`, así que el doble envío se frena aquí.
    if (deleting) return;
    if (confirmSlug.trim() !== slug) {
      setDeleteError(`Escribe exactamente "${slug}" para confirmar.`);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/galerias/${slug}`, { method: 'DELETE' });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        revocacionParcial?: boolean;
      };
      if (!res.ok) {
        // Se lee el cuerpo, igual que en el cambio de contraseña: un 404 y un
        // 500 no son el mismo problema y "inténtalo de nuevo" es un mal
        // consejo para el segundo.
        setDeleteError(data.error ?? 'No se ha podido borrar. Inténtalo de nuevo.');
        setDeleting(false);
        return;
      }
      // BORRADA, PERO CON SESIONES VIVAS. No se navega: irse a la lista se
      // llevaría por delante el único aviso de que alguien puede seguir
      // teniendo sesión abierta sobre una boda que se acaba de borrar, y eso
      // es justo lo que el estudio necesita saber. La ficha que queda debajo
      // ya no existe en el disco; el enlace de «Volver al panel» sigue ahí.
      if (data.revocacionParcial) {
        setDeleteError(
          data.error ??
            'La galería se ha borrado, pero no se han podido cerrar todas las sesiones abiertas.'
        );
        setDeleting(false);
        return;
      }
      // A la lista, no a esta página: la galería que esta página describe ya
      // no existe y volver a pedirla daría un 404.
      router.push('/admin');
      router.refresh();
    } catch {
      setDeleteError('No se ha podido borrar. Inténtalo de nuevo.');
      setDeleting(false);
    }
  }

  return (
    <div className={styles.acciones}>
      <section className={styles.bloque} aria-labelledby="cambiar-password">
        <h2 id="cambiar-password" className={styles.titulo}>Cambiar la contraseña</h2>
        <p className={styles.nota}>
          Si tu cliente la ha perdido, ponle una nueva aquí y pásasela. Al cambiarla se cierra la
          sesión que tuviera abierta.
        </p>
        <form onSubmit={cambiarPassword} className={styles.form}>
          <label htmlFor="nueva-password" className={styles.etiqueta}>Nueva contraseña</label>
          <input
            id="nueva-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? 'password-error' : undefined}
            className={styles.campo}
            placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          />
          {/* `type="text"` y no `password`: esto no es alguien entrando en su
              cuenta, es el estudio escribiendo una clave que tiene que LEER
              para copiársela al cliente. Ocultarla aquí sólo provoca erratas
              que nadie descubre hasta que la pareja no puede entrar. */}
          <div className={styles.acciones}>
            {/* El mismo botón que al crear la galería. Sin él, «pulsa
                Generar» -- que es lo que dice el aviso cuando la contraseña
                es floja -- mandaba a un botón que aquí no existía. */}
            <button type="button" className={styles.botonSecundario} onClick={() => setPassword(generarPassword())}>
              Generar
            </button>
            <button type="submit" className={styles.boton} disabled={savingPassword}>
              {savingPassword ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
        {/* Las dos regiones vivas van SIEMPRE montadas, aunque estén vacías.
            Un lector de pantalla anuncia los cambios DENTRO de una región que
            ya existía: insertar región y texto en la misma mutación no se
            anuncia de forma fiable ni en NVDA ni en VoiceOver. Es la misma
            corrección que ya lleva el panel de éxito del formulario de
            contacto. */}
        <p className={styles.exito} role="status">{passwordMessage}</p>
        <p id="password-error" className={styles.error} role="alert">{passwordError}</p>
      </section>

      <section className={`${styles.bloque} ${styles.peligro}`} aria-labelledby="borrar-galeria">
        <h2 id="borrar-galeria" className={styles.titulo}>Borrar esta galería</h2>
        <p className={styles.nota}>
          Se borran las fotos de {clientName}, su selección y sus claves. No se puede deshacer y no
          hay copia. Escribe <code className={styles.codigo}>{slug}</code> para confirmar.
        </p>
        <form onSubmit={borrar} className={styles.form}>
          <label htmlFor="confirmar-slug" className={styles.etiqueta}>
            Nombre de la galería
          </label>
          <input
            id="confirmar-slug"
            type="text"
            value={confirmSlug}
            onChange={(e) => setConfirmSlug(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-invalid={deleteError ? true : undefined}
            aria-describedby={deleteError ? 'borrar-error' : undefined}
            className={styles.campo}
            placeholder={slug}
          />
          {/* `aria-disabled` y NO `disabled`. Un botón deshabilitado de verdad
              no recibe foco, así que quien navega con teclado o con lector de
              pantalla se lo salta y no se entera de que existe ni de qué le
              falta para poder usarlo. Habilitado, el foco llega, se pulsa, y
              el mensaje de abajo explica qué falta -- que es además lo que
              hace que esa rama del código sirva para algo. */}
          <button
            type="submit"
            className={`${styles.boton} ${styles.botonPeligro}`}
            aria-disabled={deleting || confirmSlug.trim() !== slug}
            data-inactivo={confirmSlug.trim() !== slug ? 'true' : undefined}
          >
            {deleting ? 'Borrando…' : 'Borrar definitivamente'}
          </button>
        </form>
        <p id="borrar-error" className={styles.error} role="alert">{deleteError}</p>
      </section>
    </div>
  );
}
