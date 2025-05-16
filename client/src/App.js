import React from 'react';
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

function AppContent() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/admin/dashboard');
  const isUserDashboard = location.pathname.startsWith('/dashboard');
  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');
  const isImportUtility = location.pathname === '/import-utility';

  return (
    <>
      {showNavbar && <Navbar />}
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
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;