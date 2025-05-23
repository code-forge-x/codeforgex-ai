import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import PromptTemplateList from './PromptTemplateList';

export default function PromptManagementDashboard() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, minHeight: 300 }}>
            <Typography variant="h4" gutterBottom>
              Prompt Management
            </Typography>
            <PromptTemplateList />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 