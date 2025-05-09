import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Typography
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../../api';

export default function PromptTemplateForm({ open, onClose, template, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'component_generation',
    content: '',
    tags: '',
    parameters: '[]'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      // For editing, we don't allow changing the name
      setFormData({
        name: template.name || '',
        description: template.description || '',
        category: template.category || 'component_generation',
        content: template.content || '',
        tags: Array.isArray(template.tags) ? template.tags.join(', ') : '',
        parameters: JSON.stringify(
          Array.isArray(template.parameters) 
            ? template.parameters.map(p => ({
                name: p.name || '',
                description: p.description || '',
                required: p.required || false,
                type: p.type || 'string',
                defaultValue: p.defaultValue || ''
              }))
            : [],
          null,
          2
        )
      });
    } else {
      // For new template
      setFormData({
        name: '',
        description: '',
        category: 'component_generation',
        content: '',
        tags: '',
        parameters: '[]'
      });
    }
  }, [template]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Parse parameters from JSON string
      let parsedParameters = [];
      try {
        const paramsObj = JSON.parse(formData.parameters);
        // Convert object to array if needed
        if (typeof paramsObj === 'object' && !Array.isArray(paramsObj)) {
          parsedParameters = Object.entries(paramsObj).map(([name, details]) => ({
            name,
            ...details
          }));
        } else {
          parsedParameters = paramsObj;
        }
      } catch (err) {
        throw new Error('Invalid parameters JSON format');
      }

      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        parameters: parsedParameters
      };

      let response;
      if (template?._id) {
        // Update existing template (creates new version)
        response = await axios.put(`${API_URL}/prompts/templates/${template._id}`, payload);
        onSuccess(response.data.template);
      } else {
        // Create new template
        response = await axios.post(`${API_URL}/prompts/templates`, payload);
        onSuccess(response.data.template);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Template' : 'New Template'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!!template} // Disable name field when editing
              fullWidth
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="blueprint">Blueprint</MenuItem>
                <MenuItem value="component_generation">Component Generation</MenuItem>
                <MenuItem value="tech_support">Tech Support</MenuItem>
                <MenuItem value="code_analysis">Code Analysis</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="content"
              label="Content"
              value={formData.content}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={6}
            />

            <TextField
              name="tags"
              label="Tags (comma-separated)"
              value={formData.tags}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              name="parameters"
              label="Parameters"
              value={formData.parameters}
              onChange={handleChange}
              fullWidth
              multiline
              rows={6}
              helperText="Enter parameters as JSON array or object. Example: [{'name': 'param1', 'description': 'Parameter 1', 'required': true, 'type': 'string'}]"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : template ? 'Save New Version' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 