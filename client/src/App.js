import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';
import PromptManagementDashboard from './components/dashboard/admin/PromptManagementDashboard';
import UserDashboard from './components/dashboard/user/UserDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import Prompts from './components/dashboard/user/Prompts';
import ComponentsDashboard from './components/dashboard/admin/ComponentsDashboard';
import TemplateImportUtility from './components/dashboard/components/TemplateImportUtility';
// Import components with correct naming
import Login from './components/auth/Login'; // This should import the default export from Login.js
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/dashboard/admin/AdminLayout';

// MUI imports
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { NotificationProvider } from './context/NotificationContext';

function AppContent({ toggleTheme, mode }) {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/admin/dashboard');
  const isUserDashboard = location.pathname.startsWith('/dashboard');
  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');
  const isImportUtility = location.pathname === '/import-utility';

  return (
    <>
      {showNavbar && <Navbar toggleTheme={toggleTheme} mode={mode} />}
      {(isUserDashboard || isAdminDashboard) ? (
        <Routes>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/dashboard/prompts" element={
            <PrivateRoute>
              <Prompts />
            </PrivateRoute>
          } />
          {/* Admin routes with layout */}
          <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="prompts" element={<PromptManagementDashboard />} />
            <Route path="components" element={<ComponentsDashboard />} />
          </Route>
        </Routes>
      ) : isImportUtility ? (
        <TemplateImportUtility />
      ) : (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </Container>
      )}
    </>
  );
}

function App() {
  const [mode, setMode] = useState('dark');
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1976d2',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#fafafa',
        paper: mode === 'dark' ? '#1e1e1e' : '#fff',
      },
    },
  }), [mode]);

  const toggleTheme = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <AppContent toggleTheme={toggleTheme} mode={mode} />
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;