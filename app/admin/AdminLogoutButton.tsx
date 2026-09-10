'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Shared by every /admin page (dashboard, new-gallery form, per-gallery
 * view) -- one definition of "how admin logout works" instead of each
 * page re-implementing the fetch+redirect. */
export function AdminLogoutButton({ className }: { className?: string }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }

  return (
    <button type="button" className={className} onClick={handleLogout} disabled={loggingOut}>
      {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
    </button>
  );
}
