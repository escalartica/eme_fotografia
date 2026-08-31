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
    // .agents/ and .claude/ hold third-party agent-skill packages (installed
    // via the `skills` CLI) that ship their own test files — not part of
    // this app. Vitest's defaults don't exclude them, so without this they
    // get swept into every `npm test` run.
    exclude: ['**/node_modules/**', '**/.git/**', '.agents/**', '.claude/**'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
