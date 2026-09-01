'use client';
import type { MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { withPageTransition } from '@/components/motion/PageTransition';

export function NextProjectLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    withPageTransition(() => router.push(href));
  }

  return (
    <Link href={href} onClick={handleClick} className={className} data-cursor="explorar">
      {label}
    </Link>
  );
}
