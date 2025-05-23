import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaFileImport } from 'react-icons/fa';
import API_URL from '../../../api';
import axios from 'axios';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNotification } from '../../../context/NotificationContext';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import StarIcon from '@mui/icons-material/Star';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import FeedbackIcon from '@mui/icons-material/Feedback';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const ComponentList = () => {
  const { notify } = useNotification();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editingComponent, setEditingComponent] = useState({
    name: '',
    description: '',
    content: '',
    category: 'other',
    tags: []
  });
  const [newComponent, setNewComponent] = useState({
    name: '',
    description: '',
    content: '',
    category: 'other',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [previewComponent, setPreviewComponent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackComponent, setFeedbackComponent] = useState(null);
  const [feedbackValue, setFeedbackValue] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackHistoryOpen, setFeedbackHistoryOpen] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const navigate = useNavigate();

  const categories = [
    'error_handling',
    'risk_management',
    'introduction',
    'conclusion',
    'validation',
    'other'
  ];

  useEffect(() => {
    fetchComponents();
  }, [searchTerm, selectedCategory, currentPage]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const fetchComponents = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/prompts/components?page=${currentPage}&limit=${itemsPerPage}`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      
      const response = await axios.get(url, getAuthHeaders());
      const componentsData = Array.isArray(response.data) ? response.data : response.data.components || [];
      setComponents(componentsData);
      setTotalPages(Array.isArray(response.data) ? 1 : response.data.totalPages || 1);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to fetch components', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (component) => {
    setSelectedComponent(component);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_URL}/api/prompts/components/${selectedComponent._id}`,
        getAuthHeaders()
      );
      
      if (response.data.success) {
        setShowDeleteModal(false);
        setSelectedComponent(null);
        notify('Component deleted successfully', 'success');
        await fetchComponents();
      } else {
        notify(response.data.message || 'Failed to delete component', 'error');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete component', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (component) => {
    setSelectedComponent(component);
    setEditingComponent({
      name: component.name || '',
      description: component.description || '',
      content: component.content || '',
      category: component.category || 'other',
      tags: component.tags || []
    });
    setEditTagInput('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/api/prompts/components/${selectedComponent._id}`,
        {
          name: editingComponent.name,
          description: editingComponent.description,
          content: editingComponent.content,
          category: editingComponent.category,
          tags: editingComponent.tags
        },
        getAuthHeaders()
      );
      
      if (response.data.success) {
        setShowEditModal(false);
        setSelectedComponent(null);
        notify('Component updated successfully', 'success');
        await fetchComponents();
      } else {
        notify(response.data.message || 'Failed to update component', 'error');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update component', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setNewComponent({
      name: '',
      description: '',
      content: '',
      category: 'other',
      tags: []
    });
    setTagInput('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/prompts/components`,
        newComponent,
        getAuthHeaders()
      );
      
      if (response.data) {
        setShowCreateModal(false);
        notify('Component created successfully', 'success');
        await fetchComponents();
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create component', 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = (modalType) => {
    switch (modalType) {
      case 'create':
        setShowCreateModal(false);
        setNewComponent({
          name: '',
          description: '',
          content: '',
          category: 'other',
          tags: []
        });
        setTagInput('');
        break;
      case 'edit':
        setShowEditModal(false);
        setSelectedComponent(null);
        setEditingComponent({
          name: '',
          description: '',
          content: '',
          category: 'other',
          tags: []
        });
        setEditTagInput('');
        break;
      case 'delete':
        setShowDeleteModal(false);
        setSelectedComponent(null);
        break;
    }
  };

  const handleNewComponentChange = (e) => {
    const { name, value } = e.target;
    setNewComponent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingComponent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleEditTagInputChange = (e) => {
    setEditTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!newComponent.tags.includes(newTag)) {
        setNewComponent(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleEditTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && editTagInput.trim()) {
      e.preventDefault();
      const newTag = editTagInput.trim();
      if (!editingComponent.tags.includes(newTag)) {
        setEditingComponent(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setEditTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewComponent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const removeEditTag = (tagToRemove) => {
    setEditingComponent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Mocked feedback endpoints for demonstration
  const fetchFeedbackHistory = async (componentId) => {
    // Replace with real API call
    setFeedbackHistory([
      { user: 'Alice', rating: 5, comment: 'Great component!', date: '2024-06-01' },
      { user: 'Bob', rating: 4, comment: 'Works well, but could use more docs.', date: '2024-06-02' },
    ]);
  };
  const submitFeedback = async (componentId, rating, comment) => {
    // Replace with real API call
    notify('Feedback submitted. Thank you!', 'success');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, minHeight: 300 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Component Library
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : components.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No components found</TableCell>
                    </TableRow>
                  ) : (
                    components.map(component => (
                      <TableRow key={component._id} hover>
                        <TableCell>
                          <Tooltip title="Preview">
                            <Button onClick={() => { setPreviewComponent(component); setShowPreview(true); }} size="small">
                              {component.name}
                            </Button>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{component.description}</TableCell>
                        <TableCell>
                          <Chip label={component.category} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {component.tags && component.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Usage count">
                            <Chip icon={<StarIcon fontSize="small" />} label={component.usageCount || 0} size="small" color="secondary" />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Add to Project">
                            <IconButton color="primary" size="small">
                              <AddCircleOutlineIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rate Component">
                            <IconButton color="secondary" size="small" onClick={() => { setFeedbackComponent(component); setFeedbackDialogOpen(true); }}>
                              <StarIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Feedback History">
                            <IconButton color="info" size="small" onClick={async () => { await fetchFeedbackHistory(component._id); setFeedbackHistoryOpen(true); }}>
                              <FeedbackIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Preview Modal */}
            <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
              <DialogTitle>Component Preview: {previewComponent?.name}</DialogTitle>
              <DialogContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{previewComponent?.description}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">Category: {previewComponent?.category}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">Tags: {previewComponent?.tags?.join(', ')}</Typography>
                <Paper sx={{ p: 2, bgcolor: '#232323', color: '#fff', fontFamily: 'monospace', whiteSpace: 'pre-wrap', mb: 2 }}>
                  {previewComponent?.content}
                </Paper>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowPreview(false)}>Close</Button>
              </DialogActions>
            </Dialog>
            {/* Create Modal */}
            <Dialog open={showCreateModal} onClose={() => closeModal('create')} maxWidth="sm" fullWidth>
              <DialogTitle>Create New Component</DialogTitle>
              <DialogContent>
                <TextField
                  margin="normal"
                  label="Name"
                  name="name"
                  fullWidth
                  value={newComponent.name}
                  onChange={handleNewComponentChange}
                  required
                />
                <TextField
                  margin="normal"
                  label="Description"
                  name="description"
                  fullWidth
                  multiline
                  minRows={2}
                  value={newComponent.description}
                  onChange={handleNewComponentChange}
                  required
                />
                <TextField
                  margin="normal"
                  label="Content"
                  name="content"
                  fullWidth
                  multiline
                  minRows={6}
                  value={newComponent.content}
                  onChange={handleNewComponentChange}
                  required
                />
                <TextField
                  margin="normal"
                  label="Category"
                  name="category"
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                  value={newComponent.category}
                  onChange={handleNewComponentChange}
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </TextField>
                <TextField
                  margin="normal"
                  label="Tags (comma separated)"
                  name="tags"
                  fullWidth
                  value={newComponent.tags.join(', ')}
                  onChange={e => setNewComponent(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => closeModal('create')}>Cancel</Button>
                <Button onClick={handleCreateSubmit} variant="contained" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Component'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Edit Modal */}
            <Dialog open={showEditModal} onClose={() => closeModal('edit')} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Component</DialogTitle>
              <DialogContent>
                <TextField
                  margin="normal"
                  label="Name"
                  name="name"
                  fullWidth
                  value={editingComponent.name}
                  onChange={handleEditChange}
                  required
                />
                <TextField
                  margin="normal"
                  label="Description"
                  name="description"
                  fullWidth
                  multiline
                  minRows={2}
                  value={editingComponent.description}
                  onChange={handleEditChange}
                  required
                />
                <TextField
                  margin="normal"
                  label="Content"
                  name="content"
                  fullWidth
                  multiline
                  minRows={6}
                  value={editingComponent.content}
                  onChange={handleEditChange}
                  required
                />
                <TextField
                  margin="normal"
                  label="Category"
                  name="category"
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                  value={editingComponent.category}
                  onChange={handleEditChange}
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </TextField>
                <TextField
                  margin="normal"
                  label="Tags (comma separated)"
                  name="tags"
                  fullWidth
                  value={editingComponent.tags.join(', ')}
                  onChange={e => setEditingComponent(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => closeModal('edit')}>Cancel</Button>
                <Button onClick={handleEditSubmit} variant="contained" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onClose={() => closeModal('delete')} maxWidth="xs" fullWidth>
              <DialogTitle>Delete Component</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete "{selectedComponent?.name}"?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => closeModal('delete')}>Cancel</Button>
                <Button onClick={confirmDelete} color="error" variant="contained" disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Feedback Dialog */}
            <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Rate & Feedback: {feedbackComponent?.name}</DialogTitle>
              <DialogContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{feedbackComponent?.description}</Typography>
                <Rating
                  name="component-feedback-rating"
                  value={feedbackValue}
                  onChange={(_, newValue) => setFeedbackValue(newValue)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Comment"
                  fullWidth
                  multiline
                  minRows={2}
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={async () => {
                    await submitFeedback(feedbackComponent._id, feedbackValue, feedbackComment);
                    setFeedbackDialogOpen(false);
                    setFeedbackValue(0);
                    setFeedbackComment('');
                  }}
                  variant="contained"
                  disabled={!feedbackValue}
                >
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
            {/* Feedback History Dialog */}
            <Dialog open={feedbackHistoryOpen} onClose={() => setFeedbackHistoryOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Feedback History</DialogTitle>
              <DialogContent>
                <List>
                  {feedbackHistory.length === 0 ? (
                    <ListItem><ListItemText primary="No feedback yet." /></ListItem>
                  ) : feedbackHistory.map((fb, idx) => (
                    <ListItem key={idx} alignItems="flex-start">
                      <ListItemText
                        primary={<><Rating value={fb.rating} readOnly size="small" /> {fb.user} ({fb.date})</>}
                        secondary={fb.comment}
                      />
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setFeedbackHistoryOpen(false)}>Close</Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ComponentList; 