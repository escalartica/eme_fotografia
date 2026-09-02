'use client';
import { useContext } from 'react';
import LenisContext from '@/components/motion/LenisContext';

export function useLenis() {
  return useContext(LenisContext);
}

export default useLenis;
