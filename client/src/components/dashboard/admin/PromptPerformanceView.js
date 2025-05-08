import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';
import API_URL from '../../../api';

export default function PromptPerformanceView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Update this to the correct endpoint if implemented
        // const response = await axios.get(`${API_URL}/prompts/templates/1/performance`); // Placeholder ID
        // setMetrics(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!metrics) return <Typography>No metrics available.</Typography>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Performance Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Usage</Typography>
            <Typography variant="h4">{metrics.usage}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Success Rate</Typography>
            <Typography variant="h4">{metrics.successRate}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Latency</Typography>
            <Typography variant="h4">{metrics.latency} ms</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 