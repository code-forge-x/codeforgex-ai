import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import NewProjectModal from './components/NewProjectModal';
import ChatWindow from './ChatWindow';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import axios from 'axios';
import Button from '@mui/material/Button';
import API_BASE_URL from '../../../api';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useNotification } from '../../../context/NotificationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Chat session structure: { id, name, messages: [] }

const tabLabels = ['Code Editor', 'Blueprint', 'Preview', 'Documentation'];
const progressTabs = [
  'Requirements',
  'Blueprint Generation',
  'Component Generation',
  'Technical Support',
];
const SIDEBAR_WIDTH = 185;
const SECTION_GAP = 2; // theme.spacing(2) = 16px
const TOPBAR_HEIGHT = 44;
const PROGRESS_TABS_HEIGHT = 48;
const AVAILABLE_HEIGHT = `calc(100vh - ${TOPBAR_HEIGHT}px - ${PROGRESS_TABS_HEIGHT}px)`;

const phaseSteps = [
  'Requirements',
  'Blueprint Generation',
  'Component Generation',
  'Technical Support',
  'Approval',
  'Completed'
];

// Mock analytics data
const codeGenData = [
  { date: '2024-06-01', count: 3 },
  { date: '2024-06-02', count: 5 },
  { date: '2024-06-03', count: 2 },
  { date: '2024-06-04', count: 7 },
  { date: '2024-06-05', count: 4 },
];
const feedbackData = [
  { rating: '5★', count: 12 },
  { rating: '4★', count: 7 },
  { rating: '3★', count: 2 },
  { rating: '2★', count: 1 },
  { rating: '1★', count: 0 },
];

