import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Divider, Paper, Button, useTheme,
} from '@mui/material';

const ColorSwatch = ({ label, color }: { label: string; color: string }) => (
  <Stack alignItems="center" spacing={0.5}>
    <Box sx={{ width: 64, height: 64, bgcolor: color, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} />
    <Typography variant="caption" fontWeight={600}>{label}</Typography>
    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 10 }}>{color}</Typography>
  </Stack>
);

const BrandingPage = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>TRN Platform</Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>Theme & Branding Showcase</Typography>
      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" gutterBottom>Color Palette</Typography>
      <Stack direction="row" spacing={3} sx={{ mb: 4, flexWrap: 'wrap' }}>
        <ColorSwatch label="Primary" color={theme.palette.primary.main} />
        <ColorSwatch label="Primary Light" color={theme.palette.primary.light} />
        <ColorSwatch label="Primary Dark" color={theme.palette.primary.dark} />
        <ColorSwatch label="Secondary" color={theme.palette.secondary.main} />
        <ColorSwatch label="Success" color={theme.palette.success.main} />
        <ColorSwatch label="Warning" color={theme.palette.warning.main} />
        <ColorSwatch label="Error" color={theme.palette.error.main} />
        <ColorSwatch label="Info" color={theme.palette.info.main} />
        <ColorSwatch label="Background" color={theme.palette.background.default} />
        <ColorSwatch label="Paper" color={theme.palette.background.paper} />
      </Stack>

      <Typography variant="h6" gutterBottom>Typography</Typography>
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h3" gutterBottom>h3 Heading</Typography>
        <Typography variant="h4" gutterBottom>h4 Heading</Typography>
        <Typography variant="h5" gutterBottom>h5 Heading</Typography>
        <Typography variant="h6" gutterBottom>h6 Heading</Typography>
        <Typography variant="subtitle1" gutterBottom>Subtitle 1 text</Typography>
        <Typography variant="subtitle2" gutterBottom>Subtitle 2 text</Typography>
        <Typography variant="body1" gutterBottom>Body 1 — The training platform enables interactive, step-by-step demos and compositions.</Typography>
        <Typography variant="body2" gutterBottom>Body 2 — Smaller body text used for secondary descriptions and notes.</Typography>
        <Typography variant="caption" display="block">Caption text for metadata and timestamps</Typography>
      </Paper>

      <Typography variant="h6" gutterBottom>Components</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
        <Button variant="contained" color="secondary">Secondary</Button>
        <Button variant="contained" color="error">Error</Button>
        <Button variant="contained" color="success">Success</Button>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Chip label="Default" />
        <Chip label="Primary" color="primary" />
        <Chip label="Secondary" color="secondary" />
        <Chip label="Success" color="success" />
        <Chip label="Warning" color="warning" />
        <Chip label="Error" color="error" />
        <Chip label="Info" color="info" />
        <Chip label="Outlined" variant="outlined" />
      </Stack>

      <Typography variant="h6" gutterBottom>Step Type Colors</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip label="SQL" sx={{ bgcolor: '#ff9800', color: '#fff', fontWeight: 700 }} />
        <Chip label="Shell" sx={{ bgcolor: '#2196f3', color: '#fff', fontWeight: 700 }} />
        <Chip label="Manual" sx={{ bgcolor: '#9c27b0', color: '#fff', fontWeight: 700 }} />
      </Stack>

      <Typography variant="h6" gutterBottom>Cards</Typography>
      <Stack direction="row" spacing={2}>
        <Card variant="outlined" sx={{ width: 240 }}>
          <CardContent>
            <Typography variant="subtitle2">Outlined Card</Typography>
            <Typography variant="body2" color="text.secondary">Standard card for list items and content blocks.</Typography>
          </CardContent>
        </Card>
        <Card variant="elevation" elevation={3} sx={{ width: 240 }}>
          <CardContent>
            <Typography variant="subtitle2">Elevated Card</Typography>
            <Typography variant="body2" color="text.secondary">Elevated card for focused or highlighted content.</Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Standalone/Branding Page',
  component: BrandingPage,
  tags: ['standalone'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
