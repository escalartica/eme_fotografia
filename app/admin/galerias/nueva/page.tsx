import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/require-session';
import { NewGalleryForm } from './NewGalleryForm';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function NewGalleryPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return <NewGalleryForm />;
}
