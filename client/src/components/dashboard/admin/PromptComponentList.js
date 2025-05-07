import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, IconButton, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import PromptComponentForm from './PromptComponentForm';
import API_URL from '../../../api';

export default function PromptComponentList() {
  const [search, setSearch] = useState('');
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState(null);

  const fetchComponents = async () => {
    try {
      const response = await axios.get(`${API_URL}/prompts/components`);
      setComponents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch components');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

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
    try {
      await axios.delete(`${API_URL}/prompts/components/${componentToDelete.id}`);
      await fetchComponents();
      setDeleteDialogOpen(false);
      setComponentToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete component');
    }
  };

  const filtered = components.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search components"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          New Prompt Component
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(component => (
              <TableRow key={component.id}>
                <TableCell>{component.name}</TableCell>
                <TableCell>{component.description}</TableCell>
                <TableCell>
                  <Chip
                    label={component.status}
                    color={component.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{component.updatedAt}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(component)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(component)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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