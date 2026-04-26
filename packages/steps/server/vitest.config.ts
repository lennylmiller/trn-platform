import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: process.env.CI ? 10000 : 5000,
    hookTimeout: process.env.CI ? 10000 : 5000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts'],
      thresholds: {
        lines: 100,
        functions: 75,
        branches: 100,
        statements: 100,
      },
    },
  },
});
