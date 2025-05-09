import React from 'react';
import { Box, Typography } from '@mui/material';
import PromptTemplateList from './PromptTemplateList';

export default function PromptManagementDashboard() {
  return (
    <Box sx={{ p: 3, bgcolor: '#fff', boxSizing: 'border-box', height: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Prompt Management
      </Typography>
      <PromptTemplateList />
    </Box>
  );
} 