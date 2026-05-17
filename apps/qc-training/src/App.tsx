import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, IconButton,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CoursePlayerPage from './pages/CoursePlayerPage';
import CourseEditorPage from './pages/CourseEditorPage';
import CoursesPage from './pages/CoursesPage';
import NewCoursePage from './pages/NewCoursePage';
import { installFeedbackActionTracking } from './capture';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Shell({ onToggleTheme, mode }: { onToggleTheme: () => void; mode: 'light' | 'dark' }) {
  const navigate = useNavigate();

  return (
    <Box data-feedback-capture-root sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 4, cursor: 'pointer' }} onClick={() => navigate('/')}>
            QC Training
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={onToggleTheme}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <CoursesPage />
      </Box>
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

  useEffect(() => {
    installFeedbackActionTracking();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/courses/play/:courseId" element={<CoursePlayerPage />} />
            <Route path="/courses/edit/:courseId" element={<CourseEditorPage />} />
            <Route path="/courses/new" element={<NewCoursePage />} />
            <Route path="*" element={<Shell onToggleTheme={toggleTheme} mode={mode} />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
