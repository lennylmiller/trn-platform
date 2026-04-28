import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Tabs, Tab, Box,
} from '@mui/material';
import StepsPage from './pages/StepsPage';
import FlowsPage from './pages/FlowsPage';
import CompositionsPage from './pages/CompositionsPage';
import RunPage from './pages/RunPage';
import FlowDevView from './pages/FlowDevView';
import FlowRunView from './pages/FlowRunView';
import CompositionEditView from './pages/CompositionEditView';
import CompositionRunView from './pages/CompositionRunView';

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

const TAB_PATHS = ['/', '/flows', '/compositions', '/run'] as const;

function pathToTabIndex(pathname: string): number {
  if (pathname.startsWith('/flows')) return 1;
  if (pathname.startsWith('/compositions')) return 2;
  if (pathname.startsWith('/run')) return 3;
  return 0;
}

function Shell() {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = pathToTabIndex(location.pathname);

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    navigate(TAB_PATHS[value]!);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 4 }}>
            TRN Platform
          </Typography>
          <Tabs
            value={tab}
            onChange={handleTabChange}
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
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/flows/dev/:flowId" element={<FlowDevView />} />
            <Route path="/flows/run/:flowId" element={<FlowRunView />} />
            <Route path="/compositions/edit/:compositionId" element={<CompositionEditView />} />
            <Route path="/compositions/run/:compositionId" element={<CompositionRunView />} />
            <Route path="*" element={<Shell />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
