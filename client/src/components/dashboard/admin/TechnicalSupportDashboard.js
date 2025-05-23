import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const TechnicalSupportDashboard = () => {
  const [projectId, setProjectId] = useState('');
  const [project, setProject] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setProject(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data.session);
    } catch (err) {
      setError('Project not found or access denied.');
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!note.trim() || !project) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/projects/${project.project_id}/update`,
        { context_data: { support_note: note }, log_message: 'Support note added' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject({ ...project, context_data: { ...project.context_data, support_note: note } });
      setNote('');
    } catch (err) {
      setError('Failed to add note.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Technical Support Dashboard</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Project ID"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </Box>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {project && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="subtitle1">Project ID: {project.project_id}</Typography>
          <Typography>Status: {project.status}</Typography>
          <Typography>Current Phase: {project.current_phase}</Typography>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>Context Data:</Typography>
          <pre style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 4, fontSize: 13 }}>
            {JSON.stringify(project.context_data, null, 2)}
          </pre>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>Activity Log:</Typography>
          <List dense>
            {project.activity_log.map((log, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={`${log.timestamp}: [${log.role}] ${log.user_id} - ${log.action}`}
                  secondary={log.message}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <TextField
              label="Add troubleshooting note"
              value={note}
              onChange={e => setNote(e.target.value)}
              size="small"
              fullWidth
            />
            <Button variant="outlined" onClick={handleAddNote} disabled={loading || !note.trim()}>
              Add Note
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default TechnicalSupportDashboard; 