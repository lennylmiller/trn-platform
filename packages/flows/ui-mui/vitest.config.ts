import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 79, functions: 80, branches: 65, statements: 79 },
      exclude: ['**/index.ts', '**/*.test.*', '**/*.stories.*', '**/dist/**'],
    },
  },
});
