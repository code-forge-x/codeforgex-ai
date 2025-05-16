import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaFileImport } from 'react-icons/fa';
import API_URL from '../../../api';
import './ComponentList.css';
import axios from 'axios';

const ComponentList = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
      let url = `${API_URL}/prompts/components?page=${currentPage}&limit=${itemsPerPage}`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      
      const response = await axios.get(url, getAuthHeaders());
      const componentsData = Array.isArray(response.data) ? response.data : response.data.components || [];
      setComponents(componentsData);
      setTotalPages(Array.isArray(response.data) ? 1 : response.data.totalPages || 1);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch components');
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
        `${API_URL}/prompts/components/${selectedComponent._id}`,
        getAuthHeaders()
      );
      
      if (response.data.success) {
        setShowDeleteModal(false);
        setSelectedComponent(null);
        setSuccess('Component deleted successfully');
        await fetchComponents();
      } else {
        setError(response.data.message || 'Failed to delete component');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete component');
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
        `${API_URL}/prompts/components/${selectedComponent._id}`,
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
        setSuccess('Component updated successfully');
        await fetchComponents();
      } else {
        setError(response.data.message || 'Failed to update component');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update component');
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
        `${API_URL}/prompts/components`,
        newComponent,
        getAuthHeaders()
      );
      
      if (response.data) {
        setShowCreateModal(false);
        setSuccess('Component created successfully');
        await fetchComponents();
      }
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.message || 'Failed to create component');
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

  return (
    <div className="component-list-container">
      <div className="component-header">
        <h1>Prompt Components</h1>
        <div className="header-buttons">
          <button className="import-button" onClick={() => navigate('/import-utility')}>
            <FaFileImport /> Import Component
          </button>
          <button className="create-button" onClick={handleCreate}>
            <FaPlus /> Create Component
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <div className="alert-content">
            <span className="alert-icon">✓</span>
            <span className="alert-message">{success}</span>
          </div>
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
          </div>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading components...</div>
      ) : components.length === 0 ? (
        <div className="no-components">No components found</div>
      ) : (
        <div className="components-grid">
          {components.map(component => (
            <div key={component._id} className="component-card">
              <div className="component-card-header">
                <h3>{component.name}</h3>
                <div className="component-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(component)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(component)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p className="component-description">{component.description}</p>
              <div className="component-tags">
                {component.tags && component.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="component-footer">
                <span className="category">{component.category}</span>
                <span className="usage">Used {component.usageCount || 0} times</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Component</h3>
              <button className="close-button" onClick={() => closeModal('delete')}>×</button>
            </div>
            <p>Are you sure you want to delete "{selectedComponent.name}"?</p>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => closeModal('delete')}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal create-modal">
            <div className="modal-header">
              <h3>Create New Component</h3>
              <button className="close-button" onClick={() => closeModal('create')}>×</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newComponent.name}
                  onChange={handleNewComponentChange}
                  required
                  placeholder="Enter component name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newComponent.description}
                  onChange={handleNewComponentChange}
                  required
                  placeholder="Enter component description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={newComponent.content}
                  onChange={handleNewComponentChange}
                  required
                  placeholder="Enter component content"
                  rows="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={newComponent.category}
                  onChange={handleNewComponentChange}
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <div className="tags-input-container">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Add tags (press Enter)"
                  />
                  <div className="tags-list">
                    {newComponent.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                        <button
                          type="button"
                          className="remove-tag"
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="cancel-button"
                  onClick={() => closeModal('create')}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal create-modal">
            <div className="modal-header">
              <h3>Edit Component</h3>
              <button className="close-button" onClick={() => closeModal('edit')}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-name">Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editingComponent.name}
                  onChange={handleEditChange}
                  required
                  placeholder="Enter component name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editingComponent.description}
                  onChange={handleEditChange}
                  required
                  placeholder="Enter component description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-content">Content</label>
                <textarea
                  id="edit-content"
                  name="content"
                  value={editingComponent.content}
                  onChange={handleEditChange}
                  required
                  placeholder="Enter component content"
                  rows="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  name="category"
                  value={editingComponent.category}
                  onChange={handleEditChange}
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-tags">Tags</label>
                <div className="tags-input-container">
                  <input
                    type="text"
                    id="edit-tags"
                    value={editTagInput}
                    onChange={handleEditTagInputChange}
                    onKeyDown={handleEditTagInputKeyDown}
                    placeholder="Add tags (press Enter)"
                  />
                  <div className="tags-list">
                    {editingComponent.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                        <button
                          type="button"
                          className="remove-tag"
                          onClick={() => removeEditTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="cancel-button"
                  onClick={() => closeModal('edit')}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentList; 