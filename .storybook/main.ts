import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../packages/*/ui-mui/src/**/*.stories.@(ts|tsx)',
    './workflows/**/*.stories.@(ts|tsx)',
    './workflows/**/*.mdx',
    './pages/**/*.stories.@(ts|tsx)',
    './pages/**/*.mdx',
  ],
  staticDirs: ['./public'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
    'msw-storybook-addon',
  ],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@trn-platform/shared': path.resolve(__dirname, '../packages/shared/src'),
      '@trn-platform/steps-data-access': path.resolve(__dirname, '../packages/steps/data-access/src'),
      '@trn-platform/steps-feature': path.resolve(__dirname, '../packages/steps/feature/src'),
      '@trn-platform/steps-ui-mui': path.resolve(__dirname, '../packages/steps/ui-mui/src'),
      '@trn-platform/flows-data-access': path.resolve(__dirname, '../packages/flows/data-access/src'),
      '@trn-platform/flows-feature': path.resolve(__dirname, '../packages/flows/feature/src'),
      '@trn-platform/flows-ui-mui': path.resolve(__dirname, '../packages/flows/ui-mui/src'),
      '@trn-platform/compositions-data-access': path.resolve(__dirname, '../packages/compositions/data-access/src'),
      '@trn-platform/compositions-feature': path.resolve(__dirname, '../packages/compositions/feature/src'),
      '@trn-platform/compositions-ui-mui': path.resolve(__dirname, '../packages/compositions/ui-mui/src'),
      '@trn-platform/execution-data-access': path.resolve(__dirname, '../packages/execution/data-access/src'),
      '@trn-platform/execution-feature': path.resolve(__dirname, '../packages/execution/feature/src'),
      '@trn-platform/execution-ui-mui': path.resolve(__dirname, '../packages/execution/ui-mui/src'),
    };
    return config;
  },
};
export default config;
