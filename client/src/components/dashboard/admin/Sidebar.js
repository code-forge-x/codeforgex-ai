import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ExtensionIcon from '@mui/icons-material/Extension';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/dashboard/users' },
  { text: 'Prompt Management', icon: <FormatListBulletedIcon />, path: '/admin/dashboard/prompts' },
  { text: 'Components', icon: <ExtensionIcon />, path: '/admin/dashboard/components' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/dashboard/settings' }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Admin Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 