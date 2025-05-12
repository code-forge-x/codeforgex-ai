import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Dialog as MuiDialog
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import API_URL from '../../../api';
import TemplateEditor from '../prompts/TemplateEditor';
import TemplateDetails from './TemplateDetails';

export default function PromptTemplateList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, template: null });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/prompts/templates?search=${search}`);
      setTemplates(response.data.templates || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleEdit = (template) => {
    const templateToEdit = template.activeVersion || template;
    if (!templateToEdit) {
      setError('Template data is invalid');
      return;
    }
    setEditingTemplate(templateToEdit);
    setShowEditor(true);
  };

  const handleDelete = (template) => {
    setDeleteDialog({ open: true, template });
  };

  const confirmDelete = async () => {
    const template = deleteDialog.template;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/prompts/templates/${template.activeVersion?._id || template._id}`);
      setDeleteDialog({ open: false, template: null });
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersions = (template) => {
    if (!template) {
      setError('Template data is invalid');
      return;
    }
    setSelectedTemplate({
      ...template,
      activeVersion: template.activeVersion || template
    });
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleEditorSuccess = () => {
    handleEditorClose();
    fetchTemplates();
  };

  const handleBack = () => {
    setSelectedTemplate(null);
  };

  if (selectedTemplate) {
    return (
      <TemplateDetails
        template={selectedTemplate.activeVersion || selectedTemplate}
        onBack={handleBack}
        onUpdate={fetchTemplates}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Prompt Templates</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowEditor(true)}
        >
          New Template
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search templates by name, description, or category..."
        value={search}
        onChange={handleSearch}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No templates found. {search && 'Try adjusting your search criteria.'}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.name}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.activeVersion?.description || template.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={template.activeVersion?.category || template.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`v${template.activeVersion?.version || 'N/A'}`}
                      color="default"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.activeVersion?.active ? 'Active' : 'Inactive'}
                      color={template.activeVersion?.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Versions">
                      <IconButton
                        onClick={() => handleViewVersions(template)}
                        size="small"
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleEdit(template)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(template)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Fullscreen Dialog for TemplateEditor */}
      <Dialog open={showEditor} onClose={handleEditorClose} fullScreen>
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
          <Button onClick={handleEditorClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
            Close
          </Button>
        </DialogTitle>
        <DialogContent>
          <TemplateEditor
            template={editingTemplate}
            onSuccess={handleEditorSuccess}
            onClose={handleEditorClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, template: null })}
      >
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{deleteDialog.template?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, template: null })}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 