import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch, Box, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../../api';

export default function PromptTemplateForm({ open, onClose, template = null }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    content: template?.content || '',
    parameters: template?.parameters ? JSON.stringify(template.parameters, null, 2) : '',
    components: template?.components ? JSON.stringify(template.components, null, 2) : '',
    status: template?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? (checked ? 'active' : 'inactive') : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        parameters: JSON.parse(formData.parameters || '{}'),
        components: JSON.parse(formData.components || '[]')
      };
      if (template) {
        await axios.put(`${API_URL}/prompts/templates/${template.id}`, payload);
      } else {
        await axios.post(`${API_URL}/prompts/templates`, payload);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{template ? 'Edit Prompt Template' : 'New Prompt Template'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />
          <TextField
            label="Parameters (JSON)"
            name="parameters"
            value={formData.parameters}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
          />
          <TextField
            label="Components (JSON)"
            name="components"
            value={formData.components}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.status === 'active'}
                onChange={handleChange}
                name="status"
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 