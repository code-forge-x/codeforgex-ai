import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Box } from '@mui/material';

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', minWidth: '100vw', bgcolor: '#181818' }}>
      <Sidebar />
      <Box sx={{ flex: 1, bgcolor: '#fff', position: 'relative', overflow: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
} 