import { defineConfig } from 'vitest/config';

/**
 * TRN Platform — shared Vitest base configuration
 *
 * All packages extend this via mergeConfig in their own vitest.config.ts.
 * Layer-specific configs override coverage thresholds and environment.
 */
export default defineConfig({
  test: {
    globals: true,
    testTimeout: process.env.CI ? 10000 : 5000,
    hookTimeout: process.env.CI ? 10000 : 5000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.ts',
        'src/index.ts',
        '**/*.stories.tsx',
        '**/*.stories.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
