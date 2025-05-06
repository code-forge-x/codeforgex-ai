import React, { useState } from 'react';
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
import ChatWindow from './components/ChatWindow';

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

const UserDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [chatSessions, setChatSessions] = useState([
    { id: Date.now(), name: 'Untitled Chat', messages: [] }
  ]);
  const [selectedSessionId, setSelectedSessionId] = useState(chatSessions[0].id);
  const [tabIndex, setTabIndex] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Helper to get selected session
  const selectedSession = chatSessions.find(s => s.id === selectedSessionId);

  // Start a new chat session
  const handleNewChat = () => {
    const newSession = {
      id: Date.now(),
      name: 'Untitled Chat',
      messages: []
    };
    setChatSessions([newSession, ...chatSessions]);
    setSelectedSessionId(newSession.id);
    setSelectedProject(null);
  };

  // Send a message in the selected session
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };
    setChatSessions(sessions =>
      sessions.map(session =>
        session.id === selectedSessionId
          ? { ...session, messages: [...session.messages, msg] }
          : session
      )
    );
    setChatInput('');
  };

  // Create a new project
  const handleCreateProject = (projectData) => {
    const newProject = {
      id: Date.now(),
      ...projectData,
      createdAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    setShowNewProjectModal(false);
  };

  // Select a chat session
  const handleSelectSession = (id) => {
    setSelectedSessionId(id);
    setSelectedProject(null);
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#181818', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
        height: '100%',
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
          {/* Sidebar */}
          <Box sx={{
            flexShrink: 0,
            width: SIDEBAR_WIDTH,
            height: '100%',
            minHeight: 0,
            bgcolor: 'background.paper',
            borderRight: '2px solid #444',
            borderTopRightRadius: 3,
            borderBottomRightRadius: 3,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            pl: 0,
            pr: 2,
            pt: 0,
            pb: 2,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            boxSizing: 'border-box',
            gap: 3,
            boxShadow: undefined,
            transition: undefined,
            ml: 1,
            overflowX: 'hidden',
          }}>
            <Sidebar
              projects={projects}
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onNewProjectClick={() => setShowNewProjectModal(true)}
              chatSessions={chatSessions}
              onNewChat={handleNewChat}
              onSelectSession={handleSelectSession}
              selectedSessionId={selectedSessionId}
              drawerWidth={SIDEBAR_WIDTH}
              noMessageTextProps={{ sx: { color: '#bbb', fontStyle: 'italic', fontWeight: 500, fontSize: 14 } }}
            />
          </Box>
          {/* Main area: Chat Window and Tabs Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, gap: SECTION_GAP }}>
              {/* Chat Window as its own bordered card */}
              <Box sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                height: 'calc(90% + 28px)',
                maxHeight: 'calc(90% + 28px)',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#232323',
                border: '2px solid #444',
                borderRadius: 3,
                boxSizing: 'border-box',
                mt: 2,
                mb: 2,
                mr: 0,
                overflow: 'hidden',
              }}>
                <ChatWindow chatHistory={chatHistory} setChatHistory={setChatHistory} />
              </Box>
              {/* Tabs Section as its own bordered card */}
              <Box sx={{ mr: 2, ml: 0, height: 'calc(90% + 28px)', maxHeight: 'calc(90% + 28px)', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, mt: 2, mb: 2 }}>
                <Box sx={{
                  flex: 1,
                  minWidth: 380,
                  minHeight: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #444',
                  borderRadius: 3,
                  boxSizing: 'border-box',
                  bgcolor: '#181818',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
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
                  <Box sx={{ flex: 1, p: 0, overflow: 'auto', bgcolor: '#181818' }}>
                    {tabIndex === 0 && (
                      <Paper sx={{ bgcolor: '#232323', color: '#fff', p: 2, m: 0, minHeight: 300 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Code Editor</Typography>
                        <Typography variant="body2" sx={{ color: '#bbb' }}>[Your code editor component goes here]</Typography>
                      </Paper>
                    )}
                    {tabIndex === 1 && (
                      <Paper sx={{ bgcolor: '#232323', color: '#fff', p: 2, m: 0, minHeight: 300 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Blueprint</Typography>
                        <Typography variant="body2" sx={{ color: '#bbb' }}>[Blueprint content goes here]</Typography>
                      </Paper>
                    )}
                    {tabIndex === 2 && (
                      <Paper sx={{ bgcolor: '#232323', color: '#fff', p: 2, m: 0, minHeight: 300 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Preview</Typography>
                        <Typography variant="body2" sx={{ color: '#bbb' }}>[Preview content goes here]</Typography>
                      </Paper>
                    )}
                    {tabIndex === 3 && (
                      <Paper sx={{ bgcolor: '#232323', color: '#fff', p: 2, m: 0, minHeight: 300 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Documentation</Typography>
                        <Typography variant="body2" sx={{ color: '#bbb' }}>[Documentation content goes here]</Typography>
                      </Paper>
                    )}
                  </Box>
                </Box>
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
        {showNewProjectModal && (
          <NewProjectModal
            onClose={() => setShowNewProjectModal(false)}
            onCreateProject={handleCreateProject}
          />
        )}
      </Box>
    </Box>
  );
};

export default UserDashboard;