import Link from 'next/link';
import { tokenValido } from '@/lib/admin-recovery';
import { BrandMark } from '@/components/ui/BrandMark';
import { site } from '@/content/site';
import { NuevaPasswordForm } from './NuevaPasswordForm';
import styles from '../../AdminLoginForm.module.css';

export const metadata = {
  title: 'Nueva contraseña',
  robots: { index: false, follow: false },
};
// El enlace se comprueba contra el disco en cada visita, y su resultado NO se
// puede cachear: una respuesta guardada diría que un enlace ya gastado sigue
// valiendo.
export const dynamic = 'force-dynamic';

export default async function NuevaPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Se comprueba aquí, en el servidor, ANTES de pintar el formulario: enseñar
  // los campos y descubrir al enviarlos que el enlace había caducado es
  // hacerle escribir una contraseña para nada.
  if (!(await tokenValido(token))) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <Link href="/" className={styles.brand} aria-label={`${site.brandName} - inicio`}>
            <BrandMark alto={2.6} priority />
          </Link>
          <p className={styles.eyebrow}>Panel privado</p>
          <h1 className={styles.heading}>Este enlace ya no sirve</h1>
          <p className={styles.hint}>
            Los enlaces caducan a la media hora y valen una sola vez. Si todavía necesitas cambiar la
            contraseña, pide otro: tarda un segundo.
          </p>
          <p className={styles.footnote}>
            <Link href="/admin/recuperar">Pedir un enlace nuevo</Link>
          </p>
        </div>
      </div>
    );
  }

  return <NuevaPasswordForm token={token} />;
}
