import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaSearch, FaEye, FaTimes, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../../api';
import './TemplateEditor.css';

const TemplateEditor = ({ template: initialTemplate, onSuccess, onClose }) => {
  const isEditMode = !!(initialTemplate && initialTemplate._id);
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    content: '',
    category: 'component_generation',
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
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    fetchComponents();
    // If editing, pre-fill fields
    if (isEditMode) {
      setTemplate({
        name: initialTemplate.name || '',
        description: initialTemplate.description || '',
        content: initialTemplate.content || '',
        category: initialTemplate.category || 'component_generation',
        parameters: Array.isArray(initialTemplate.parameters) ? initialTemplate.parameters : [],
        version: initialTemplate.version || 1
      });
    }
  }, [initialTemplate]);

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

  const addParameter = () => {
    setTemplate(prev => ({
      ...prev,
      parameters: [
        ...prev.parameters,
        {
          name: '',
          type: 'string',
          required: false,
          description: ''
        }
      ]
    }));
  };

  const updateParameter = (index, field, value) => {
    setTemplate(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const removeParameter = (index) => {
    setTemplate(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
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
      let response;
      if (isEditMode) {
        // Update existing template (creates new version)
        response = await axios.put(
          `${API_URL}/prompts/templates/${initialTemplate._id}`,
          template,
          getAuthHeaders()
        );
      } else {
        // Create new template
        response = await axios.post(
          `${API_URL}/prompts/templates`,
          template,
          getAuthHeaders()
        );
      }
      setSuccess(isEditMode ? 'Template updated successfully' : 'Template created successfully');
      // Reset form if creating
      if (!isEditMode) {
        setTemplate({
          name: '',
          description: '',
          content: '',
          category: 'component_generation',
          parameters: [],
          version: 1
        });
      }
      // Redirect/close after success
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContentWithHighlights = () => {
    const content = template.content;
    const parts = [];
    let lastIndex = 0;
    const componentRegex = /{{ include ([^}]+) }}/g;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }

      // Add the component reference
      const componentName = match[1].trim();
      const component = components.find(c => c.name === componentName);
      
      parts.push({
        type: 'component',
        name: componentName,
        exists: !!component,
        component
      });

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    return parts;
  };

  return (
    <div className="template-editor">
      <div className="editor-header">
        <h1>{isEditMode ? 'Edit Template' : 'Create New Template'}</h1>
        <button 
          className="preview-button"
          onClick={generatePreview}
          disabled={loading || !template.content.trim()}
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
            disabled={isEditMode}
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
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={template.category}
            onChange={handleInputChange}
            required
          >
            <option value="blueprint">Blueprint</option>
            <option value="component_generation">Component Generation</option>
            <option value="new_cat">new cat</option>
            <option value="tech_support">Tech Support</option>
            <option value="code_analysis">Code Analysis</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="form-group">
          <label>Parameters</label>
          <div className="parameters-list">
            {template.parameters.map((param, index) => (
              <div key={index} className="parameter-item">
                <div className="parameter-header">
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value)}
                    placeholder="Parameter name"
                    className="parameter-name"
                  />
                  <select
                    value={param.type}
                    onChange={(e) => updateParameter(index, 'type', e.target.value)}
                    className="parameter-type"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <label className="parameter-required">
                    <input
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    className="remove-parameter"
                    onClick={() => removeParameter(index)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <input
                  type="text"
                  value={param.description}
                  onChange={(e) => updateParameter(index, 'description', e.target.value)}
                  placeholder="Parameter description"
                  className="parameter-description"
                />
              </div>
            ))}
            <button
              type="button"
              className="add-parameter-button"
              onClick={addParameter}
            >
              <FaPlus /> Add Parameter
            </button>
          </div>
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
              <div className="editor-help">
                <FaInfoCircle />
                <span>Use {'{{ include component_name }}'} to insert components</span>
              </div>
            </div>
            <div className="content-preview">
              {renderContentWithHighlights().map((part, index) => {
                if (part.type === 'text') {
                  return <span key={index}>{part.content}</span>;
                } else {
                  return (
                    <span
                      key={index}
                      className={`component-reference ${part.exists ? 'valid' : 'invalid'}`}
                      onMouseEnter={() => setHoveredComponent(part.component)}
                      onMouseLeave={() => setHoveredComponent(null)}
                    >
                      {`{{ include ${part.name} }}`}
                    </span>
                  );
                }
              })}
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

        {hoveredComponent && (
          <div className="component-preview">
            <h4>{hoveredComponent.name}</h4>
            <p>{hoveredComponent.description}</p>
            <pre>{hoveredComponent.content}</pre>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit"
            className="save-button"
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Saving...' : 'Saving...') : (isEditMode ? 'Save Changes' : 'Save Template')}
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