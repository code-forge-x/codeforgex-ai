import React from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import ComponentList from '../components/ComponentList';

export default function ComponentsDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3 },
        bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f6fa',
        boxSizing: 'border-box', 
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, sm: 3 }
      }}
    >
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#fff',
          borderRadius: 2,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 2px 12px rgba(0,0,0,0.2)'
            : '0 2px 12px rgba(0,0,0,0.08)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            color: theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            mb: { xs: 2, sm: 3 }
          }}
        >
          Components Management
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? '#b0b0b0' : '#7f8c8d',
            mb: { xs: 3, sm: 4 },
            maxWidth: '800px',
            lineHeight: 1.6,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          Manage and organize your reusable components. Create, edit, and maintain components that can be used across different prompt templates.
        </Typography>
      </Paper>
      <ComponentList />
    </Box>
  );
} 