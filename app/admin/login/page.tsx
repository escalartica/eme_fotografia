import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/require-session';
import { AdminLoginForm } from '../AdminLoginForm';

// El título de la pestaña. Sin él, estas pantallas heredaban el de la portada
// --«Fotógrafo y vídeo de bodas en Sevilla»-- y el estudio, que trabaja con
// varias pestañas abiertas a la vez, no distinguía el panel de la web pública.
// `/admin/mensajes` y `/admin/estadisticas` sí lo tenían; estas cuatro no.
export const metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already authenticated -- no reason to show the login card again.
  const session = await getAdminSession();
  if (session) redirect('/admin');

  return <AdminLoginForm />;
}
