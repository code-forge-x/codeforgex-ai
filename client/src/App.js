import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';
import { Box } from '@mui/material';

// Import components with correct naming
import Login from './components/auth/Login'; // This should import the default export from Login.js
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';

function AppContent() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/dashboard');
  const isDashboard = location.pathname.startsWith('/dashboard');
  return (
    <>
      {showNavbar && <Navbar />}
      {isDashboard ? (
        <Routes>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      ) : (
        <div className="container">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'row',
            margin: 0,
            padding: 0,
            bgcolor: '#181818',
            overflow: 'hidden',
            mr: 2
          }}
        >
          <AppContent />
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;