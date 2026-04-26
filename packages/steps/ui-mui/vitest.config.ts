import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: process.env.CI ? 10000 : 5000,
    hookTimeout: process.env.CI ? 10000 : 5000,
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/index.ts', '**/*.stories.*'],
      thresholds: {
        lines: 79,
        functions: 80,
        branches: 65,
        statements: 79,
      },
    },
  },
});
