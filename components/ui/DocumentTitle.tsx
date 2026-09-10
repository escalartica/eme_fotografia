'use client';
import { useEffect } from 'react';

/**
 * Sets the tab title from inside a route that Next's metadata pipeline
 * does not cover (app/not-found.tsx and app/error.tsx: the framework
 * renders them with the root layout's default title). Restores the
 * previous title on unmount so client-side navigation away is clean.
 */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return null;
}
