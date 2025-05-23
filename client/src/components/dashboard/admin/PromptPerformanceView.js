import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../../api';

const phases = ['requirements', 'blueprint', 'code', 'testing', 'deployment'];

export default function PromptPerformanceView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('all');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/prompts/performance${selectedPhase !== 'all' ? `?phase=${selectedPhase}` : ''}`);
        setMetrics(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [selectedPhase]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!metrics) return <Typography>No metrics available.</Typography>;

  const renderMetricCard = (title, value, unit = '', color = 'primary') => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" color={color}>
          {value}{unit}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderQualityMetrics = (phase) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Quality Metrics
      </Typography>
      <Grid container spacing={2}>
        {phase === 'requirements' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Clarity Score</Typography>
              <LinearProgress
                variant="determinate"
                value={(metrics.quality?.clarity || 0) * 20}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.quality?.clarity?.toFixed(1) || 'N/A'} / 5
              </Typography>
            </Paper>
          </Grid>
        )}
        {phase === 'blueprint' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Accuracy Score</Typography>
              <LinearProgress
                variant="determinate"
                value={(metrics.quality?.accuracy || 0) * 20}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.quality?.accuracy?.toFixed(1) || 'N/A'} / 5
              </Typography>
            </Paper>
          </Grid>
        )}
        {phase === 'code' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Code Quality</Typography>
              <LinearProgress
                variant="determinate"
                value={(metrics.quality?.codeQuality || 0) * 20}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.quality?.codeQuality?.toFixed(1) || 'N/A'} / 5
              </Typography>
            </Paper>
          </Grid>
        )}
        {phase === 'testing' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Test Coverage</Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.quality?.testCoverage || 0}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.quality?.testCoverage?.toFixed(1) || 'N/A'}%
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Performance Metrics
      </Typography>

      <Tabs
        value={selectedPhase}
        onChange={(e, newValue) => setSelectedPhase(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="All Phases" value="all" />
        {phases.map(phase => (
          <Tab key={phase} label={phase.charAt(0).toUpperCase() + phase.slice(1)} value={phase} />
        ))}
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          {renderMetricCard('Success Rate', `${metrics.successRate?.toFixed(1) || 0}%`, '', metrics.successRate >= 95 ? 'success.main' : 'error.main')}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard('Avg Response Time', metrics.avgLatency?.toFixed(0) || 0, 'ms', metrics.avgLatency < 2000 ? 'success.main' : 'warning.main')}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard('Token Usage', metrics.avgTokens?.toFixed(0) || 0, ' tokens')}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard('User Satisfaction', metrics.userSatisfaction?.toFixed(1) || 0, '/5', metrics.userSatisfaction >= 4 ? 'success.main' : 'warning.main')}
        </Grid>
      </Grid>

      {selectedPhase !== 'all' && renderQualityMetrics(selectedPhase)}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Performance
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Phase</TableCell>
                <TableCell>Success</TableCell>
                <TableCell>Response Time</TableCell>
                <TableCell>Tokens</TableCell>
                <TableCell>User Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.recentPerformance?.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    {new Date(record.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{record.phase}</TableCell>
                  <TableCell>
                    <Typography color={record.success ? 'success.main' : 'error.main'}>
                      {record.success ? '✓' : '✗'}
                    </Typography>
                  </TableCell>
                  <TableCell>{record.latency?.total?.toFixed(0)}ms</TableCell>
                  <TableCell>{record.tokenUsage?.total}</TableCell>
                  <TableCell>{record.userFeedback?.rating || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
} 