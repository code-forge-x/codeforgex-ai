import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, IconButton, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import PromptComponentForm from './PromptComponentForm';
import API_URL from '../../../api';

export default function PromptComponentList({ templateId }) {
  const [search, setSearch] = useState('');
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState(null);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/prompts/components/${templateId}`);
        setComponents(response.data.components || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch components');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchComponents();
    }
  }, [templateId]);

  const handleOpen = (component = null) => {
    setSelectedComponent(component);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedComponent(null);
  };

  const handleDeleteClick = (component) => {
    setComponentToDelete(component);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (window.confirm('Are you sure you want to delete this component?')) {
      try {
        await axios.delete(`${API_URL}/api/prompts/components/${componentToDelete._id}`);
        setComponents(components.filter(c => c._id !== componentToDelete._id));
        setDeleteDialogOpen(false);
        setComponentToDelete(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete component');
      }
    }
  };

  const filtered = components.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Components
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Component
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search components"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
      </Box>
      {components.length === 0 ? (
        <Alert severity="info">No components available for this template.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((component) => (
                <TableRow key={component._id}>
                  <TableCell>{component.name}</TableCell>
                  <TableCell>{component.type}</TableCell>
                  <TableCell>{component.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={component.status}
                      color={component.status === 'active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpen(component)}><EditIcon /></IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteClick(component)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PromptComponentForm open={open} onClose={handleClose} component={selectedComponent} />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Component</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{componentToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 