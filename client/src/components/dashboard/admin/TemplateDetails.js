import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tooltip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CodeIcon from '@mui/icons-material/Code';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import axios from 'axios';
import PromptTemplateForm from './PromptTemplateForm';
import PromptComponentList from './PromptComponentList';
import PromptPerformance from './PromptPerformance';
import API_URL from '../../../api';
import { diffLines, diffWords, diffWordsWithSpace } from 'diff';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, ghcolors, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && children}
    </div>
  );
}

export default function TemplateDetails({ template, onBack, onUpdate }) {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activateDialog, setActivateDialog] = useState({ open: false, version: null });
  const [copySuccess, setCopySuccess] = useState(false);
  const [compareDialog, setCompareDialog] = useState({ open: false, versions: [] });
  const [selectedVersions, setSelectedVersions] = useState({ from: '', to: '' });
  const [versionDetails, setVersionDetails] = useState({});
  const [diffView, setDiffView] = useState('unified');
  const [diffType, setDiffType] = useState('words');
  const [theme, setTheme] = useState('vscDarkPlus');

  const themes = {
    vscDarkPlus: { name: 'VS Code Dark', value: vscDarkPlus },
    ghcolors: { name: 'GitHub', value: ghcolors },
    atomDark: { name: 'Atom Dark', value: atomDark }
  };

  useEffect(() => {
    const fetchVersionHistory = async () => {
      if (!template?._id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/prompts/templates/${template._id}/versions`);
        if (response.data.versions) {
          // Sort versions by version number in descending order
          const sortedVersions = response.data.versions.sort((a, b) => b.version - a.version);
          setVersionHistory(sortedVersions);
        } else {
          setVersionHistory([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch version history');
        setVersionHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVersionHistory();
  }, [template?._id]); // Only re-fetch when template ID changes

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleEditClose = () => {
    setEditMode(false);
  };

  const handleEditSuccess = async (updatedTemplate) => {
    setEditMode(false);
    setSuccess('New version created successfully');
    
    // Refresh version history
    try {
      const response = await axios.get(`${API_URL}/prompts/templates/${template._id}/versions`);
      if (response.data.versions) {
        // Sort versions by version number in descending order
        const sortedVersions = response.data.versions.sort((a, b) => b.version - a.version);
        setVersionHistory(sortedVersions);
        
        // Update the current template with the latest version
        const latestVersion = sortedVersions[0];
        if (latestVersion) {
          if (onUpdate) {
            onUpdate(latestVersion);
          }
        }
      }
    } catch (err) {
      console.error('Error refreshing version history:', err);
      setError('Failed to refresh version history');
    }
  };

  const handleActivateVersion = async (version) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/prompts/templates/${version._id}/activate`);
      setActivateDialog({ open: false, version: null });
      setSuccess(response.data.message || 'Version activated successfully');
      
      // Refresh version history
      const versionResponse = await axios.get(`${API_URL}/prompts/templates/${template._id}/versions`);
      setVersionHistory(versionResponse.data.versions || []);
      
      // Update the current template with the activated version
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate version');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(template.content)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        setError('Failed to copy content to clipboard');
      });
  };

  const openActivateDialog = (version) => {
    setActivateDialog({ open: true, version });
  };

  const closeActivateDialog = () => {
    setActivateDialog({ open: false, version: null });
  };

  const handleCompareVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fromVersion, toVersion] = await Promise.all([
        axios.get(`${API_URL}/prompts/templates/${selectedVersions.from}`),
        axios.get(`${API_URL}/prompts/templates/${selectedVersions.to}`)
      ]);
      setVersionDetails({
        from: fromVersion.data,
        to: toVersion.data
      });
      setCompareDialog({ open: true, versions: [fromVersion.data, toVersion.data] });
    } catch (err) {
      setError('Failed to fetch version details for comparison');
    } finally {
      setLoading(false);
    }
  };

  const openCompareDialog = () => {
    setCompareDialog({ open: true, versions: [] });
  };

  const closeCompareDialog = () => {
    setCompareDialog({ open: false, versions: [] });
    setSelectedVersions({ from: '', to: '' });
    setVersionDetails({});
  };

  const renderDiff = (oldText, newText) => {
    let differences;
    switch (diffType) {
      case 'words':
        differences = diffWords(oldText, newText);
        break;
      case 'wordsWithSpace':
        differences = diffWordsWithSpace(oldText, newText);
        break;
      case 'lines':
        differences = diffLines(oldText, newText);
        break;
      default:
        differences = diffWords(oldText, newText);
    }

    return (
      <Box sx={{ 
        fontFamily: 'monospace', 
        whiteSpace: 'pre-wrap',
        fontSize: '0.9rem',
        lineHeight: 1.5
      }}>
        {differences.map((part, index) => (
          <span
            key={index}
            style={{
              backgroundColor: part.added ? '#a5d6a7' : part.removed ? '#ef9a9a' : 'transparent',
              color: part.added || part.removed ? '#000' : 'inherit',
              padding: '0 2px',
              borderRadius: '2px',
              display: 'inline-block'
            }}
          >
            {part.value}
          </span>
        ))}
      </Box>
    );
  };

  const renderSplitDiff = (oldText, newText) => {
    const differences = diffLines(oldText, newText);
    let lineNumber = 1;

    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Previous Version
          </Typography>
          <Box sx={{ 
            fontFamily: 'monospace', 
            whiteSpace: 'pre-wrap',
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            maxHeight: '400px',
            overflow: 'auto',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            {differences.map((part, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: part.removed ? '#ffebee' : 'transparent',
                  color: part.removed ? '#c62828' : 'inherit',
                  padding: '2px 0',
                  display: 'flex'
                }}
              >
                <span style={{ 
                  color: '#666', 
                  paddingRight: '8px', 
                  userSelect: 'none',
                  minWidth: '40px',
                  textAlign: 'right'
                }}>
                  {part.removed ? lineNumber++ : ''}
                </span>
                <span>{part.removed ? `- ${part.value}` : part.value}</span>
              </div>
            ))}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            New Version
          </Typography>
          <Box sx={{ 
            fontFamily: 'monospace', 
            whiteSpace: 'pre-wrap',
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            maxHeight: '400px',
            overflow: 'auto',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            {differences.map((part, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: part.added ? '#e8f5e9' : 'transparent',
                  color: part.added ? '#2e7d32' : 'inherit',
                  padding: '2px 0',
                  display: 'flex'
                }}
              >
                <span style={{ 
                  color: '#666', 
                  paddingRight: '8px', 
                  userSelect: 'none',
                  minWidth: '40px',
                  textAlign: 'right'
                }}>
                  {part.added ? lineNumber++ : ''}
                </span>
                <span>{part.added ? `+ ${part.value}` : part.value}</span>
              </div>
            ))}
          </Box>
        </Grid>
      </Grid>
    );
  };

  const renderVersionComparison = () => {
    if (!versionDetails.from || !versionDetails.to) return null;

    const { from, to } = versionDetails;
    const changes = [];

    // Compare content
    if (from.content !== to.content) {
      changes.push({
        field: 'Content',
        from: from.content || '',
        to: to.content || '',
        type: 'content'
      });
    }

    // Compare description
    if (from.description !== to.description) {
      changes.push({
        field: 'Description',
        from: from.description || '',
        to: to.description || '',
        type: 'text'
      });
    }

    // Compare parameters
    const fromParams = new Map((from.parameters || []).map(p => [p.name, p]));
    const toParams = new Map((to.parameters || []).map(p => [p.name, p]));
    
    // Find added, removed, and modified parameters
    (from.parameters || []).forEach(param => {
      if (!toParams.has(param.name)) {
        changes.push({
          field: 'Parameters',
          type: 'removed',
          param: param
        });
      } else {
        const toParam = toParams.get(param.name);
        if (JSON.stringify(param) !== JSON.stringify(toParam)) {
          changes.push({
            field: 'Parameters',
            type: 'modified',
            from: param,
            to: toParam
          });
        }
      }
    });

    (to.parameters || []).forEach(param => {
      if (!fromParams.has(param.name)) {
        changes.push({
          field: 'Parameters',
          type: 'added',
          param: param
        });
      }
    });

    return (
      <Box sx={{ mt: 2 }}>
        {/* Version Metadata */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  From Version
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2">{from.createdBy || 'Unknown'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {from.createdAt ? new Date(from.createdAt).toLocaleString() : 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  To Version
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2">{to.createdBy || 'Unknown'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {to.createdAt ? new Date(to.createdAt).toLocaleString() : 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Diff View Controls */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                View Mode
              </Typography>
              <ButtonGroup size="small">
                <Button
                  variant={diffView === 'unified' ? 'contained' : 'outlined'}
                  onClick={() => setDiffView('unified')}
                  startIcon={<TextFieldsIcon />}
                >
                  Unified
                </Button>
                <Button
                  variant={diffView === 'split' ? 'contained' : 'outlined'}
                  onClick={() => setDiffView('split')}
                  startIcon={<CompareArrowsIcon />}
                >
                  Split
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Diff Type
              </Typography>
              <ButtonGroup size="small">
                <Button
                  variant={diffType === 'words' ? 'contained' : 'outlined'}
                  onClick={() => setDiffType('words')}
                >
                  Words
                </Button>
                <Button
                  variant={diffType === 'wordsWithSpace' ? 'contained' : 'outlined'}
                  onClick={() => setDiffType('wordsWithSpace')}
                >
                  Words with Space
                </Button>
                <Button
                  variant={diffType === 'lines' ? 'contained' : 'outlined'}
                  onClick={() => setDiffType('lines')}
                >
                  Lines
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Theme
              </Typography>
              <ToggleButtonGroup
                value={theme}
                exclusive
                onChange={(e, newTheme) => newTheme && setTheme(newTheme)}
                size="small"
              >
                {Object.entries(themes).map(([key, { name }]) => (
                  <ToggleButton key={key} value={key}>
                    {name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>

        {/* Changes */}
        <Typography variant="h6" gutterBottom>Changes</Typography>
        {changes.length === 0 ? (
          <Alert severity="info">No changes found between versions.</Alert>
        ) : (
          changes.map((change, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {change.field}
              </Typography>
              {change.field === 'Parameters' ? (
                <Box>
                  <Typography variant="body2" color="error">
                    {change.type === 'removed' && `Removed parameter: ${change.param.name}`}
                    {change.type === 'added' && `Added parameter: ${change.param.name}`}
                    {change.type === 'modified' && `Modified parameter: ${change.from.name}`}
                  </Typography>
                  {change.type === 'modified' && (
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Property</TableCell>
                            <TableCell>Old Value</TableCell>
                            <TableCell>New Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.keys(change.from).map(key => (
                            change.from[key] !== change.to[key] && (
                              <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                <TableCell>
                                  <SyntaxHighlighter
                                    language="json"
                                    style={themes[theme].value}
                                    customStyle={{ 
                                      margin: 0, 
                                      padding: '8px',
                                      fontSize: '0.9rem',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {JSON.stringify(change.from[key], null, 2)}
                                  </SyntaxHighlighter>
                                </TableCell>
                                <TableCell>
                                  <SyntaxHighlighter
                                    language="json"
                                    style={themes[theme].value}
                                    customStyle={{ 
                                      margin: 0, 
                                      padding: '8px',
                                      fontSize: '0.9rem',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {JSON.stringify(change.to[key], null, 2)}
                                  </SyntaxHighlighter>
                                </TableCell>
                              </TableRow>
                            )
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              ) : change.type === 'content' ? (
                diffView === 'unified' ? (
                  <Box sx={{ 
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}>
                    {renderDiff(change.from, change.to)}
                  </Box>
                ) : (
                  renderSplitDiff(change.from, change.to)
                )
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">From:</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {change.from}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">To:</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {change.to}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Paper>
          ))
        )}
      </Box>
    );
  };

  if (!template) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Template not found</Alert>
        <Button onClick={onBack} sx={{ mt: 2 }}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with back button and breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs>
          <Link color="inherit" onClick={onBack} sx={{ cursor: 'pointer' }}>
            Templates
          </Link>
          <Typography color="text.primary">{template.name}</Typography>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Template Info */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{template.name}</Typography>
          <Box>
            <Tooltip title="Edit Template">
              <IconButton onClick={handleEdit} color="primary" sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Content">
              <IconButton onClick={handleCopyContent} color="primary">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {template.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip
            label={template.active ? 'Active' : 'Inactive'}
            color={template.active ? 'success' : 'default'}
            size="small"
          />
          <Chip
            label={`Version ${template.version}`}
            color="default"
            size="small"
          />
          <Chip
            label={template.category}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Template" />
          <Tab label="Components" />
          <Tab label="Performance" />
          <Tab label="Versions" />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ p: 2 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ whiteSpace: 'pre-wrap', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              {template.content}
            </Box>
            {template.parameters && template.parameters.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Parameters</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Default Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {template.parameters.map((param) => (
                        <TableRow key={param.name}>
                          <TableCell>{param.name}</TableCell>
                          <TableCell>{param.description}</TableCell>
                          <TableCell>{param.type}</TableCell>
                          <TableCell>{param.required ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{param.defaultValue || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <PromptComponentList templateId={template._id} />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <PromptPerformance templateId={template._id} />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Version History</Typography>
                <Button
                  variant="outlined"
                  startIcon={<CompareArrowsIcon />}
                  onClick={openCompareDialog}
                  disabled={versionHistory.length < 2}
                >
                  Compare Versions
                </Button>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : versionHistory.length === 0 ? (
                <Alert severity="info">No version history available.</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Version</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created By</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Changes</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {versionHistory.map((version, index) => (
                        <TableRow 
                          key={version._id}
                          sx={{ 
                            bgcolor: version.active ? 'action.hover' : 'inherit',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <TableCell>{version.version}</TableCell>
                          <TableCell>
                            <Chip
                              label={version.active ? 'Active' : 'Inactive'}
                              color={version.active ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{version.createdBy}</TableCell>
                          <TableCell>
                            {new Date(version.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {index > 0 && (
                              <Button
                                size="small"
                                onClick={() => {
                                  setSelectedVersions({
                                    from: versionHistory[index - 1]._id,
                                    to: version._id
                                  });
                                  handleCompareVersions();
                                }}
                              >
                                View Changes
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            {!version.active && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openActivateDialog(version)}
                                disabled={loading}
                              >
                                Activate
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </TabPanel>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <PromptTemplateForm
        open={editMode}
        onClose={handleEditClose}
        template={template}
        onSuccess={handleEditSuccess}
      />

      {/* Activate Version Dialog */}
      <Dialog open={activateDialog.open} onClose={closeActivateDialog}>
        <DialogTitle>Activate Version</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to activate version {activateDialog.version?.version}?
            This will deactivate the currently active version.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActivateDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => handleActivateVersion(activateDialog.version)}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Activating...' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        message="Content copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Compare Versions Dialog */}
      <Dialog 
        open={compareDialog.open} 
        onClose={closeCompareDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Compare Versions</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={5}>
                <FormControl fullWidth>
                  <InputLabel>From Version</InputLabel>
                  <Select
                    value={selectedVersions.from}
                    onChange={(e) => setSelectedVersions(prev => ({ ...prev, from: e.target.value }))}
                    label="From Version"
                  >
                    {versionHistory.map(version => (
                      <MenuItem key={version._id} value={version._id}>
                        Version {version.version}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'center' }}>
                <CompareArrowsIcon />
              </Grid>
              <Grid item xs={5}>
                <FormControl fullWidth>
                  <InputLabel>To Version</InputLabel>
                  <Select
                    value={selectedVersions.to}
                    onChange={(e) => setSelectedVersions(prev => ({ ...prev, to: e.target.value }))}
                    label="To Version"
                  >
                    {versionHistory.map(version => (
                      <MenuItem key={version._id} value={version._id}>
                        Version {version.version}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handleCompareVersions}
                disabled={!selectedVersions.from || !selectedVersions.to || loading}
              >
                Compare
              </Button>
            </Box>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderVersionComparison()
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCompareDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 