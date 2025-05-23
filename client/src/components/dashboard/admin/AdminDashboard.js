import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

// Mock analytics data
const componentUsageData = [
  { name: 'OrderManager', usage: 20 },
  { name: 'RiskManager', usage: 15 },
  { name: 'MovingAverage', usage: 10 },
  { name: 'GridSystem', usage: 8 },
];
const feedbackPieData = [
  { name: 'Positive', value: 30 },
  { name: 'Neutral', value: 10 },
  { name: 'Negative', value: 5 },
];
const COLORS = ['#4caf50', '#ff9800', '#f44336'];

const AdminDashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Logo and Branding */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <img src="/path/to/logo.png" alt="CodeForegX Logo" style={{ height: 60 }} />
      </Box>
      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Component Usage</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={componentUsageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="usage" fill="#1976d2" name="Usage" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Feedback Distribution</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={feedbackPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  label
                >
                  {feedbackPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, minHeight: 300 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Admin Analytics & Controls (Coming Soon)
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This dashboard will display system analytics, user/project management, and admin controls.
            </Typography>
            {/* Downloadable Window Editor Placeholder */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button variant="contained" color="primary" startIcon={<DownloadIcon />}>
                Download Window Editor
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;