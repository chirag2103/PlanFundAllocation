import React from 'react';
import { useAuth } from '../context/AuthContext';
import FacultyDashboard from '../components/Dashboard/FacultyDashboard';
import CoordinatorDashboard from '../components/Dashboard/CoordinatorDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'faculty':
        return <FacultyDashboard />;
      case 'coordinator':
        return <CoordinatorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className='dashboard'>
      <div className='page-title'>
        <h2>Dashboard</h2>
        <p>Welcome back, {user?.name}!</p>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
