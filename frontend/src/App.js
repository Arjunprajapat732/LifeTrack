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
import PatientReportsIndex from './pages/patient/reports/index';
import PatientReportDetail from './pages/patient/reports/detail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-gradient-bg">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
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
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
