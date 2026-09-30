import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HelpModal from './components/HelpModal';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewAssessment from './pages/NewAssessment';
import AssessmentResult from './pages/AssessmentResult';
import AssessmentHistory from './pages/AssessmentHistory';
import CropLibrary from './pages/CropLibrary';
import CropDetail from './pages/CropDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Verifying session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setHelpOpen(true)}
      />
      <div className="main-content">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="page-body">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crops" element={<CropLibrary />} />
            <Route path="/crops/:id" element={<CropDetail />} />
            <Route path="/new-assessment" element={<NewAssessment />} />
            <Route path="/assessment/:id" element={<AssessmentResult />} />
            <Route path="/history" element={<AssessmentHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
