import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from './mocks/handlers';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a3a5c' },
    secondary: { main: '#ff8f00' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
    mutations: { retry: false },
  },
});

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '600px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '900px', height: '800px' } },
        wide: { name: 'Wide', styles: { width: '1200px', height: '900px' } },
        ultrawide: { name: 'Ultrawide', styles: { width: '1536px', height: '960px' } },
      },
    },
    msw: {
      handlers,
    },
    options: {
      storySort: {
        order: [
          'Workflows',
          [
            'WF1 Build Demo',
            'WF2 Present Flow',
            'WF3 Author Story',
            'WF4 Run Training',
            'WF5 Manage Steps',
            'Standalone',
          ],
          'Pages',
          [
            'WF1 Build Demo',
            'WF2 Present Flow',
            'WF3 Author Story',
            'WF4 Run Training',
            'WF5 Manage Steps',
          ],
          'Domains',
          [
            'Steps',
            'Flows',
            'Compositions',
            'Execution',
          ],
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </ThemeProvider>
    ),
  ],
  loaders: [mswLoader],
};

export default preview;
