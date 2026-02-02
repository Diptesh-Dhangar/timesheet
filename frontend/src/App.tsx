import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TimesheetList from './pages/TimesheetList';
import TimesheetForm from './pages/TimesheetForm';
import TimeOffList from './pages/TimeOffList';
import TimeOffForm from './pages/TimeOffForm';
import ManagerTimesheetReview from './pages/ManagerTimesheetReview';
import ManagerTimeOffReview from './pages/ManagerTimeOffReview';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated || user?.role !== 'manager') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/timesheets" element={
              <ProtectedRoute>
                <Layout>
                  <TimesheetList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/timesheets/new" element={
              <ProtectedRoute>
                <Layout>
                  <TimesheetForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/timesheets/:id" element={
              <ProtectedRoute>
                <Layout>
                  <TimesheetForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/time-off" element={
              <ProtectedRoute>
                <Layout>
                  <TimeOffList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/time-off/new" element={
              <ProtectedRoute>
                <Layout>
                  <TimeOffForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/manager/timesheets" element={
              <ManagerRoute>
                <Layout>
                  <ManagerTimesheetReview />
                </Layout>
              </ManagerRoute>
            } />
            <Route path="/manager/time-off" element={
              <ManagerRoute>
                <Layout>
                  <ManagerTimeOffReview />
                </Layout>
              </ManagerRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
