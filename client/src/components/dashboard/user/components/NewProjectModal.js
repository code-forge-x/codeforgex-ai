import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

const NewProjectModal = ({ onClose, onCreateProject }) => {
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (projectData.name.trim() && projectData.description.trim()) {
      onCreateProject(projectData);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" PaperProps={{ sx: { bgcolor: '#232323', color: '#fff', borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#181818', color: '#fff', pb: 1 }}>
        Create New Project
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Project Name"
            variant="filled"
            fullWidth
            value={projectData.name}
            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
            required
            InputProps={{ sx: { bgcolor: '#292929', color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#bbb' } }}
          />
          <TextField
            label="Description"
            variant="filled"
            fullWidth
            multiline
            minRows={3}
            value={projectData.description}
            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
            required
            InputProps={{ sx: { bgcolor: '#292929', color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#bbb' } }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#181818', p: 2 }}>
          <Button onClick={onClose} sx={{ color: '#bbb' }}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: '#ff9800', color: '#fff', borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#fb8c00' } }}
            disabled={!projectData.name.trim() || !projectData.description.trim()}
          >
            Create Project
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default NewProjectModal; 