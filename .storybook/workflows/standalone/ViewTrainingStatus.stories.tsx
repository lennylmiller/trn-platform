import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Grid,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { mockTrainingStatus } from '../../mocks/mockData';

const statCards = [
  { label: 'Members', icon: <PeopleIcon />, data: mockTrainingStatus.members, color: '#1a3a5c' },
  { label: 'PCPs', icon: <LocalHospitalIcon />, data: mockTrainingStatus.pcp, color: '#2e7d32' },
  { label: 'Claims', icon: <ReceiptIcon />, data: mockTrainingStatus.claim, color: '#e65100' },
  { label: 'Referrals', icon: <LocalHospitalIcon />, data: mockTrainingStatus.referral, color: '#6a1b9a' },
];

const ViewTrainingStatus = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" gutterBottom>Training Status Dashboard</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Overview of the current training environment. Shows data counts across key entities.
    </Typography>

    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
      <CheckCircleIcon color="success" />
      <Typography variant="subtitle2" color="success.main">Training database exists and is accessible</Typography>
    </Stack>

    <Grid container spacing={2} sx={{ mb: 3 }}>
      {statCards.map((card) => (
        <Grid key={card.label} xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Typography variant="subtitle2">{card.label}</Typography>
              </Stack>
              {card.data.map((row, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                  <Typography variant="caption" color="text.secondary">
                    {Object.entries(row).filter(([k]) => k !== 'count').map(([, v]) => v).join(', ')}
                  </Typography>
                  <Chip label={row.count} size="small" sx={{ bgcolor: card.color, color: '#fff', fontWeight: 700, fontSize: 11 }} />
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    <Typography variant="subtitle2" color="text.secondary" gutterBottom>QCAP Plans</Typography>
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockTrainingStatus.qcap.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.plan}</TableCell>
              <TableCell align="right">{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const meta: Meta = {
  title: 'Workflows/Standalone/View Training Status',
  component: ViewTrainingStatus,
  tags: ['standalone', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
