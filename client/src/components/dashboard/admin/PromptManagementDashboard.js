import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import PromptTemplateList from './PromptTemplateList';
import PromptComponentList from './PromptComponentList';
import PromptPerformanceView from './PromptPerformanceView';
import PromptVersionLog from './PromptVersionLog';

const tabLabels = [
  'Prompt Templates',
  'Components',
  'Performance',
  'Version Logs'
];

export default function PromptManagementDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3, bgcolor: '#fff', boxSizing: 'border-box', height: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Prompt Management
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        {tabLabels.map((label, idx) => (
          <Tab label={label} key={label} />
        ))}
      </Tabs>
      <Box sx={{ mt: 3, width: '100%' }}>
        {tab === 0 && <PromptTemplateList />}
        {tab === 1 && <PromptComponentList />}
        {tab === 2 && <PromptPerformanceView />}
        {tab === 3 && <PromptVersionLog />}
      </Box>
    </Box>
  );
} 