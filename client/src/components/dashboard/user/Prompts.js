import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import API_URL from '../../../api';

export default function Prompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${API_URL}/prompts/templates`);
      setPrompts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (prompt = null) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        title: prompt.title,
        content: prompt.content,
        category: prompt.category
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        title: '',
        content: '',
        category: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPrompt(null);
    setFormData({
      title: '',
      content: '',
      category: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPrompt) {
        await axios.put(`${API_URL}/prompts/templates/${editingPrompt.id}`, formData);
      } else {
        await axios.post(`${API_URL}/prompts/templates`, formData);
      }
      fetchPrompts();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prompt');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await axios.delete(`${API_URL}/prompts/templates/${id}`);
        fetchPrompts();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete prompt');
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Prompts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Prompt
        </Button>
      </Box>

      <Paper>
        <List>
          {prompts.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No prompts found"
                secondary="Create your first prompt to get started"
              />
            </ListItem>
          ) : (
            prompts.map((prompt) => (
              <ListItem key={prompt.id}>
                <ListItemText
                  primary={prompt.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {prompt.category}
                      </Typography>
                      {' — '}
                      {prompt.content.substring(0, 100)}
                      {prompt.content.length > 100 ? '...' : ''}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleOpenDialog(prompt)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(prompt.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                multiline
                rows={6}
                required
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingPrompt ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 