import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEye, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../../api';
import './PromptCreator.css';

const PromptCreator = () => {
  const [prompt, setPrompt] = useState({
    name: '',
    description: '',
    content: '',
    category: 'general',
    tags: [],
    parameters: []
  });
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [previewContent, setPreviewContent] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchComponents();
  }, []);

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
      const response = await axios.get(`${API_URL}/api/prompts/components`, getAuthHeaders());
      setComponents(Array.isArray(response.data) ? response.data : response.data.components || []);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to fetch components');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrompt(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (e) => {
    const { value, selectionStart } = e.target;
    setCursorPosition(selectionStart);
    setPrompt(prev => ({
      ...prev,
      content: value
    }));
    validatePrompt(value);
  };

  const validatePrompt = (content) => {
    const errors = [];
    const componentRegex = /{{ include ([^}]+) }}/g;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
      const componentName = match[1].trim();
      const componentExists = components.some(c => c.name === componentName);
      if (!componentExists) {
        errors.push({
          type: 'component',
          name: componentName,
          position: match.index,
          length: match[0].length
        });
      }
    }

    setValidationErrors(errors);
  };

  const insertComponent = (component) => {
    const before = prompt.content.substring(0, cursorPosition);
    const after = prompt.content.substring(cursorPosition);
    const newContent = `${before}{{ include ${component.name} }}${after}`;
    
    setPrompt(prev => ({
      ...prev,
      content: newContent
    }));
    setShowComponentModal(false);
    validatePrompt(newContent);
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!prompt.tags.includes(tagInput.trim())) {
        setPrompt(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setPrompt(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generatePreview = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/prompts/templates/preview`,
        { content: prompt.content },
        getAuthHeaders()
      );
      setPreviewContent(response.data.preview);
      setShowPreviewModal(true);
    } catch (err) {
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/prompts/templates`,
        prompt,
        getAuthHeaders()
      );
      setSuccess('Prompt created successfully');
      // Reset form
      setPrompt({
        name: '',
        description: '',
        content: '',
        category: 'general',
        tags: [],
        parameters: []
      });
      setTagInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prompt');
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="prompt-creator">
      <div className="creator-header">
        <h1>Create New Prompt</h1>
        <button 
          className="preview-button"
          onClick={generatePreview}
          disabled={loading}
        >
          <FaEye /> Preview Prompt
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
          </div>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <div className="alert-content">
            <span className="alert-icon">✓</span>
            <span className="alert-message">{success}</span>
          </div>
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Prompt Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={prompt.name}
            onChange={handleInputChange}
            required
            placeholder="Enter prompt name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={prompt.description}
            onChange={handleInputChange}
            required
            placeholder="Enter prompt description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={prompt.category}
            onChange={handleInputChange}
            required
          >
            <option value="general">General</option>
            <option value="code">Code</option>
            <option value="documentation">Documentation</option>
            <option value="analysis">Analysis</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="tags-input">
            <div className="tags-container">
              {prompt.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeTag(tag)}
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags (press Enter)"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Prompt Content</label>
          <div className="content-editor">
            <div className="editor-toolbar">
              <button
                type="button"
                className="insert-component-button"
                onClick={() => setShowComponentModal(true)}
              >
                <FaPlus /> Insert Component
              </button>
            </div>
            <textarea
              id="content"
              name="content"
              value={prompt.content}
              onChange={handleContentChange}
              required
              placeholder="Enter prompt content. Use {{ include component_name }} to insert components."
              rows="15"
              className={validationErrors.length > 0 ? 'has-errors' : ''}
            />
            {validationErrors.length > 0 && (
              <div className="validation-errors">
                {validationErrors.map((error, index) => (
                  <div key={index} className="error-message">
                    Component "{error.name}" not found
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit"
            className="save-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Prompt'}
          </button>
        </div>
      </form>

      {showComponentModal && (
        <div className="modal-overlay">
          <div className="modal component-modal">
            <div className="modal-header">
              <h3>Insert Component</h3>
              <button className="close-button" onClick={() => setShowComponentModal(false)}>×</button>
            </div>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="components-list">
              {filteredComponents.map(component => (
                <div
                  key={component._id}
                  className="component-item"
                  onClick={() => insertComponent(component)}
                >
                  <h4>{component.name}</h4>
                  <p>{component.description}</p>
                  <div className="component-tags">
                    {component.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal preview-modal">
            <div className="modal-header">
              <h3>Prompt Preview</h3>
              <button className="close-button" onClick={() => setShowPreviewModal(false)}>×</button>
            </div>
            <div className="preview-content">
              {previewContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptCreator; 