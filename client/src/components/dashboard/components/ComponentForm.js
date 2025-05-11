import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import API_URL from '../../../api';
import './ComponentForm.css';
import axios from 'axios';

const ComponentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: 'other',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'error_handling',
    'risk_management',
    'introduction',
    'conclusion',
    'validation',
    'other'
  ];

  useEffect(() => {
    if (id) {
      fetchComponent();
    }
  }, [id]);

  const fetchComponent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/components/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch component');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await axios.put(`${API_URL}/components/${id}`, formData);
      } else {
        await axios.post(`${API_URL}/components`, formData);
      }
      navigate('/components');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save component');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="component-form-container">
      <div className="form-header">
        <h1>{id ? 'Edit Component' : 'Create Component'}</h1>
        <button className="cancel-button" onClick={() => navigate('/components')}>
          <FaTimes /> Cancel
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="component-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter component name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
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
            value={formData.content}
            onChange={handleChange}
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
            value={formData.category}
            onChange={handleChange}
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
              {formData.tags.map(tag => (
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

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : 'Save Component'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComponentForm; 