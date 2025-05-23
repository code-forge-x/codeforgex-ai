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
  DialogActions
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
      const response = await axios.get(`${API_URL}/api/prompts/templates?search=${search}`);
      const templatesData = response.data.templates || response.data || [];
      setTemplates(templatesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [search]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleEdit = async (template) => {
    const id = template._id || (template.activeVersion && template.activeVersion._id);
    if (!id) {
      setError('Template ID not found.');
      return;
    }
    // Always ensure template_id is present at the top level
    let t;
    if (template.activeVersion) {
      t = { ...template.activeVersion, template_id: template.template_id };
    } else {
      t = { ...template };
    }
    // Fallback: if template_id is still missing, try to get it from parent
    if (!t.template_id && template.template_id) {
      t.template_id = template.template_id;
    }
    setEditingTemplate(t);
    setShowEditor(true);
  };

  const handleDelete = (template) => {
    setDeleteDialog({ open: true, template });
  };

  const confirmDelete = async () => {
    const template = deleteDialog.template;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/prompts/templates/${template.activeVersion?._id || template._id}`);
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

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
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
      <Alert severity="warning" sx={{ mb: 2, fontWeight: 'bold', fontSize: 16 }}>
        🚨 <b>REMINDER:</b> Phase-specific prompt templates are required for orchestration & phase transition logic. This is the top priority. See PROJECT_PROGRESS.md for details.
      </Alert>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Prompt Templates</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNewTemplate}
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
                <TableCell>Template ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => {
                const t = template.activeVersion || {};
                return (
                  <TableRow key={t._id || template.template_id}>
                    <TableCell>{template.template_id || 'N/A'}</TableCell>
                    <TableCell>{t.name || 'N/A'}</TableCell>
                    <TableCell>{t.description || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.category || 'N/A'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`v${t.version || 'N/A'}`}
                        color="default"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.active ? 'Active' : 'Inactive'}
                        color={t.active ? 'success' : 'default'}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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

      <Dialog 
        open={showEditor} 
        onClose={handleEditorClose} 
        fullScreen
        maxWidth="lg"
      >
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
          <Button onClick={handleEditorClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
            Close
          </Button>
        </DialogTitle>
        <DialogContent>
          <TemplateEditor
            key={editingTemplate?._id || 'new'}
            template={editingTemplate}
            onSuccess={handleEditorSuccess}
            onClose={handleEditorClose}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}