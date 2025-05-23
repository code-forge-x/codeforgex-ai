import React, { useState } from 'react';
// import './TemplateImportUtility.css'; // Remove old CSS import
import { FaInfoCircle, FaFolderOpen, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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
  const { notify } = useNotification();
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
      notify('Unsupported file type. Please select a .txt, .json, or .yml file.', 'error');
      setSelectedFile(null);
      setFileContent('');
      setFormatPreview('');
      setParsedComponents([]);
      setValidated(false);
      return;
    }
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
        notify('Unsupported file type. Please select a .txt, .json, or .yml file.', 'error');
        setSelectedFile(null);
        setFileContent('');
        setFormatPreview('');
        setParsedComponents([]);
        setValidated(false);
        return;
      }
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
    setValidated(false);
    setValidComponents([]);
    setInvalidComponents([]);
    setSelectedComponents([]);
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
        notify(res.data.error || 'Failed to parse file.', 'error');
        setFormatPreview('');
        setParsedComponents([]);
      }
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to parse file.', 'error');
      setFormatPreview('');
      setParsedComponents([]);
    }
  };

  // Validate components
  const handleValidate = async () => {
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
        notify('Validation failed.', 'error');
      }
    } catch (err) {
      setValidated(false);
      setValidComponents([]);
      setInvalidComponents([]);
      notify('Validation failed.', 'error');
    }
  };

  // Import selected components
  const handleImport = async () => {
    const toImport = validComponents.filter((_, idx) => selectedComponents[idx]);
    try {
      const res = await axios.post('http://localhost:5000/api/template-import/import', {
        components: toImport,
      });
      if (res.data.success) {
        notify('Import successful!', 'success');
        setTimeout(() => {
          navigate('/admin/dashboard/components');
        }, 1000);
      } else {
        notify(res.data.error || 'Import failed.', 'error');
      }
    } catch (err) {
      notify(err.response?.data?.error || 'Import failed.', 'error');
    }
  };

  // UI rendering
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, minHeight: 300 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Template Import Utility
            </Typography>
            {/* All feedback now uses global notification system */}
            {/* TODO: Migrate stepper, file upload, and controls to MUI */}
            {/* Example: File Upload Dialog (for future use) */}
            {/* <Dialog open={showFileDialog} onClose={handleCloseFileDialog} maxWidth="sm" fullWidth>
              <DialogTitle>Upload File</DialogTitle>
              <DialogContent>
                <TextField
                  margin="normal"
                  label="File Path"
                  fullWidth
                  value={filePath}
                  onChange={handleFilePathChange}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseFileDialog}>Cancel</Button>
                <Button onClick={handleFileUpload} variant="contained">Upload</Button>
              </DialogActions>
            </Dialog> */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TemplateImportUtility; 