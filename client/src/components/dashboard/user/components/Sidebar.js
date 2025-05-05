import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

const Sidebar = ({ projects, selectedProject, onProjectSelect, onNewProjectClick, chatSessions, onNewChat, onSelectSession, selectedSessionId, drawerWidth }) => {
  return (
    <Box
      sx={{
        width: drawerWidth,
        height: '100vh',
        bgcolor: '#181818',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        border: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        boxShadow: 'none',
        margin: 0,
        padding: 0,
        pl: 0,
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Divider sx={{ bgcolor: '#333', my: 2 }} />
        <Box sx={{ flex: 1, overflowY: 'auto', px: 0 }}>
          {/* Projects Section */}
          <Box sx={{ color: '#bbb', fontSize: 11, fontWeight: 700, letterSpacing: 1, mb: 1.5, mt: 2, px: 1, textTransform: 'uppercase' }}>
            Projects
          </Box>
          <List sx={{ p: 0, pl: 0 }}>
            <ListItem
              button
              onClick={onNewProjectClick}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 1,
                color: '#fff',
                fontWeight: 500,
                '&:hover': { bgcolor: '#232323' },
              }}
            >
              <ListItemIcon sx={{ color: '#ff9800', minWidth: 32 }}><AddIcon /></ListItemIcon>
              <ListItemText primary={<span style={{fontWeight: 500}}>New project</span>} />
            </ListItem>
          </List>
          {/* Today Section */}
          <Box sx={{ color: '#bbb', fontSize: 11, fontWeight: 700, letterSpacing: 1, mb: 1, mt: 3, px: 1, textTransform: 'uppercase' }}>
            Today
          </Box>
          <List sx={{ p: 0, pl: 0 }}>
            {projects.filter(p => p.group === 'today').length === 0 ? (
              <ListItem>
                <ListItemText primary={<span style={{ color: '#888', fontStyle: 'italic' }}>No projects today</span>} />
              </ListItem>
            ) : (
              projects.filter(p => p.group === 'today').map(project => (
                <ListItem
                  button
                  key={project.id}
                  selected={selectedProject?.id === project.id}
                  onClick={() => onProjectSelect(project)}
                  sx={{
                    bgcolor: selectedProject?.id === project.id ? '#232323' : 'inherit',
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1.5,
                    py: 1,
                    color: '#fff',
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#232323' },
                  }}
                >
                  <ListItemText primary={project.name} />
                </ListItem>
              ))
            )}
          </List>
          {/* Yesterday Section */}
          <Box sx={{ color: '#bbb', fontSize: 11, fontWeight: 700, letterSpacing: 1, mb: 1, mt: 3, px: 1, textTransform: 'uppercase' }}>
            Yesterday
          </Box>
          <List sx={{ p: 0, pl: 0 }}>
            {projects.filter(p => p.group === 'yesterday').length === 0 ? (
              <ListItem>
                <ListItemText primary={<span style={{ color: '#888', fontStyle: 'italic' }}>No projects yesterday</span>} />
              </ListItem>
            ) : (
              projects.filter(p => p.group === 'yesterday').map(project => (
                <ListItem
                  button
                  key={project.id}
                  selected={selectedProject?.id === project.id}
                  onClick={() => onProjectSelect(project)}
                  sx={{
                    bgcolor: selectedProject?.id === project.id ? '#232323' : 'inherit',
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1.5,
                    py: 1,
                    color: '#fff',
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#232323' },
                  }}
                >
                  <ListItemText primary={project.name} />
                </ListItem>
              ))
            )}
          </List>
          {/* Previous 7 Days Section */}
          <Box sx={{ color: '#bbb', fontSize: 11, fontWeight: 700, letterSpacing: 1, mb: 1, mt: 3, px: 1, textTransform: 'uppercase' }}>
            Previous 7 Days
          </Box>
          <List sx={{ p: 0, pl: 0 }}>
            {projects.filter(p => p.group === 'previous7').length === 0 ? (
              <ListItem>
                <ListItemText primary={<span style={{ color: '#888', fontStyle: 'italic' }}>No projects</span>} />
              </ListItem>
            ) : (
              projects.filter(p => p.group === 'previous7').map(project => (
                <ListItem
                  button
                  key={project.id}
                  selected={selectedProject?.id === project.id}
                  onClick={() => onProjectSelect(project)}
                  sx={{
                    bgcolor: selectedProject?.id === project.id ? '#232323' : 'inherit',
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1.5,
                    py: 1,
                    color: '#fff',
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#232323' },
                  }}
                >
                  <ListItemText primary={project.name} />
                </ListItem>
              ))
            )}
          </List>
        </Box>
        <Divider sx={{ bgcolor: '#333', my: 1 }} />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: '#424242' }}>
              <PersonIcon />
            </Avatar>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              User
            </Typography>
          </Box>
          <Button variant="text" sx={{ color: '#bbb', minWidth: 0, p: 1 }}>
            <SettingsIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar; 