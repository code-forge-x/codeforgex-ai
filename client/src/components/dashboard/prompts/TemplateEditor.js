import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaSearch, FaEye, FaTimes, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../../api';
import './TemplateEditor.css';
import { Box, Grid, TextField, Chip, IconButton, InputAdornment, Typography, Paper, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const TemplateEditor = ({ template: initialTemplate, onSuccess, onClose }) => {
  const isEditMode = !!(initialTemplate && initialTemplate._id);
  const [template, setTemplate] = useState({
    template_id: '',
    name: '',
    description: '',
    content: '',
    category: 'component_generation',
    subcategory: 'mql5',
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
  const [newTag, setNewTag] = useState('');
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState('');
  const [testError, setTestError] = useState('');

  useEffect(() => {
    fetchComponents();
    
    if (isEditMode && initialTemplate) {
      setTemplate({
        template_id: initialTemplate.template_id || '',
        name: initialTemplate.name || '',
        description: initialTemplate.description || '',
        content: initialTemplate.content || '',
        category: initialTemplate.category || 'component_generation',
        subcategory: initialTemplate.subcategory || 'mql5',
        parameters: initialTemplate.parameters || [],
        version: initialTemplate.version || 1,
        _id: initialTemplate._id,
        active: initialTemplate.active,
        tags: initialTemplate.tags || [],
        metadata: initialTemplate.metadata || {}
      });
    } else {
      setTemplate({
        template_id: '',
        name: '',
        description: '',
        content: '',
        category: 'component_generation',
        subcategory: 'mql5',
        parameters: [],
        version: 1
      });
    }
  }, [initialTemplate, isEditMode]);

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
        `${API_URL}/api/prompts/templates/preview`,
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
        const updateData = {
          template_id: template.template_id,
          name: template.name,
          description: template.description,
          content: template.content,
          category: template.category,
          subcategory: template.subcategory,
          parameters: template.parameters || [],
          version: template.version,
          active: template.active,
          tags: Array.isArray(template.tags) ? template.tags : [],
          metadata: template.metadata || {}
        };

        console.log('Sending update data:', updateData);

        response = await axios.put(
          `${API_URL}/api/prompts/templates/${template._id}`,
          updateData,
          getAuthHeaders()
        );
      } else {
        const newTemplateData = {
          template_id: template.template_id,
          name: template.name,
          description: template.description,
          content: template.content,
          category: template.category,
          subcategory: template.subcategory,
          parameters: template.parameters || [],
          version: 1,
          active: true,
          tags: Array.isArray(template.tags) ? template.tags : []
        };

        response = await axios.post(
          `${API_URL}/api/prompts/templates`,
          newTemplateData,
          getAuthHeaders()
        );
      }
      setSuccess(isEditMode ? 'Template updated successfully' : 'Template created successfully');
      if (!isEditMode) {
        setTemplate({
          template_id: '',
          name: '',
          description: '',
          content: '',
          category: 'component_generation',
          subcategory: 'mql5',
          parameters: [],
          version: 1
        });
      }
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      console.error('Save error:', err);
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

  const handleAddTag = () => {
    const tag = newTag.trim();
    const tagsArray = template.tags || [];
    if (tag && !tagsArray.includes(tag)) {
      setTemplate(prev => ({
        ...prev,
        tags: [...tagsArray, tag]
      }));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTemplate(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTestTemplate = async () => {
    setTestModalOpen(true);
    setTestLoading(true);
    setTestResponse('');
    setTestError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/chat`,
        { message: template.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestResponse(res.data?.content || JSON.stringify(res.data));
    } catch (err) {
      setTestError(err.response?.data?.error || err.message || 'Error testing template');
    } finally {
      setTestLoading(false);
    }
  };

  // Helper to parse Claude streaming response
  function parseClaudeResponse(raw) {
    if (!raw) return '';
    if (raw.includes('data:')) {
      // Join all content fields from streaming format
      const matches = raw.match(/data: (\{[^}]+\})/g);
      if (!matches) return raw;
      let result = '';
      matches.forEach(m => {
        try {
          const obj = JSON.parse(m.replace('data: ', ''));
          if (obj.content) result += obj.content;
        } catch {}
      });
      return result;
    }
    // Otherwise, just return the raw response
    return raw;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="warning" sx={{ mb: 2, fontWeight: 'bold', fontSize: 16 }}>
        🚨 <b>REMINDER:</b> Phase-specific prompt templates are required for orchestration & phase transition logic. This is the top priority. See PROJECT_PROGRESS.md for details.
      </Alert>
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template ID"
                name="template_id"
                value={template.template_id}
                onChange={handleInputChange}
                required
                disabled={isEditMode}
                helperText="Unique identifier for the template (letters, numbers, and underscores only)"
                error={!isEditMode && !/^[a-zA-Z0-9_]+$/.test(template.template_id)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                name="name"
                value={template.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={template.description}
                onChange={handleInputChange}
                required
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={template.category}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="blueprint">Blueprint</MenuItem>
                <MenuItem value="component_generation">Component Generation</MenuItem>
                <MenuItem value="new_cat">new cat</MenuItem>
                <MenuItem value="tech_support">Tech Support</MenuItem>
                <MenuItem value="code_analysis">Code Analysis</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Subcategory"
                name="subcategory"
                value={template.subcategory}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="mql5">MQL5</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="c++">C++</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Tags"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                size="small"
                placeholder="Add tag and press Enter"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddTag} edge="end" aria-label="add tag" size="small">
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(template.tags || []).map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12}>
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
            </Grid>
          </Grid>
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Saving...' : 'Save'}
            </button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleTestTemplate}
              disabled={!template.content || loading}
              style={{ minWidth: 140 }}
            >
              Test Template
            </Button>
          </div>
        </form>
      </div>

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
              {components.filter(component =>
                component.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(component => (
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

      <Dialog open={testModalOpen} onClose={() => setTestModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Claude Response</DialogTitle>
        <DialogContent>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Claude's Response</div>
          {testLoading && <CircularProgress />}
          {testError && <div style={{ color: 'red', marginTop: 16 }}>{testError}</div>}
          {testResponse && (
            <div style={{
              background: '#f5f5f7',
              borderRadius: 12,
              padding: 20,
              fontFamily: 'Menlo, Monaco, Consolas, monospace',
              fontSize: 16,
              color: '#222',
              whiteSpace: 'pre-wrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginTop: 8,
              maxHeight: 400,
              overflowY: 'auto',
              border: '1px solid #e0e0e0'
            }}>
              {parseClaudeResponse(testResponse)}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditor;