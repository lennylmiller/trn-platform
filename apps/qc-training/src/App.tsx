import { useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Tabs, Tab, Box, IconButton,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LandingPage from './pages/LandingPage';
import DevPage from './pages/DevPage';
import RunPage from './pages/RunPage';
import CompositionEditorPage from './pages/CompositionEditorPage';
import CompositionRunPage from './pages/CompositionRunPage';
import StepWorkbenchPage from './pages/StepWorkbenchPage';

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

const TAB_PATHS = ['/', '/flows', '/compositions', '/workbench'] as const;

function pathToTabIndex(pathname: string): number {
  if (pathname.startsWith('/workbench')) return 3;
  if (pathname.startsWith('/flows')) return 1;
  if (pathname.startsWith('/compositions')) return 2;
  return 0;
}

function Shell({ onToggleTheme, mode }: { onToggleTheme: () => void; mode: 'light' | 'dark' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = pathToTabIndex(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 4, cursor: 'pointer' }} onClick={() => navigate('/')}>
            QC Training
          </Typography>
          <Tabs
            value={tab}
            onChange={(_, v) => navigate(TAB_PATHS[v]!)}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ '& .MuiTab-root': { minHeight: 64, fontWeight: 600 } }}
          >
            <Tab label="Steps" />
            <Tab label="Flows" />
            <Tab label="Compositions" />
            <Tab label="Workbench" />
          </Tabs>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={onToggleTheme}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <TabPanel value={tab} index={0}>
        <LandingPage tab="steps" />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <LandingPage tab="flows" />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <LandingPage tab="compositions" />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <StepWorkbenchPage />
      </TabPanel>
    </Box>
  );
}

function buildTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#1a3a5c' },
      secondary: { main: '#ff8f00' },
      ...(mode === 'light'
        ? { background: { default: '#f5f7fa', paper: '#ffffff' } }
        : {}),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: { borderRadius: 8 },
  });
}

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const toggleTheme = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/flows/dev/:flowId" element={<DevPage />} />
            <Route path="/flows/run/:flowId" element={<RunPage />} />
            <Route path="/compositions/edit/:compositionId" element={<CompositionEditorPage />} />
            <Route path="/compositions/run/:compositionId" element={<CompositionRunPage />} />
            <Route path="/workbench/:stepId" element={<StepWorkbenchPage />} />
            <Route path="*" element={<Shell onToggleTheme={toggleTheme} mode={mode} />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
