'use client';
import { createContext } from 'react';
import type Lenis from 'lenis';

const LenisContext = createContext<Lenis | null>(null);

export default LenisContext;
