"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Borrado definitivo de un mensaje de contacto desde /admin/mensajes.
 * Es la mitad visible del derecho de supresión (RGPD art. 17): la otra mitad
 * es /api/admin/mensajes/[id].
 *
 * La confirmación no es decoración: lo que se borra son datos que la pareja no
 * puede volver a enviar y el estudio no puede recuperar, y el botón vive
 * pegado a cada mensaje de una lista larga donde un clic de más es fácil.
 */
export function DeleteMessageButton({
  id,
  nombre,
  className,
}: {
  id: string;
  nombre: string;
  className?: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm(`¿Borrar definitivamente el mensaje de ${nombre}? No se puede deshacer.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/mensajes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setError('No se ha podido borrar. Inténtalo de nuevo.');
        setDeleting(false);
        return;
      }
      // refresh() vuelve a pedir la página al servidor, que relee el
      // directorio: así la lista refleja el disco y no un estado local que
      // podría mentir si el borrado hubiera fallado a medias.
      router.refresh();
    } catch {
      setError('No se ha podido borrar. Inténtalo de nuevo.');
      setDeleting(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={handleDelete} disabled={deleting}>
        {deleting ? 'Borrando…' : 'Borrar'}
      </button>
      {error && <span role="alert">{error}</span>}
    </>
  );
}