const UserDashboard = () => {
  const { notify } = useNotification();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [session, setSession] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blueprintEditMode, setBlueprintEditMode] = useState(false);
  const [blueprintDraft, setBlueprintDraft] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/projects/current`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.session) {
          setSession(response.data.session);
        }
      } catch (err) {
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  // When session changes, update blueprintDraft if not editing
  useEffect(() => {
    if (session && session.context_data && !blueprintEditMode) {
      setBlueprintDraft(session.context_data.blueprint || '');
    }
  }, [session, blueprintEditMode]);

  const handleContextUpdate = (updatedSession) => {
    setSession(updatedSession);
    if (selectedProject && updatedSession && selectedProject.project_id === updatedSession.project_id) {
      setSelectedProject({ ...selectedProject, context_data: { ...updatedSession.context_data } });
    }
  };

  const handlePhaseAction = async (action) => {
    if (!session) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/projects/${session.project_id}/advance`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.session) {
        setSession(res.data.session);
        if (selectedProject && res.data.session.project_id === selectedProject.project_id) {
          setSelectedProject({ ...selectedProject, context_data: { ...res.data.session.context_data } });
        }
        // If approving blueprint, auto-switch to Blueprint tab
        if (action === 'approve' && res.data.session.current_phase.toLowerCase().includes('blueprint')) {
          setTabIndex(1); // Switch to Blueprint tab
        }
        // Show a notification based on the action
        let notificationMessage = '';
        switch (action) {
          case 'advance':
            notificationMessage = `Advanced to ${res.data.session.current_phase} phase`;
            break;
          case 'approve':
            notificationMessage = 'Phase approved';
            break;
          case 'reject':
            notificationMessage = 'Phase rejected';
            break;
          case 'edit':
            notificationMessage = 'Edit requested';
            break;
          case 'restart':
            notificationMessage = 'Workflow restarted';
            break;
          default:
            notificationMessage = 'Action completed';
        }
        console.log(notificationMessage);
      }
    } catch (err) {
      console.error('Error advancing phase:', err);
      setError('Failed to update phase: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Blueprint tab approve/reject/edit handlers
  const handleBlueprintApprove = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Save blueprint to context_data
      const putRes = await axios.put(
        `${API_BASE_URL}/api/projects/${session.project_id}/update`,
        { context_data: { ...session.context_data, blueprint: blueprintDraft } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (putRes.data && putRes.data.session && selectedProject && putRes.data.session.project_id === selectedProject.project_id) {
        setSelectedProject({ ...selectedProject, context_data: { ...putRes.data.session.context_data } });
      }
      // Approve phase
      await handlePhaseAction('approve');
      setBlueprintEditMode(false);
    } catch (err) {
      setError('Failed to approve blueprint: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  const handleBlueprintReject = async () => {
    await handlePhaseAction('reject');
    setBlueprintEditMode(true);
  };
  const handleBlueprintEdit = () => {
    setBlueprintEditMode(true);
  };
  const handleBlueprintSaveEdit = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const putRes = await axios.put(
        `${API_BASE_URL}/api/projects/${session.project_id}/update`,
        { context_data: { ...session.context_data, blueprint: blueprintDraft } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (putRes.data && putRes.data.session && selectedProject && putRes.data.session.project_id === selectedProject.project_id) {
        setSelectedProject({ ...selectedProject, context_data: { ...putRes.data.session.context_data } });
      }
      setBlueprintEditMode(false);
    } catch (err) {
      setError('Failed to save blueprint: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Helper to get tab content from selectedProject context_data
  const getTabContent = (tab) => {
    if (!selectedProject || !selectedProject.context_data) return '[No data]';
    switch (tab) {
      case 'Code Editor':
        return selectedProject.context_data.code || '[Your code editor component goes here]';
      case 'Blueprint':
        return selectedProject.context_data.blueprint || '[Blueprint content goes here]';
      case 'Preview':
        return selectedProject.context_data.preview || '[Preview content goes here]';
      case 'Documentation':
        return selectedProject.context_data.documentation || '[Documentation content goes here]';
      default:
        return '[No data]';
    }
  };

  // Handler for download/export
  const handleDownload = async () => {
    if (!selectedProject) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${selectedProject.project_id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project_${selectedProject.project_id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading...</Typography></Box>;
  }
  if (error) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Code Generations Over Time</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={codeGenData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#1976d2" name="Code Generations" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Feedback Ratings</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={feedbackData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="count" fill="#ff9800" name="Ratings" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={2}>
          <Sidebar
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            setShowNewProjectModal={setShowNewProjectModal}
          />
        </Grid>
        {/* Main Content */}
        <Grid item xs={12} md={10}>
          <Paper sx={{ p: 2, minHeight: '80vh' }}>
      {/* Top Bar (fixed) */}
      <Box sx={{
        width: '100vw',
        height: `${TOPBAR_HEIGHT}px`,
        bgcolor: '#232323',
        py: 1,
        textAlign: 'center',
        borderBottom: '1px solid #333',
        m: 0,
        zIndex: 100,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, letterSpacing: 1 }}>
          Welcome to CodeForegex
        </Typography>
      </Box>
      {/* Main Content (fills between top bar and progress tabs) */}
      <Box sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flex: 1,
        minHeight: 0,
        my: 1,
              height: AVAILABLE_HEIGHT,
              bgcolor: '#181818',
              pb: `${PROGRESS_TABS_HEIGHT}px`, // Prevent overlap with bottom bar
              boxSizing: 'border-box',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100vw',
          flex: 1,
          minHeight: 0,
          height: '100%',
          alignItems: 'stretch',
          bgcolor: '#181818',
          gap: SECTION_GAP,
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        }}>
                {/* ChatWindow Card */}
          <Box sx={{
                  width: 600,
                  minWidth: 420,
                  maxWidth: 700,
                  height: AVAILABLE_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
                  bgcolor: '#181818',
                  boxShadow: 'none',
                  m: 0,
                  p: 0,
                  border: 'none',
                  borderRadius: 0,
                  overflow: 'hidden',
                  alignSelf: 'flex-start',
                  minHeight: 0,
                }}>
                  {session ? (
                    <ChatWindow 
                      session={session} 
                      currentPhase={session.current_phase || 'requirements'} 
                      onPhaseAction={handlePhaseAction} 
                      onContextUpdate={handleContextUpdate} 
                    />
                  ) : (
                    <Box sx={{ p: 2 }}><Typography>Loading chat session...</Typography></Box>
                  )}
          </Box>
                {/* Main content (tabs) */}
                <Box sx={{
                  flex: 1,
                  minWidth: 0,
                  height: AVAILABLE_HEIGHT,
                  maxHeight: AVAILABLE_HEIGHT,
                  display: 'flex',
                  flexDirection: 'column',
                  ml: 0,
                  mt: 2,
                  mb: 2,
                  bgcolor: '#181818',
                  border: '2px solid #444',
                  borderRadius: 3,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  minHeight: 0,
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, gap: SECTION_GAP }}>
                  <Tabs
                    value={tabIndex}
                    onChange={(_, v) => setTabIndex(v)}
                    sx={{ bgcolor: '#232323', color: '#fff', borderBottom: '1px solid #222', px: 2, flexShrink: 0 }}
                    TabIndicatorProps={{ sx: { bgcolor: '#ff9800' } }}
                  >
                    {tabLabels.map((label, idx) => (
                      <Tab key={label} label={label} sx={{ color: '#fff', fontWeight: 600, bgcolor: tabIndex === idx ? '#fff' : 'transparent', color: tabIndex === idx ? '#232323' : '#fff', borderRadius: 2, mx: 1, minWidth: 120 }} />
                    ))}
                  </Tabs>
                  <Box sx={{ width: '100%', borderBottom: '1px solid #333' }} />
                    <Box sx={{ flex: 1, p: 0, overflow: 'auto', bgcolor: '#181818', minHeight: 0 }}>
                    {tabIndex === 0 && (
                        <Paper sx={{ bgcolor: '#232323', color: '#fff', p: 2, m: 0, minHeight: 300, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Code Editor</Typography>
                          <Box sx={{
                            bgcolor: '#181818',
                            borderRadius: 3,
                            p: 2,
                            mb: 2,
                            boxShadow: 2,
                            border: '1.5px solid #444',
                            overflowX: 'auto',
                            width: '100%',
                            maxWidth: '100%',
                            minWidth: 0,
                            display: 'block',
                            flex: 1,
                            boxSizing: 'border-box',
                          }}>
                            <ReactMarkdown
                              children={getTabContent('Code Editor')}
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const codeString = String(children).replace(/\n$/, '');
                                  return !inline ? (
                                    <Box sx={{ position: 'relative', mb: 1, width: '100%', maxWidth: '100%', minWidth: 0, display: 'block', flex: 1 }}>
                                      <IconButton
                                        size="small"
                                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: '#333', color: '#fff', '&:hover': { bgcolor: '#1976d2' } }}
                                        onClick={() => copyToClipboard(codeString)}
                                        title="Copy code"
                                      >
                                        <ContentCopyIcon fontSize="small" />
                                      </IconButton>
                                      <SyntaxHighlighter
                                        style={oneDark}
                                        language={match ? match[1] : 'plaintext'}
                                        PreTag="div"
                                        customStyle={{ borderRadius: 10, fontSize: 15, margin: '8px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: '1.5px solid #444', overflowX: 'auto', width: '100%', maxWidth: '100%', minWidth: 0, display: 'block', flex: 1 }}
                                        {...props}
                                      >
                                        {codeString}
                                      </SyntaxHighlighter>
                                    </Box>
                                  ) : (
                                    <code style={{ background: '#333', color: '#fff', borderRadius: 4, padding: '2px 6px' }} {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            />
                          </Box>
                          {selectedProject?.status === 'completed' && (
                            <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={handleDownload}>
                              Download Project
                            </Button>
                          )}
                      </Paper>
                    )}
                    {tabIndex === 1 && (
                      <Paper sx={{ bgcolor: '#232323', color: '#fff', p: 2, m: 0, minHeight: 300 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Blueprint</Typography>
                          {/* Approve/Reject/Edit buttons above blueprint content */}
                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            {!blueprintEditMode && (
                              <>
                                <Button variant="contained" color="success" onClick={handleBlueprintApprove} sx={{ fontWeight: 600, borderRadius: 2 }}>Approve</Button>
                                <Button variant="outlined" color="error" onClick={handleBlueprintReject} sx={{ fontWeight: 600, borderRadius: 2 }}>Reject</Button>
                                <Button variant="outlined" color="warning" onClick={handleBlueprintEdit} sx={{ fontWeight: 600, borderRadius: 2 }}>Edit</Button>
                              </>
                            )}
                            {blueprintEditMode && (
                              <>
                                <Button variant="contained" color="primary" onClick={handleBlueprintSaveEdit} sx={{ fontWeight: 600, borderRadius: 2 }}>Save</Button>
                                <Button variant="outlined" color="secondary" onClick={() => setBlueprintEditMode(false)} sx={{ fontWeight: 600, borderRadius: 2 }}>Cancel</Button>
                              </>
                            )}
                          </Box>
                          {blueprintEditMode ? (
                            <TextField
                              multiline
                              minRows={10}
                              fullWidth
                              value={blueprintDraft}
                              onChange={e => setBlueprintDraft(e.target.value)}
                              sx={{ bgcolor: '#181818', color: '#fff', borderRadius: 2, '& .MuiInputBase-input': { color: '#fff' } }}
                              InputProps={{ sx: { color: '#fff' } }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: '#bbb', whiteSpace: 'pre-wrap' }}>{blueprintDraft || '[Blueprint content goes here]'}</Typography>
                          )}
                      </Paper>
                    )}
                    {tabIndex === 2 && (
                      <Paper sx={{ bgcolor: '#232323', color: '#fff', p: 2, m: 0, minHeight: 300 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Preview</Typography>
                          <Typography variant="body2" sx={{ color: '#bbb', whiteSpace: 'pre-wrap' }}>{getTabContent('Preview')}</Typography>
                      </Paper>
                    )}
                    {tabIndex === 3 && (
                      <Paper sx={{ bgcolor: '#232323', color: '#fff', p: 2, m: 0, minHeight: 300 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Documentation</Typography>
                          <Typography variant="body2" sx={{ color: '#bbb', whiteSpace: 'pre-wrap' }}>{getTabContent('Documentation')}</Typography>
                      </Paper>
                    )}
              </Box>
            </Box>
            {/* Progress Tabs docked at the very bottom of the main area */}
            <Box sx={{
              width: '100%',
              height: `${PROGRESS_TABS_HEIGHT}px`,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: '#232323',
              borderTop: '1.5px solid #444',
              px: 3,
              py: 1,
              gap: 2,
              flexShrink: 0,
              borderRadius: 0,
              mt: 0,
              mb: 4,
            }}>
              {progressTabs.map((label, idx) => (
                <Box key={label} sx={{
                  flex: 1,
                  textAlign: 'center',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: 15,
                  borderRadius: 2,
                  border: '1.5px solid #444',
                  py: 0.5,
                  mx: 1,
                  background: '#232323',
                  letterSpacing: 0.5,
                }}>
                  {label}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
            </Box>
            {/* Timeline Tabs (bottom) */}
            <Box sx={{
              width: '100vw',
              height: `${PROGRESS_TABS_HEIGHT}px`,
              bgcolor: '#232323',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: '1.5px solid #333',
              position: 'fixed',
              left: 0,
              bottom: 0,
              zIndex: 100,
            }}>
              {progressTabs.map((label, idx) => (
                <Button
                  key={label}
                  variant="text"
                  sx={{
                    color: tabIndex === idx ? '#ff9800' : '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    borderRadius: 2,
                    mx: 2,
                    px: 3,
                    py: 1.5,
                    bgcolor: tabIndex === idx ? '#23272f' : 'transparent',
                    borderBottom: tabIndex === idx ? '3px solid #ff9800' : 'none',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setTabIndex(idx)}
                >
                  {label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
          <NewProjectModal
        open={showNewProjectModal}
            onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={setSelectedProject}
          />
    </Container>
  );
};

export default UserDashboard;