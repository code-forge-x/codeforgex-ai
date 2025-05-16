import React, { useState } from 'react';
import './TemplateImportUtility.css';
import { FaInfoCircle, FaFolderOpen, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const stepLabels = ['Import', 'Validate', 'Preview', 'Save'];

const detectedComponents = [
  {
    name: 'MovingAverage',
    description: 'Component for calculating moving averages',
    category: 'Indicator',
  },
  {
    name: 'RiskManager',
    description: 'Risk management component with percentage based sizing',
    category: 'Utility',
  },
];

const SUPPORTED_FORMATS = ['.txt', '.json', '.yml', '.yaml'];

const getFileType = (filename) => {
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yml';
  return 'txt';
};

// Helper to auto-detect file type for pasted text
function detectPastedFileType(text) {
  // Clean input: remove common headers, trim whitespace
  let cleaned = text.trim().replace(/^(---|Document:|#.*|\s*Format:.*|\s*Templates?:.*)\n+/gim, '').trim();
  // Try JSON
  try {
    JSON.parse(cleaned);
    return 'json';
  } catch {}
  // Try YAML (simple heuristic: key: value, and not just a single line)
  if (/^\s*\w+:/m.test(cleaned) && cleaned.split('\n').length > 2) return 'yml';
  // Detect multiple JSON objects (batch)
  if ((cleaned.match(/\{[\s\S]*?\}/g) || []).length > 1) return 'json';
  // Detect numbered sections (custom text format)
  if (/^[0-9]+\. /m.test(cleaned)) return 'txt';
  // Fallback: if ambiguous, treat as txt
  return 'txt';
}

const TemplateImportUtility = () => {
  const [activeTab, setActiveTab] = useState('file');
  const [processingOptions, setProcessingOptions] = useState({
    extract: true,
    validate: true,
    detectPython: false,
  });
  const [templateType, setTemplateType] = useState('auto');
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileError, setFileError] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsedComponents, setParsedComponents] = useState([]);
  const [formatPreview, setFormatPreview] = useState('');
  const [validated, setValidated] = useState(false);
  const [validComponents, setValidComponents] = useState([]);
  const [invalidComponents, setInvalidComponents] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [previewComponent, setPreviewComponent] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!SUPPORTED_FORMATS.some(ext => file.name.endsWith(ext))) {
      setFileError('Unsupported file type. Please select a .txt, .json, or .yml file.');
      setSelectedFile(null);
      setFileContent('');
      setFormatPreview('');
      setParsedComponents([]);
      setValidated(false);
      return;
    }
    setFileError('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      setFileContent(content);
      await parseContent(content, getFileType(file.name));
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!SUPPORTED_FORMATS.some(ext => file.name.endsWith(ext))) {
        setFileError('Unsupported file type. Please select a .txt, .json, or .yml file.');
        setSelectedFile(null);
        setFileContent('');
        setFormatPreview('');
        setParsedComponents([]);
        setValidated(false);
        return;
      }
      setFileError('');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        setFileContent(content);
        await parseContent(content, getFileType(file.name));
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileContent('');
    setFormatPreview('');
    setParsedComponents([]);
    setValidated(false);
    setValidComponents([]);
    setInvalidComponents([]);
    setSelectedComponents([]);
    setParseError('');
    setImportResult(null);
    setPreviewComponent(null);
    setShowFullPreview(false);
  };

  // Handle text paste
  const handleTextChange = async (e) => {
    const text = e.target.value;
    setFileContent(text);
    setSelectedFile(null);
    setFileError('');
    setValidated(false);
    setValidComponents([]);
    setInvalidComponents([]);
    setSelectedComponents([]);
    setImportResult(null);
    if (text.trim()) {
      const fileType = detectPastedFileType(text);
      await parseContent(text, fileType);
    } else {
      setFormatPreview('');
      setParsedComponents([]);
    }
  };

  // Parse content with backend
  const parseContent = async (content, fileType) => {
    setParseError('');
    setValidated(false);
    setValidComponents([]);
    setInvalidComponents([]);
    setSelectedComponents([]);
    setImportResult(null);
    try {
      const res = await axios.post('http://localhost:5000/api/template-import/parse', {
        content,
        fileType,
      });
      if (res.data.success) {
        setParsedComponents(res.data.components);
        setFormatPreview(JSON.stringify(res.data.components, null, 2));
        setSelectedComponents(res.data.components.map(() => true));
      } else {
        setParseError(res.data.error || 'Failed to parse file.');
        setFormatPreview('');
        setParsedComponents([]);
      }
    } catch (err) {
      setParseError(err.response?.data?.error || 'Failed to parse file.');
      setFormatPreview('');
      setParsedComponents([]);
    }
  };

  // Validate components
  const handleValidate = async () => {
    setImportResult(null);
    try {
      const res = await axios.post('http://localhost:5000/api/template-import/validate', {
        components: parsedComponents,
      });
      if (res.data.success) {
        setValidated(true);
        setValidComponents(res.data.valid);
        setInvalidComponents(res.data.invalid);
        setSelectedComponents(res.data.valid.map(() => true));
      } else {
        setValidated(false);
        setValidComponents([]);
        setInvalidComponents([]);
      }
    } catch (err) {
      setValidated(false);
      setValidComponents([]);
      setInvalidComponents([]);
    }
  };

  // Import selected components
  const handleImport = async () => {
    setImportResult(null);
    const toImport = validComponents.filter((_, idx) => selectedComponents[idx]);
    try {
      const res = await axios.post('http://localhost:5000/api/template-import/import', {
        components: toImport,
      });
      setImportResult(res.data);
      if (res.data.success) {
        setTimeout(() => {
          navigate('/admin/dashboard/components');
        }, 1000);
      }
    } catch (err) {
      setImportResult({ success: false, error: err.response?.data?.error || 'Import failed.' });
    }
  };

  // UI rendering
  return (
    <div className="template-import-utility">
      <div className="utility-header">
        <h2>Template Import Utility</h2>
        <button className="back-btn" onClick={() => navigate('/admin/dashboard/components')}>Back to Components</button>
      </div>
      <div className="import-section">
        <h3>Import Templates</h3>
        <div className="import-tabs">
          <button className={activeTab === 'file' ? 'active' : ''} onClick={() => { setActiveTab('file'); handleClearFile(); }}>File Upload</button>
          <button className={activeTab === 'text' ? 'active' : ''} onClick={() => { setActiveTab('text'); handleClearFile(); }}>Text Paste</button>
          <button className={activeTab === 'batch' ? 'active' : ''} onClick={() => { setActiveTab('batch'); handleClearFile(); }}>Batch Import</button>
        </div>
        <div className={`tab-content${activeTab ? ' active' : ''}`}>
          {activeTab === 'file' && (
            <div className="file-upload-area">
              <div
                className="file-dropzone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <FaFolderOpen className="file-folder-icon" />
                {selectedFile ? (
                  <div className="selected-file-row">
                    <span className="selected-file-name">{selectedFile.name}</span>
                    <button className="clear-file-btn" onClick={handleClearFile} title="Clear file"><FaTimes /></button>
                  </div>
                ) : <>
                  <div>Drag and drop a template file here</div>
                  <div>or</div>
                  <label htmlFor="file-upload-input" className="choose-file-btn" style={{ cursor: 'pointer' }}>
                    Choose File
                    <input
                      id="file-upload-input"
                      type="file"
                      accept={SUPPORTED_FORMATS.join(',')}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </label>
                  <div className="supported-formats">Supported formats: .txt, .json, .yml</div>
                </>}
                {fileError && <div className="file-error">{fileError}</div>}
                {parseError && <div className="file-error">{parseError}</div>}
              </div>
            </div>
          )}
          {(activeTab === 'text' || activeTab === 'batch') && (
            <div className={activeTab === 'text' ? 'text-paste-area' : 'batch-import-area'}>
              <textarea
                placeholder={activeTab === 'text' ? 'Paste your template here...' : 'Paste multiple templates here (JSON or text)...'}
                value={fileContent}
                onChange={handleTextChange}
                rows={12}
              />
              {parseError && <div className="file-error">{parseError}</div>}
            </div>
          )}
        </div>
        <div className="template-type-row">
          <label>Template Type</label>
          <select className="styled-select" value={templateType} onChange={e => setTemplateType(e.target.value)}>
            <option value="auto">Auto-detect</option>
            <option value="mql5">MQL5 Documentation</option>
            <option value="component">Component</option>
            <option value="template">General Template</option>
            <option value="python">Python Script</option>
          </select>
        </div>
        <div className="processing-options-row">
          <label>Processing Options</label>
          <div className="processing-options">
            <label className="checkbox-label"><input type="checkbox" checked={processingOptions.extract} onChange={e => setProcessingOptions({...processingOptions, extract: e.target.checked})} /> Extract components</label>
            <label className="checkbox-label"><input type="checkbox" checked={processingOptions.validate} onChange={e => setProcessingOptions({...processingOptions, validate: e.target.checked})} /> Auto validate</label>
            <label className="checkbox-label"><input type="checkbox" checked={processingOptions.detectPython} onChange={e => setProcessingOptions({...processingOptions, detectPython: e.target.checked})} /> Detect Python code blocks</label>
          </div>
        </div>
      </div>
      <div className="format-preview-section">
        <h4>Format Preview</h4>
        <div className="format-preview-box">
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: showFullPreview ? 600 : 220, overflow: 'auto', transition: 'max-height 0.2s' }}>
            {(showFullPreview || !formatPreview)
              ? (formatPreview || `// Template preview will appear here\n{\n  "name": "...",\n  "category": "...",\n  "description": "...",\n  "content": "...",\n  "tags": [],\n  "active": true\n}`)
              : (formatPreview ? formatPreview.split('\n').slice(0, 12).join('\n') + (formatPreview.split('\n').length > 12 ? '\n... (truncated)' : '') : `// Template preview will appear here\n{\n  "name": "...",\n  "category": "...",\n  "description": "...",\n  "content": "...",\n  "tags": [],\n  "active": true\n}`)
            }
          </pre>
          {formatPreview && formatPreview.split('\n').length > 12 && (
            <button
              className="see-full-preview-btn"
              style={{
                marginTop: 8,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 18px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '1rem',
                transition: 'background 0.2s',
              }}
              onClick={() => setShowFullPreview(v => !v)}
            >
              {showFullPreview ? 'Show less' : 'See full preview'}
            </button>
          )}
        </div>
        <div className="preview-actions">
          <button className="cancel-btn" onClick={handleClearFile}>Cancel</button>
          <button className="validate-btn" onClick={handleValidate} disabled={!parsedComponents.length}>Validate</button>
        </div>
      </div>
      {validated && (
        <div className="detected-components-section">
          <div className="detected-header">
            <h4>Detected Components</h4>
            <span className="info-icon-wrapper" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
              <FaInfoCircle className="info-icon" />
              {showTooltip && <span className="tooltip">Select components to import. Click Preview to see details.</span>}
            </span>
          </div>
          <table className="components-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {validComponents.map((comp, idx) => (
                <tr key={comp.component_id || comp.name || idx}>
                  <td><input type="checkbox" checked={selectedComponents[idx]} onChange={e => {
                    const updated = [...selectedComponents];
                    updated[idx] = e.target.checked;
                    setSelectedComponents(updated);
                  }} /></td>
                  <td>{comp.component_id || comp.name}</td>
                  <td>{comp.description}</td>
                  <td><span className="type-badge">{Array.isArray(comp.type) ? comp.type.join(', ') : (comp.type || 'N/A')}</span></td>
                  <td>
                    <button className="preview-btn" onClick={() => setPreviewComponent(comp)}>Preview</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invalidComponents.length > 0 && (
            <div className="file-error">
              {invalidComponents.map((comp, idx) => (
                <div key={idx}>Component {comp.component_id || idx + 1}: {comp.error}</div>
              ))}
            </div>
          )}
          <div className="components-footer-actions">
            <button className="skip-btn" onClick={handleClearFile}>Skip</button>
            <button className="import-all-btn" onClick={handleImport} disabled={!selectedComponents.some(Boolean)}>Import All Selected</button>
          </div>
          {importResult && (
            <div className={importResult.success ? 'alert alert-success' : 'alert alert-error'}>
              {importResult.success ? 'Import successful!' : `Import failed: ${importResult.error}`}
            </div>
          )}
          {previewComponent && (
            <div className="preview-modal-overlay" onClick={() => setPreviewComponent(null)}>
              <div className="preview-modal" onClick={e => e.stopPropagation()}>
                <h4>Component Preview</h4>
                <div style={{
                  maxHeight: 200,
                  overflow: 'auto',
                  background: '#f8f8f8',
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 12,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                }}>
                  {previewComponent.content}
                </div>
                <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f8f8f8', padding: 16, borderRadius: 8 }}>
                  {JSON.stringify(previewComponent, null, 2)}
                </pre>
                <button className="close-preview-btn" onClick={() => setPreviewComponent(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateImportUtility; 