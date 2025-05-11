import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEye } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../../api';
import './TemplateEditor.css';

const TemplateEditor = () => {
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    content: '',
    parameters: [],
    version: 1
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
      const response = await axios.get(`${API_URL}/prompts/components`, getAuthHeaders());
      setComponents(Array.isArray(response.data) ? response.data : response.data.components || []);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to fetch components');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (e) => {
    const { value, selectionStart } = e.target;
    setCursorPosition(selectionStart);
    setTemplate(prev => ({
      ...prev,
      content: value
    }));
    validateTemplate(value);
  };

  const validateTemplate = (content) => {
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
    const before = template.content.substring(0, cursorPosition);
    const after = template.content.substring(cursorPosition);
    const newContent = `${before}{{ include ${component.name} }}${after}`;
    
    setTemplate(prev => ({
      ...prev,
      content: newContent
    }));
    setShowComponentModal(false);
    validateTemplate(newContent);
  };

  const generatePreview = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/prompts/templates/preview`,
        { content: template.content },
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
        `${API_URL}/prompts/templates`,
        template,
        getAuthHeaders()
      );
      setSuccess('Template created successfully');
      // Reset form
      setTemplate({
        name: '',
        description: '',
        content: '',
        parameters: [],
        version: 1
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="template-editor">
      <div className="editor-header">
        <h1>Create New Template</h1>
        <button 
          className="preview-button"
          onClick={generatePreview}
          disabled={loading}
        >
          <FaEye /> Preview Template
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
          <label htmlFor="name">Template Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={template.name}
            onChange={handleInputChange}
            required
            placeholder="Enter template name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={template.description}
            onChange={handleInputChange}
            required
            placeholder="Enter template description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Template Content</label>
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
              value={template.content}
              onChange={handleContentChange}
              required
              placeholder="Enter template content. Use {{ include component_name }} to insert components."
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
            {loading ? 'Saving...' : 'Save Template'}
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
              <h3>Template Preview</h3>
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

export default TemplateEditor; 