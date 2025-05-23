import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../../api';

export default function PromptPerformance({ templateId }) {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/prompts/performance/${templateId}`);
        setPerformance(response.data.performance || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch performance data');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchPerformance();
    }
  }, [templateId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Performance Metrics
      </Typography>
      
      {performance.length === 0 ? (
        <Alert severity="info">No performance data available for this template.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Response Time (ms)</TableCell>
                <TableCell>Token Usage</TableCell>
                <TableCell>Success Rate</TableCell>
                <TableCell>User Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performance.map((metric) => (
                <TableRow key={metric._id}>
                  <TableCell>
                    {new Date(metric.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{metric.responseTime}</TableCell>
                  <TableCell>{metric.tokenUsage}</TableCell>
                  <TableCell>{metric.successRate}%</TableCell>
                  <TableCell>{metric.userRating || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
} 