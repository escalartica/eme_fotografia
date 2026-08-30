import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // No tests exist yet at this scaffolding stage (later tasks add them).
    // Without this, `vitest run` exits 1 on zero matched test files.
    passWithNoTests: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
