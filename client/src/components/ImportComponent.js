import React, { useState } from 'react';
import './ImportComponent.css';

const ImportComponent = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('file');
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleImport = () => {
    // TODO: Implement import logic
    console.log('Importing...', activeTab === 'file' ? file : text);
  };

  if (!isOpen) return null;

  return (
    <div className="import-modal-overlay">
      <div className="import-modal">
        <div className="import-modal-header">
          <h2>Import Component</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="import-tabs">
          <button 
            className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            File
          </button>
          <button 
            className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            Text
          </button>
        </div>

        <div className="import-content">
          {activeTab === 'file' ? (
            <div className="file-upload">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".json,.txt"
              />
              <label htmlFor="file-upload" className="file-upload-label">
                {file ? file.name : 'Choose a file or drag it here'}
              </label>
            </div>
          ) : (
            <textarea
              className="text-input"
              placeholder="Paste your component here..."
              value={text}
              onChange={handleTextChange}
            />
          )}
        </div>

        <div className="import-actions">
          <button className="import-button" onClick={handleImport}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportComponent; 