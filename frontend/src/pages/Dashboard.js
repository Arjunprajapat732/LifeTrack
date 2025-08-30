import React from 'react';
import { useAuth } from '../context/AuthContext';
import CaregiverDashboard from './CaregiverDashboard';
import PatientDashboard from './PatientDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Render different dashboard based on user role
  if (user?.role === 'caregiver') {
    return <CaregiverDashboard />;
  } else if (user?.role === 'patient') {
    return <PatientDashboard />;
  } else {
    // Default dashboard for admin or fallback
    return <CaregiverDashboard />;
  }
};

export default Dashboard;
