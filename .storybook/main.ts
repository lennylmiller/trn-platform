// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from '@storybook/react-vite';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

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
      '@trn-platform/courses-data-access': path.resolve(__dirname, '../packages/courses/data-access/src'),
      '@trn-platform/courses-feature': path.resolve(__dirname, '../packages/courses/feature/src'),
      '@trn-platform/courses-ui-mui': path.resolve(__dirname, '../packages/courses/ui-mui/src'),
      '@trn-platform/chat-data-access': path.resolve(__dirname, '../packages/chat/data-access/src'),
      '@trn-platform/chat-feature': path.resolve(__dirname, '../packages/chat/feature/src'),
      '@trn-platform/chat-ui-mui': path.resolve(__dirname, '../packages/chat/ui-mui/src'),
    };
    return config;
  },
};
export default config;
