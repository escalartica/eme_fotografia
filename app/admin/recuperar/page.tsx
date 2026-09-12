import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/require-session';
import { destinoDeRecuperacion } from '@/lib/mail';
import { RecuperarForm } from './RecuperarForm';

export const metadata = {
  title: 'Recuperar la contraseña',
  robots: { index: false, follow: false },
};
// El buzón se lee del entorno del servidor en cada visita.
export const dynamic = 'force-dynamic';

export default async function RecuperarPage() {
  // Con la sesión abierta esta pantalla no tiene sentido.
  if (await getAdminSession()) redirect('/admin');
  return <RecuperarForm buzon={destinoDeRecuperacion()[0] ?? 'el buzón del estudio'} />;
}
