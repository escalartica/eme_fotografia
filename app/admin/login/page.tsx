import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/require-session';
import { AdminLoginForm } from '../AdminLoginForm';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already authenticated -- no reason to show the login card again.
  const session = await getAdminSession();
  if (session) redirect('/admin');

  return <AdminLoginForm />;
}
