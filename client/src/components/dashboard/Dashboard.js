import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import UserDashboard from './user/UserDashboard';
import DeveloperDashboard from './developer/DeveloperDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'developer':
        return <DeveloperDashboard />;
      case 'user':
      default:
        return <UserDashboard />;
    }
  };
  
  return (
    <div className="dashboard-container">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;