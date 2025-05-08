import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch, Box, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../../api';

export default function PromptComponentForm({ open, onClose, component = null }) {
  const [formData, setFormData] = useState({
    name: component?.name || '',
    description: component?.description || '',
    content: component?.content || '',
    status: component?.status || 'active'
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
      if (component) {
        await axios.put(`${API_URL}/prompts/components/${component.id}`, formData);
      } else {
        await axios.post(`${API_URL}/prompts/components`, formData);
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
      <DialogTitle>{component ? 'Edit Prompt Component' : 'New Prompt Component'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            required
            helperText="Enter the reusable component content. Use {{parameter}} for dynamic values."
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