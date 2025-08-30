import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ReportsIndex from './pages/caregiver/reports/index';
import ReportDetail from './pages/caregiver/reports/detail';
import CaregiverTaskCalendarPage from './pages/caregiver/TaskCalendarPage';
import PatientReportsIndex from './pages/patient/reports/index';
import PatientReportDetail from './pages/patient/reports/detail';
import PatientTaskCalendarPage from './pages/patient/TaskCalendarPage';
import HealthHistory from './pages/patient/HealthHistory';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddPatient from './pages/caregiver/AddPatient';


function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-gradient-bg">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route 
              path="caregiver/add-patient" 
              element={
                <ProtectedRoute>
                  <AddPatient />
                </ProtectedRoute>
              } 
            />
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="admin" element={<AdminLogin />} />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="caregiver/reports" 
              element={
                <ProtectedRoute>
                  <ReportsIndex />
                </ProtectedRoute>
              } 
            />
             <Route 
               path="caregiver/task-calendar" 
               element={
                 <ProtectedRoute>
                   <CaregiverTaskCalendarPage />
                 </ProtectedRoute>
               } 
             />
            <Route 
              path="caregiver/reports/detail/:reportId" 
              element={
                <ProtectedRoute>
                  <ReportDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="patient/reports" 
              element={
                <ProtectedRoute>
                  <PatientReportsIndex />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="patient/reports/detail/:reportId" 
              element={
                <ProtectedRoute>
                  <PatientReportDetail />
                </ProtectedRoute>
              } 
            />
             <Route 
               path="patient/task-calendar" 
               element={
                 <ProtectedRoute>
                   <PatientTaskCalendarPage />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="patient/health-history" 
               element={
                 <ProtectedRoute>
                   <HealthHistory />
                 </ProtectedRoute>
               } 
             />
          </Route>
      <Route path="admin/dashboard" element={<AdminDashboard />} />
    </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
