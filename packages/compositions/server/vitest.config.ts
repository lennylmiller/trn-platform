import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 100, functions: 75, branches: 100, statements: 100 },
      exclude: ['**/index.ts', '**/*.test.ts', '**/dist/**'],
    },
  },
});
