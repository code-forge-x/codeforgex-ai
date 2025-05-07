import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PromptTemplateForm from './PromptTemplateForm';

const placeholderTemplates = [
  {
    id: '1',
    name: 'MT5 Code Generation',
    description: 'Generates MQL5 code for MetaTrader 5.',
    status: 'active',
    updatedAt: '2024-06-01',
  },
  {
    id: '2',
    name: 'Financial Blueprint',
    description: 'Creates financial trading blueprints.',
    status: 'inactive',
    updatedAt: '2024-05-28',
  },
];

export default function PromptTemplateList() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const filtered = placeholderTemplates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (template = null) => {
    setSelectedTemplate(template);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <Box sx={{ width: '100%', m: 0, p: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, width: '100%' }}>
        <TextField
          label="Search templates"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, maxWidth: 300 }}
        />
        <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ ml: 2, whiteSpace: 'nowrap' }}>
          New Prompt Template
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ width: '100%', m: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(template => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.description}</TableCell>
                <TableCell>
                  <Chip
                    label={template.status}
                    color={template.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{template.updatedAt}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(template)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <PromptTemplateForm open={open} onClose={handleClose} template={selectedTemplate} />
    </Box>
  );
} 