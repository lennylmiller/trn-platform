import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AppBar, Toolbar, Typography, Tabs, Tab, Box,
} from '@mui/material';
import StepsPage from './pages/StepsPage';
import FlowsPage from './pages/FlowsPage';
import CompositionsPage from './pages/CompositionsPage';
import RunPage from './pages/RunPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a3a5c' },   // Deep blue
    secondary: { main: '#ff8f00' },  // Amber accent
    background: { default: '#f5f7fa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ flex: 1, overflow: 'auto' }}>
    {value === index && children}
  </Box>
);

export default function App() {
  const [tab, setTab] = React.useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <AppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ fontWeight: 700, mr: 4 }}>
                TRN Platform
              </Typography>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="inherit"
                indicatorColor="secondary"
                sx={{ '& .MuiTab-root': { minHeight: 64, fontWeight: 600 } }}
              >
                <Tab label="Steps" />
                <Tab label="Flows" />
                <Tab label="Compositions" />
                <Tab label="Run" />
              </Tabs>
            </Toolbar>
          </AppBar>

          <TabPanel value={tab} index={0}>
            <StepsPage />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <FlowsPage />
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <CompositionsPage />
          </TabPanel>
          <TabPanel value={tab} index={3}>
            <RunPage />
          </TabPanel>
        </Box>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
