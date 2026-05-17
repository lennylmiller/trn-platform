import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@trn-platform/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@trn-platform/courses-data-access': path.resolve(__dirname, '../../packages/courses/data-access/src'),
      '@trn-platform/courses-feature': path.resolve(__dirname, '../../packages/courses/feature/src'),
      '@trn-platform/courses-ui-mui': path.resolve(__dirname, '../../packages/courses/ui-mui/src'),
      '@trn-platform/chat-data-access': path.resolve(__dirname, '../../packages/chat/data-access/src'),
      '@trn-platform/chat-feature': path.resolve(__dirname, '../../packages/chat/feature/src'),
      '@trn-platform/chat-ui-mui': path.resolve(__dirname, '../../packages/chat/ui-mui/src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
